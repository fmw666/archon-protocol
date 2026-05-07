#!/usr/bin/env python3
"""Portable Archon governance contract checker.

Uses only the Python standard library. The contract file is JSON-compatible
YAML, so adopters do not need PyYAML just to run the baseline guard.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any


def read_text(root: Path, rel_path: str) -> str:
    path = root / rel_path
    fallback: Path | None = None
    if not path.exists() and rel_path.endswith(".mdc"):
        fallback = root / f"{rel_path[:-4]}.md"
        if fallback.exists():
            path = fallback
    if not path.exists():
        tried = f"{path}"
        if fallback is not None:
            tried = f"{path} or {fallback}"
        raise FileNotFoundError(f"missing contract file {rel_path!r} (tried {tried})")
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return handle.read()


def line_count(text: str) -> int:
    return len(text.split("\n"))


def normalize_anchor(value: str) -> str:
    value = re.sub(r"^[#§]+\s*", "", value)
    value = re.sub(r"\s*\(.*\)\s*$", "", value)
    return value.strip().lower()


def headings_of(content: str) -> set[str]:
    headings: set[str] = set()
    for line in content.splitlines():
        match = re.match(r"^#{2,6}\s+(.+)$", line.rstrip("\r"))
        if match:
            headings.add(normalize_anchor(match.group(1)))
    return headings


def parse_current_drift(drift: str) -> int:
    match = re.search(r"\*\*drift:\s*(\d+)\*\*", drift)
    if not match:
        raise AssertionError("drift.md is missing a `**drift: N**` current value")
    return int(match.group(1))


def last_table_row(markdown: str) -> str:
    rows = [line for line in markdown.splitlines() if line.strip().startswith("|")]
    for row in reversed(rows):
        if not re.match(r"^\|\s*-+", row) and not re.match(r"^\|\s*Date\s*\|", row):
            return row
    return ""


def review_row_regex(keywords: list[str]) -> str:
    alternation = "|".join(re.escape(keyword) for keyword in keywords)
    return rf"\|\s*[^|]*?\|\s*(?:\*\*)?(?:{alternation})"


def json_list_between_markers(content: str, marker: str) -> list[str]:
    pattern = (
        rf"<!--\s*{re.escape(marker)}:start\s*-->\s*"
        r"```json\s*"
        r"(\[[\s\S]*?\])"
        r"\s*```\s*"
        rf"<!--\s*{re.escape(marker)}:end\s*-->"
    )
    match = re.search(pattern, content)
    if not match:
        raise AssertionError(f"missing JSON list marker block: {marker}")
    values = json.loads(match.group(1))
    if not isinstance(values, list) or not all(isinstance(value, str) and value for value in values):
        raise AssertionError(f"marker block {marker} must contain a JSON list of non-empty strings")
    return values


def literal_token_pattern(token: str) -> re.Pattern[str]:
    return re.compile(rf"(^|[^A-Za-z0-9_]){re.escape(token)}(?=$|[^A-Za-z0-9_])")


def files_for_guard_path(root: Path, rel_path: str) -> list[Path]:
    path = root / rel_path
    fallback: Path | None = None
    if not path.exists() and rel_path.endswith(".mdc"):
        fallback = root / f"{rel_path[:-4]}.md"
        if fallback.exists():
            path = fallback
    if not path.exists():
        raise FileNotFoundError(f"missing universal module guard path: {rel_path!r}")
    if path.is_dir():
        text_suffixes = {".json", ".md", ".mdc", ".mjs", ".py", ".sh", ".yaml", ".yml"}
        return sorted(child for child in path.rglob("*") if child.is_file() and child.suffix in text_suffixes)
    return [path]


def default_output_block(content: str) -> str:
    match = re.search(r"## Default Output\s*```text\s*([\s\S]*?)\s*```", content)
    if not match:
        raise AssertionError("lens must include a Default Output text block")
    return match.group(1)


def has_budget_safe_tool_template(default_output: str, max_tools: int) -> bool:
    normalized = default_output.lower()
    return "selected" in normalized and (
        "max_tools_per_delivery" in normalized or f"max {max_tools}" in normalized
    )


def is_domain_lens_slug(value: str) -> bool:
    return re.fullmatch(r"[a-z][a-z0-9-]*", value) is not None


def is_domain_lens_tool_id(value: str) -> bool:
    return re.fullmatch(r"[a-z][a-z0-9-]*/[a-z][a-z0-9-]*", value) is not None


def expected_lens_file(lens_id: str) -> str:
    return f"lenses/{lens_id}.md"


def assert_nonempty_limited_text(value: Any, label: str, max_chars: int) -> None:
    if not isinstance(value, str) or not value.strip():
        raise AssertionError(f"{label} must be non-empty text")
    if len(value) > max_chars:
        raise AssertionError(f"{label} exceeds {max_chars} characters")


def assert_file_budgets(root: Path, contract: dict[str, Any]) -> None:
    for rel_path, budget in contract["file_budgets"].items():
        content = read_text(root, rel_path)
        lines = line_count(content)
        limit = int(budget["limit"])
        if lines > limit:
            raise AssertionError(f"{rel_path}: {lines} lines exceeds budget {limit}. {budget['hint']}")


def assert_critical_substrings(root: Path, contract: dict[str, Any]) -> None:
    for rule in contract["critical_rule_substrings"]:
        content = read_text(root, rule["file"])
        if rule["substring"] not in content:
            raise AssertionError(
                f"{rule['file']}: missing critical substring {rule['substring']!r}. {rule['rationale']}"
            )


def assert_forbidden_substrings(root: Path, contract: dict[str, Any]) -> None:
    forbidden = contract.get("forbidden_substrings")
    if not forbidden:
        return

    files = list(forbidden.get("files", []))
    optional_files = list(forbidden.get("optional_files", []))
    substrings = list(forbidden.get("substrings", []))
    violations: list[str] = []

    for rel_path in files:
        content = read_text(root, rel_path)
        lowered = content.lower()
        for phrase in substrings:
            if phrase.lower() in lowered:
                violations.append(f"{rel_path}: forbidden substring {phrase!r}")

    for rel_path in optional_files:
        full_path = root / rel_path
        if not full_path.exists():
            continue
        lowered = full_path.read_text(encoding="utf-8").lower()
        for phrase in substrings:
            if phrase.lower() in lowered:
                violations.append(f"{rel_path}: forbidden substring {phrase!r}")

    if violations:
        raise AssertionError("Forbidden governance wording found:\n  " + "\n  ".join(violations))


def assert_convergence_gate(root: Path, contract: dict[str, Any]) -> None:
    gate = contract["convergence_gate"]
    manifest = read_text(root, ".archon/manifest.md")
    scope_line = next((line for line in manifest.splitlines() if gate["manifest_scope_marker"] in line), "")
    if "DEBT-" not in scope_line:
        return
    demand = read_text(root, ".cursor/commands/archon-demand.md")
    for substring in gate["required_demand_substrings"]:
        if substring not in demand:
            raise AssertionError(
                f"manifest declares Convergence scope but archon-demand.md lacks {substring!r}"
            )


def assert_drift_gate(root: Path, contract: dict[str, Any]) -> None:
    gate = contract["drift_gate"]
    drift = read_text(root, ".archon/drift.md")
    current = parse_current_drift(drift)
    tail = last_table_row(drift)
    reset_row_regex = review_row_regex(gate["reset_row_keywords"])
    full_or_emergency_reset_regex = review_row_regex(gate["full_or_emergency_reset_keywords"])

    for section in gate.get("required_hot_sections", []):
        if section not in drift:
            raise AssertionError(f"drift.md hot index must contain {section}")

    archive_rel = gate.get("archive_dir", ".archon/drift/archive")
    if re.search(rf"^\|\s*`?{re.escape(archive_rel)}/", drift, re.M):
        archive_dir = root / archive_rel
        if not archive_dir.exists():
            raise AssertionError(f"missing drift archive directory: {archive_dir.relative_to(root)}")
        archive_files = sorted(archive_dir.glob("*.md"))
        if not archive_files:
            raise AssertionError("drift archive directory must contain at least one markdown archive")
        for archive_file in archive_files:
            body = archive_file.read_text(encoding="utf-8")
            for heading in gate.get("required_archive_headings", []):
                if heading not in body:
                    rel = archive_file.relative_to(root)
                    raise AssertionError(f"{rel} must contain archive heading {heading!r}")

    if current >= int(gate["thresholds"]["emergency"]) and not re.search(reset_row_regex, tail, re.I):
        raise AssertionError(f"drift={current} is above emergency threshold without trailing review reset row")

    if current >= int(gate["thresholds"]["full"]) and not re.search(full_or_emergency_reset_regex, tail, re.I):
        raise AssertionError(f"drift={current} is above full threshold without trailing Full/Emergency reset row")


def table_rows_after_heading(markdown: str, heading: str) -> list[str]:
    lines = markdown.splitlines()
    start = None
    for index, line in enumerate(lines):
        if line.strip() == heading:
            start = index + 1
            break
    if start is None:
        return []
    rows: list[str] = []
    for line in lines[start:]:
        if line.startswith("## "):
            break
        if not line.strip().startswith("|"):
            continue
        if re.match(r"^\|\s*-+", line) or re.match(r"^\|\s*(?:Date|Archive|ID)\s*\|", line):
            continue
        rows.append(line)
    return rows


def assert_memos_archive(root: Path, contract: dict[str, Any]) -> None:
    memos_contract = contract.get("memos_archive")
    if not memos_contract:
        return

    memos = read_text(root, ".archon/memos.md")
    for section in memos_contract["required_hot_sections"]:
        if section not in memos:
            raise AssertionError(f"memos.md hot index must contain {section}")

    hot_rows = table_rows_after_heading(memos, "## Hot Memos")
    max_entries = int(memos_contract["max_hot_entries"])
    if len(hot_rows) > max_entries:
        raise AssertionError(f"memos.md has {len(hot_rows)} hot entries; max is {max_entries}")

    max_chars = int(memos_contract["max_hot_row_chars"])
    long_rows = [row for row in hot_rows if len(row) > max_chars]
    if long_rows:
        raise AssertionError(f"memos.md hot rows must stay <= {max_chars} chars")

    archive_rel = memos_contract["archive_dir"]
    archive_rows = table_rows_after_heading(memos, "## Archive Index")
    if any(archive_rel in row for row in archive_rows):
        archive_dir = root / archive_rel
        if not archive_dir.exists():
            raise AssertionError(f"missing memos archive directory: {archive_dir.relative_to(root)}")
        archive_files = sorted(archive_dir.glob("*.md"))
        if not archive_files:
            raise AssertionError("memos archive directory must contain at least one markdown archive")

        for archive_file in archive_files:
            body = archive_file.read_text(encoding="utf-8")
            for marker in memos_contract["required_archive_markers"]:
                if marker not in body:
                    rel = archive_file.relative_to(root)
                    raise AssertionError(f"{rel} must contain archive marker {marker!r}")


def markdown_table_header_after_heading(markdown: str, heading: str) -> list[str]:
    lines = markdown.splitlines()
    start = None
    for index, line in enumerate(lines):
        if line.strip() == heading:
            start = index + 1
            break
    if start is None:
        return []
    for line in lines[start:]:
        if line.startswith("## "):
            return []
        if line.strip().startswith("|") and not re.match(r"^\|\s*-+", line):
            return [cell.strip() for cell in line.strip().strip("|").split("|")]
    return []


def assert_debt_archive(root: Path, contract: dict[str, Any]) -> None:
    debt_contract = contract.get("debt_archive")
    if not debt_contract:
        return

    debt = read_text(root, ".archon/debt.md")
    for section in debt_contract["required_hot_sections"]:
        if section not in debt:
            raise AssertionError(f"debt.md hot index must contain {section}")

    header = markdown_table_header_after_heading(debt, "## Active Debt Index")
    if header != debt_contract["required_hot_columns"]:
        raise AssertionError(f"debt.md Active Debt Index columns changed: {header}")

    hot_rows = table_rows_after_heading(debt, "## Active Debt Index")
    if not hot_rows:
        if "<!-- no-active-debt -->" in debt:
            return
        raise AssertionError("debt.md must contain at least one active debt row or an explicit no-debt marker")

    max_chars = int(debt_contract["max_hot_row_chars"])
    archive_rel = debt_contract["archive_dir"]
    for row in hot_rows:
        cells = [cell.strip() for cell in row.strip().strip("|").split("|")]
        if len(cells) != len(debt_contract["required_hot_columns"]):
            raise AssertionError(f"debt.md hot row must have {len(debt_contract['required_hot_columns'])} cells: {row}")
        if not re.fullmatch(r"DEBT-\d+", cells[0]):
            raise AssertionError(f"debt.md hot row has invalid debt id: {cells[0]!r}")
        if len(row) > max_chars:
            raise AssertionError(f"debt.md hot rows must stay <= {max_chars} chars")
        if archive_rel not in cells[-1]:
            raise AssertionError(f"debt.md hot row must point to {archive_rel}: {cells[0]}")

    archive_rows = table_rows_after_heading(debt, "## Archive Index")
    if any(archive_rel in row for row in archive_rows):
        archive_dir = root / archive_rel
        if not archive_dir.exists():
            raise AssertionError(f"missing debt archive directory: {archive_dir.relative_to(root)}")
        archive_files = sorted(archive_dir.glob("*.md"))
        if not archive_files:
            raise AssertionError("debt archive directory must contain at least one markdown archive")
        for archive_file in archive_files:
            body = archive_file.read_text(encoding="utf-8")
            for marker in debt_contract["required_archive_markers"]:
                if marker not in body:
                    rel = archive_file.relative_to(root)
                    raise AssertionError(f"{rel} must contain archive marker {marker!r}")


def assert_manifest_archive(root: Path, contract: dict[str, Any]) -> None:
    manifest_contract = contract.get("manifest_archive")
    if not manifest_contract:
        return

    manifest = read_text(root, ".archon/manifest.md")
    latest_review_lines = [
        line for line in manifest.splitlines() if line.startswith("- **Latest review ")
    ]
    archive_rel = manifest_contract["archive_dir"]
    archive_dir = root / archive_rel
    if not latest_review_lines and not archive_dir.exists():
        return
    if len(latest_review_lines) != 1:
        raise AssertionError("manifest.md must contain exactly one Latest review hot summary row")

    latest_review = latest_review_lines[0]
    max_chars = int(manifest_contract["max_latest_review_chars"])
    if len(latest_review) > max_chars:
        raise AssertionError(f"manifest.md Latest review hot summary must stay <= {max_chars} chars")

    if archive_rel not in latest_review:
        raise AssertionError(f"manifest.md Latest review must point to {archive_rel}")

    if not archive_dir.exists():
        raise AssertionError(f"missing manifest archive directory: {archive_dir.relative_to(root)}")
    archive_files = sorted(archive_dir.glob("*.md"))
    if not archive_files:
        raise AssertionError("manifest archive directory must contain at least one markdown archive")

    for archive_file in archive_files:
        body = archive_file.read_text(encoding="utf-8")
        for marker in manifest_contract["required_archive_markers"]:
            if marker not in body:
                rel = archive_file.relative_to(root)
                raise AssertionError(f"{rel} must contain archive marker {marker!r}")


def assert_soul_anchors(root: Path, contract: dict[str, Any]) -> None:
    soul_files = {
        "soul.md": read_text(root, ".archon/soul.md"),
        "soul/delivery.md": read_text(root, ".archon/soul/delivery.md"),
        "soul/review.md": read_text(root, ".archon/soul/review.md"),
    }
    headings = {name: headings_of(body) for name, body in soul_files.items()}
    skip = set(contract["soul_anchor"]["skip_anchors"])
    pattern = re.compile(r"soul(?:/(?:delivery|review))?\.md\s+§([^\s`\"'(),.;\n—–·:][^`\"'(),.;\n—–·:]*)")
    missing: list[str] = []

    for rel_path in contract["soul_anchor"]["source_files"]:
        full = root / rel_path
        if not full.exists():
            continue
        body = full.read_text(encoding="utf-8")
        for match in pattern.finditer(body):
            raw = match.group(0)
            file_key_match = re.search(r"soul(?:/(?:delivery|review))?\.md", raw)
            if not file_key_match:
                continue
            file_key = file_key_match.group(0)
            anchor = normalize_anchor(match.group(1))
            if anchor in skip:
                continue
            if anchor not in headings.get(file_key, set()):
                missing.append(f"{rel_path}: {file_key} §{match.group(1).strip()}")

    for item in contract["soul_anchor"]["required_extension_loads"]:
        body = read_text(root, item["command"])
        if item["substring"] not in body:
            missing.append(f"{item['command']}: missing {item['substring']}")

    if missing:
        raise AssertionError("Broken soul anchors:\n  " + "\n  ".join(missing))


def assert_export_manifest(root: Path, contract: dict[str, Any]) -> None:
    export = contract["export_manifest"]
    for rel_path in export["required_files"]:
        if not (root / rel_path).exists():
            raise AssertionError(f"missing export contract file: {rel_path}")


def assert_repo_self_check(root: Path, contract: dict[str, Any]) -> None:
    """Run conditional repository self-check rules.

    These rules apply ONLY when the relevant trigger file exists at the
    project root. Adopter projects that never received the corresponding
    asset via the manifest skip the rules silently.

    Sub-blocks are independent: the docs_self_check fires only inside the
    archon-protocol source repository (which dogfoods this checker on its
    own VitePress site); the husky_self_check fires only on adopter
    projects that wired the optional husky pre-commit hook.
    """
    repo = contract.get("repo_self_check")
    if not repo:
        return

    docs = repo.get("docs_self_check")
    if docs:
        trigger = docs.get("trigger_path", "docs/archon")
        if (root / trigger).exists():
            _run_docs_self_check(root, docs)

    husky = repo.get("husky_self_check")
    if husky:
        trigger = husky.get("trigger_path", ".husky/pre-commit")
        if (root / trigger).exists():
            _run_husky_self_check(root, husky)


def _run_docs_self_check(root: Path, docs: dict[str, Any]) -> None:
    for rel_path, budget in docs.get("file_budgets", {}).items():
        content = read_text(root, rel_path)
        lines = line_count(content)
        limit = int(budget["limit"])
        if lines > limit:
            raise AssertionError(f"{rel_path}: {lines} lines exceeds budget {limit}. {budget['hint']}")

    for rel_path in docs.get("required_files", []):
        if not (root / rel_path).exists():
            raise AssertionError(f"missing repo self-check file: {rel_path}")

    setup_mentions = docs.get("required_setup_mentions", [])
    readme_mentions = docs.get("required_readme_mentions", [])
    if setup_mentions:
        setup = read_text(root, "docs/archon/setup.md")
        for mention in setup_mentions:
            if mention not in setup:
                raise AssertionError(f"docs/archon/setup.md must mention {mention}")
    if readme_mentions:
        readme = read_text(root, "docs/archon/README.md")
        for mention in readme_mentions:
            if mention not in readme:
                raise AssertionError(f"docs/archon/README.md must mention {mention}")


def _run_husky_self_check(root: Path, husky: dict[str, Any]) -> None:
    for rule in husky.get("critical_substrings", []):
        content = read_text(root, rule["file"])
        if rule["substring"] not in content:
            raise AssertionError(
                f"{rule['file']}: missing critical substring {rule['substring']!r}. {rule['rationale']}"
            )
    for rule in husky.get("optional_critical_substrings", []):
        rel_path = rule["file"]
        if not (root / rel_path).exists():
            continue
        content = read_text(root, rel_path)
        if rule["substring"] not in content:
            raise AssertionError(
                f"{rel_path}: missing critical substring {rule['substring']!r}. {rule['rationale']}"
            )


def assert_universal_module_guard(root: Path, contract: dict[str, Any]) -> None:
    guard = contract.get("universal_module_guard")
    if not guard:
        return

    forbidden_terms = json_list_between_markers(
        read_text(root, guard["forbidden_terms_source"]),
        guard["forbidden_terms_marker"],
    )
    patterns = [(term, literal_token_pattern(term)) for term in forbidden_terms]
    for rel_path in guard["scan_paths"]:
        for path in files_for_guard_path(root, rel_path):
            body = path.read_text(encoding="utf-8")
            for term, pattern in patterns:
                if pattern.search(body):
                    rel = path.relative_to(root)
                    raise AssertionError(f"{rel} must not mention project-specific or stack-specific term: {term}")
    for rel_path in guard.get("optional_scan_paths", []):
        if not (root / rel_path).exists():
            continue
        for path in files_for_guard_path(root, rel_path):
            body = path.read_text(encoding="utf-8")
            for term, pattern in patterns:
                if pattern.search(body):
                    rel = path.relative_to(root)
                    raise AssertionError(f"{rel} must not mention project-specific or stack-specific term: {term}")


def assert_domain_lenses(root: Path, contract: dict[str, Any]) -> None:
    if "domain_lenses" not in contract:
        return

    domain_lenses = contract["domain_lenses"]
    registry_path = domain_lenses["registry"]
    registry = json.loads(read_text(root, registry_path))
    defaults = registry.get("defaults", {})
    if int(defaults.get("max_tools_per_delivery", 999)) > int(domain_lenses["max_tools_per_delivery"]):
        raise AssertionError("domain lens registry max_tools_per_delivery exceeds contract")
    if int(defaults.get("preferred_tools_per_delivery", 999)) > int(domain_lenses["preferred_tools_per_delivery"]):
        raise AssertionError("domain lens registry preferred_tools_per_delivery exceeds contract")
    if int(defaults.get("max_tools_per_lens", 999)) > int(domain_lenses["max_tools_per_lens"]):
        raise AssertionError("domain lens registry max_tools_per_lens exceeds contract")
    if defaults.get("tool_selection") != domain_lenses.get("tool_selection"):
        raise AssertionError("domain lens registry tool_selection must match contract")
    if defaults.get("conflict_policy") != domain_lenses.get("conflict_policy"):
        raise AssertionError("domain lens registry conflict_policy must match contract")
    if "max_total_load_lines" in domain_lenses:
        contract_max = int(domain_lenses["max_total_load_lines"])
        registry_max = int(defaults.get("max_total_load_lines", -1))
        if registry_max <= 0:
            raise AssertionError("domain lens registry must declare defaults.max_total_load_lines")
        if registry_max != contract_max:
            raise AssertionError(
                f"domain lens registry max_total_load_lines={registry_max} does not match contract={contract_max}"
            )
        registry_pref = int(defaults.get("preferred_total_load_lines", -1))
        contract_pref = int(domain_lenses.get("preferred_total_load_lines", -1))
        if registry_pref <= 0 or registry_pref > registry_max:
            raise AssertionError("domain lens registry preferred_total_load_lines must be 0<pref<=max")
        if registry_pref != contract_pref:
            raise AssertionError(
                f"domain lens registry preferred_total_load_lines={registry_pref} does not match contract={contract_pref}"
            )
        registry_tol = int(defaults.get("load_lines_tolerance", -1))
        contract_tol = int(domain_lenses.get("load_lines_tolerance_percent", -1))
        if registry_tol <= 0 or registry_tol >= 50:
            raise AssertionError("domain lens registry load_lines_tolerance must be 0<tol<50 percent")
        if registry_tol != contract_tol:
            raise AssertionError(
                f"domain lens registry load_lines_tolerance={registry_tol} does not match contract={contract_tol}"
            )
    conflict_policy = str(domain_lenses.get("conflict_policy", ""))
    for label, path in [
        ("domain lens README", domain_lenses["readme"]),
        ("archon-demand command", ".cursor/commands/archon-demand.md"),
    ]:
        if conflict_policy not in read_text(root, path):
            raise AssertionError(f"{label} must mention domain lens conflict_policy: {conflict_policy}")
    forbidden_terms = json_list_between_markers(
        read_text(root, domain_lenses["forbidden_universal_terms_source"]),
        domain_lenses["forbidden_universal_terms_marker"],
    )
    for path in (root / ".archon/domain-lenses").rglob("*"):
        if path.is_file():
            body = path.read_text(encoding="utf-8")
            for term in forbidden_terms:
                if term in body:
                    rel = path.relative_to(root)
                    raise AssertionError(f"{rel} must not mention project-specific or stack-specific term: {term}")

    lenses = registry.get("lenses", {})
    for lens_id in domain_lenses.get("required_initial_lenses", []):
        if lens_id not in lenses:
            raise AssertionError(f"domain lens registry missing required initial lens: {lens_id}")

    tool_owners: dict[str, str] = {}
    registered_tools: list[str] = []
    registered_lens_files: list[str] = []
    for lens_id, lens in lenses.items():
        if not is_domain_lens_slug(lens_id):
            raise AssertionError(f"domain lens id must be a lowercase slug: {lens_id}")
        lens_file = lens.get("lens")
        if isinstance(lens_file, str):
            registered_lens_files.append(lens_file)
        for tool in lens.get("tools", []):
            registered_tools.append(tool)
            if not is_domain_lens_tool_id(tool):
                raise AssertionError(f"tool id must be a lowercase <lens>/<tool> slug: {tool}")
            if not tool.startswith(f"{lens_id}/"):
                raise AssertionError(f"tool {tool} must be namespaced under its lens: {lens_id}/")
            if tool in tool_owners:
                raise AssertionError(f"tool {tool} is registered by multiple lenses: {tool_owners[tool]} and {lens_id}")
            tool_owners[tool] = lens_id

    lens_files = sorted(
        str(path.relative_to(root / ".archon/domain-lenses")).replace("\\", "/")
        for path in (root / ".archon/domain-lenses/lenses").glob("*.md")
    )
    if sorted(registered_lens_files) != lens_files:
        raise AssertionError(
            "domain lens files must match registry lenses: "
            f"registry={sorted(registered_lens_files)} files={lens_files}"
        )

    tool_files = sorted(
        str(path.relative_to(root / ".archon/domain-lenses/tools")).replace("\\", "/").removesuffix(".md")
        for path in (root / ".archon/domain-lenses/tools").rglob("*.md")
    )
    if sorted(registered_tools) != tool_files:
        raise AssertionError(
            "domain lens tool files must match registry tools: "
            f"registry={sorted(registered_tools)} files={tool_files}"
        )

    tool_index = registry.get("tool_index", [])
    if not isinstance(tool_index, list):
        raise AssertionError("domain lens registry tool_index must be a list")
    indexed_tools: list[str] = []
    for index, entry in enumerate(tool_index):
        if not isinstance(entry, dict):
            raise AssertionError(f"tool_index[{index}] must be an object")
        tool_id = entry.get("id")
        if not isinstance(tool_id, str):
            raise AssertionError(f"tool_index[{index}].id must be text")
        if not is_domain_lens_tool_id(tool_id):
            raise AssertionError(f"tool_index id must be a lowercase <lens>/<tool> slug: {tool_id}")
        indexed_tools.append(tool_id)
        assert_nonempty_limited_text(
            entry.get("description"),
            f"tool_index[{tool_id}].description",
            int(domain_lenses["tool_index_description_max_chars"]),
        )
        assert_nonempty_limited_text(
            entry.get("when_to_use"),
            f"tool_index[{tool_id}].when_to_use",
            int(domain_lenses["tool_index_when_to_use_max_chars"]),
        )
        assert_nonempty_limited_text(
            entry.get("load_hint"),
            f"tool_index[{tool_id}].load_hint",
            int(domain_lenses["tool_index_load_hint_max_chars"]),
        )
        load_lines = entry.get("load_lines")
        if not isinstance(load_lines, int) or load_lines <= 0:
            raise AssertionError(
                f"tool_index[{tool_id}].load_lines must be a positive integer (Reasoning Skills line-budget primitive)"
            )
        tool_path = root / ".archon/domain-lenses/tools" / f"{tool_id}.md"
        if tool_path.exists():
            text = tool_path.read_text(encoding="utf-8")
            parts = text.split("\n")
            live = len(parts) - 1 if parts and parts[-1] == "" else len(parts)
            tolerance_pct = int(defaults.get("load_lines_tolerance", 10))
            allowed = max(2, (live * tolerance_pct + 99) // 100)
            if abs(load_lines - live) > allowed:
                raise AssertionError(
                    f"tool_index[{tool_id}].load_lines={load_lines} drifted from live wc -l={live} "
                    f"(allowed={allowed} per {tolerance_pct}% tolerance); re-sync registry.yaml after editing the tool card"
                )
    if indexed_tools != registered_tools:
        raise AssertionError("domain lens tool_index ids must match registered tools in registry order")

    for lens_id, lens in lenses.items():
        signals = lens.get("signals", [])
        if len(signals) < 3:
            raise AssertionError(f"domain lens {lens_id} must declare at least three classifier signals")
        if len(set(signals)) != len(signals):
            raise AssertionError(f"domain lens {lens_id} classifier signals must be unique")
        lens_file = lens.get("lens")
        if lens_file != expected_lens_file(lens_id):
            raise AssertionError(f"domain lens {lens_id} must use lens path {expected_lens_file(lens_id)}")
        if not lens_file or not (root / ".archon/domain-lenses" / lens_file).exists():
            raise AssertionError(f"domain lens {lens_id} references missing lens file: {lens_file}")
        tools = lens.get("tools", [])
        if len(tools) > int(domain_lenses["max_tools_per_lens"]):
            raise AssertionError(f"domain lens {lens_id} exceeds max_tools_per_lens")
        lens_body = read_text(root, f".archon/domain-lenses/{lens_file}")
        max_tools_per_delivery = int(domain_lenses["max_tools_per_delivery"])
        default_output = default_output_block(lens_body)
        foreign_tools = [tool for tool, owner in tool_owners.items() if owner != lens_id and tool in default_output]
        if foreign_tools:
            raise AssertionError(
                f"domain lens {lens_id} Default Output references tools from another lens: {foreign_tools}"
            )
        selected_by_default = [tool for tool in tools if tool in default_output]
        if len(selected_by_default) > max_tools_per_delivery:
            raise AssertionError(
                f"domain lens {lens_id} Default Output selects {len(selected_by_default)} tools, "
                f"exceeding max_tools_per_delivery={domain_lenses['max_tools_per_delivery']}"
            )
        if tools and not selected_by_default and not has_budget_safe_tool_template(default_output, max_tools_per_delivery):
            raise AssertionError(
                f"domain lens {lens_id} Default Output must include full tool IDs within budget "
                "or a budget-safe selected-tool template"
            )
        for tool in tools:
            tool_file = root / ".archon/domain-lenses/tools" / f"{tool}.md"
            if not tool_file.exists():
                raise AssertionError(f"domain lens {lens_id} references missing tool: {tool}")
            body = tool_file.read_text(encoding="utf-8")
            if f"Domain: {lens_id}" not in body:
                raise AssertionError(f"tool {tool} must declare Domain: {lens_id}")
            for required in [
                "cannot call other tools",
                "cannot create lifecycle gates",
                "cannot override soul",
            ]:
                if required not in body.lower():
                    raise AssertionError(f"tool {tool} must state: {required}")


def assert_run_state(root: Path, contract: dict[str, Any]) -> None:
    run_state = contract["run_state"]
    for item in run_state["required_static_checks"]:
        if item.get("optional") and not (root / item["file"]).exists():
            continue
        content = read_text(root, item["file"])
        if item["substring"] not in content:
            raise AssertionError(f"{item['file']} must contain {item['substring']!r}")

    runs_dir = root / run_state.get("runs_dir", ".archon/runs")
    if runs_dir.exists():
        for state_file in runs_dir.glob("*/state.json"):
            try:
                state = json.loads(state_file.read_text(encoding="utf-8"))
            except json.JSONDecodeError as exc:
                raise AssertionError(f"{state_file.relative_to(root)} is not valid JSON: {exc}") from exc
            if state.get("schemaVersion") != 2:
                raise AssertionError(f"{state_file.relative_to(root)} must declare schemaVersion=2")
            if not isinstance(state.get("status"), dict):
                raise AssertionError(f"{state_file.relative_to(root)} must contain a status object")
            missing_keys = [key for key in run_state.get("status_keys", []) if key not in state["status"]]
            if missing_keys:
                raise AssertionError(
                    f"{state_file.relative_to(root)} is missing status keys: " + ", ".join(missing_keys[:5])
                )
            invalid = [
                f"{key}={value}"
                for key, value in state["status"].items()
                if not isinstance(value, str) or not re.match(r"^(?:0|1|2|skip:[a-z0-9-]+)$", value)
            ]
            if invalid:
                raise AssertionError(
                    f"{state_file.relative_to(root)} has invalid status values: " + ", ".join(invalid[:5])
                )
            pending = [
                key
                for key, value in state["status"].items()
                if not (value in {"1", "2"} or re.match(r"^skip:[a-z0-9-]+$", value))
            ]
            if state.get("permitCommit") is True and pending:
                raise AssertionError(
                    f"{state_file.relative_to(root)} has permitCommit=true but pending status keys: "
                    + ", ".join(pending[:5])
                )

    active = root / run_state["active_file"]
    if not active.exists():
        return

    content = active.read_text(encoding="utf-8")
    normalized = content.replace("\r\n", "\n")
    single_block = run_state.get("single_block", {})
    front_matter_delimiter_count = len(re.findall(r"^---$", normalized, re.M))
    permit_commit_count = len(re.findall(r"^permit_commit:\s*[01]\s*$", normalized, re.M))
    sop_table_header_count = len(re.findall(r"^\|\s*Phase\s*\|\s*Variable\s*\|\s*Status\s*\|$", normalized, re.M))
    if front_matter_delimiter_count != int(single_block.get("front_matter_delimiter_count", 2)):
        raise AssertionError(
            f"{run_state['active_file']} must contain exactly one YAML front matter block; "
            "extra delimiters suggest a stale prior-delivery tail"
        )
    if permit_commit_count != int(single_block.get("permit_commit_count", 1)):
        raise AssertionError(
            f"{run_state['active_file']} must contain exactly one permit_commit line; "
            "multiple permit gates suggest run-state contamination"
        )
    if sop_table_header_count != int(single_block.get("sop_table_header_count", 1)):
        raise AssertionError(
            f"{run_state['active_file']} must contain exactly one SOP status table; "
            "multiple tables suggest a stale prior-delivery tail"
        )

    lines = line_count(content)
    limit = int(run_state["line_budget"])
    if lines > limit:
        raise AssertionError(f"{run_state['active_file']} is {lines} lines, exceeds budget {limit}")

    front = re.search(r"^---\n([\s\S]*?)\n---", normalized)
    if not front:
        raise AssertionError(f"{run_state['active_file']} must start with YAML front matter")
    for key in run_state["front_matter_keys"]:
        if f"{key}:" not in front.group(1):
            raise AssertionError(f"{run_state['active_file']} front matter must declare {key}")

    if not re.search(r"^permit_commit:\s*[01]\s*$", content, re.M):
        raise AssertionError(f"{run_state['active_file']} must contain permit_commit: 0|1")

    allowed = set(run_state["smart_skip_allowed"])
    for phase, variable in re.findall(r"\|\s*(\w+)\s*\|\s*(\w+)\s*\|\s*2\s*\|", content):
        row = f"{phase}.{variable}"
        if row not in allowed:
            raise AssertionError(f"smart-skip status=2 is not allowed on {row}")


def git_changed_files(root: Path) -> list[str]:
    try:
        tracked = subprocess.run(
            ["git", "diff", "--name-only", "HEAD", "--"],
            cwd=root,
            check=True,
            capture_output=True,
            text=True,
        )
        untracked = subprocess.run(
            ["git", "ls-files", "--others", "--exclude-standard"],
            cwd=root,
            check=True,
            capture_output=True,
            text=True,
        )
    except Exception:
        return []
    combined = f"{tracked.stdout}\n{untracked.stdout}"
    return [line.replace("\\", "/") for line in combined.splitlines() if line.strip()]


def assert_blink_dispatch(root: Path, contract: dict[str, Any]) -> None:
    blink = contract["blink_dispatch"]
    for item in blink["required_static_checks"]:
        content = read_text(root, item["file"])
        if item["substring"] not in content:
            raise AssertionError(f"{item['file']} must contain Blink Dispatch substring {item['substring']!r}")

    skill = read_text(root, blink["skill"])
    for reason in blink["allowed_skip_reasons"]:
        if reason not in skill:
            raise AssertionError(f"{blink['skill']} must list allowed skip reason {reason}")

    project_high_risk_patterns = json_list_between_markers(
        read_text(root, blink["project_high_risk_path_patterns_source"]),
        blink["project_high_risk_path_patterns_marker"],
    )
    high_risk_patterns = [
        re.compile(pattern) for pattern in [*blink["high_risk_path_patterns"], *project_high_risk_patterns]
    ]
    risky = [path for path in git_changed_files(root) if any(pattern.search(path) for pattern in high_risk_patterns)]

    def assert_no_high_risk_skip(status: str, source: str) -> None:
        if not status.startswith("skip:") or not risky:
            return
        raise AssertionError(
            f"Blink Dispatch marked {source} {blink['run_state_row']}={status}, but high-risk files changed: "
            + ", ".join(risky)
        )

    runs_dir = root / contract["run_state"].get("runs_dir", ".archon/runs")
    if runs_dir.exists():
        for state_file in runs_dir.glob("*/state.json"):
            try:
                state = json.loads(state_file.read_text(encoding="utf-8"))
            except json.JSONDecodeError as exc:
                raise AssertionError(f"{state_file.relative_to(root)} is not valid JSON: {exc}") from exc
            status = state.get("status", {}).get(blink["run_state_row"])
            if isinstance(status, str):
                assert_no_high_risk_skip(status, str(state_file.relative_to(root)))

    active = root / contract["run_state"]["active_file"]
    if not active.exists():
        return

    run_text = active.read_text(encoding="utf-8").replace("\r\n", "\n")
    row_pattern = rf"\|\s*closeout\s*\|\s*{re.escape(blink['run_state_row'].split('.', 1)[1])}\s*\|\s*([^|]+?)\s*\|"
    row = re.search(row_pattern, run_text)
    if row:
        assert_no_high_risk_skip(row.group(1).strip(), contract["run_state"]["active_file"])


def run(root: Path) -> None:
    contract_path = root / ".archon/contracts/governance-contract.yaml"
    contract = json.loads(contract_path.read_text(encoding="utf-8"))
    assert_file_budgets(root, contract)
    assert_critical_substrings(root, contract)
    assert_forbidden_substrings(root, contract)
    assert_convergence_gate(root, contract)
    assert_drift_gate(root, contract)
    assert_memos_archive(root, contract)
    assert_debt_archive(root, contract)
    assert_manifest_archive(root, contract)
    assert_soul_anchors(root, contract)
    assert_export_manifest(root, contract)
    assert_universal_module_guard(root, contract)
    assert_domain_lenses(root, contract)
    assert_run_state(root, contract)
    assert_blink_dispatch(root, contract)
    assert_repo_self_check(root, contract)


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the portable Archon governance contract checks.")
    parser.add_argument("--root", default=".", help="Project root containing .archon/")
    args = parser.parse_args()
    root = Path(args.root).resolve()

    try:
        run(root)
    except Exception as exc:  # noqa: BLE001 - CLI should report all assertion/parser failures uniformly.
        print(f"[archon-check] FAIL: {exc}", file=sys.stderr)
        return 1

    print("[archon-check] OK: portable governance contract checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
