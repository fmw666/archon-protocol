# Domain Lenses

Domain Lenses focus a single Archon delivery on one professional angle without changing Archon's identity.

## Architecture

```text
User Demand
  -> Domain Classifier / Level 1: registry description index
  -> Verdict
  -> Level 2: Lens Contract / tool router (proceed only)
  -> Level 3: selected Atomic Tool Cards (proceed only)
  -> Archon Judgment
```

The classifier chooses exactly one lens. If a demand spans multiple domains, Archon decomposes it into child demands instead of mixing lenses in one delivery.

## Progressive Loading

Domain Lenses follow the same progressive disclosure shape as agent skill files:

1. **Level 1 — registry index**: `registry.yaml` is the pre-Verdict discovery index. It carries lens signals, tool membership, and each tool's short `description`, `when_to_use`, and `load_hint`. Use this metadata to classify the demand and form the smallest candidate tool set.
2. **Level 2 — lens router**: after one lens is selected, read only `lenses/<lens>.md` to apply that lens's contract, `Default Output`, and selection recipes. Defer this read until `Verdict=proceed` and fast-path is not used.
3. **Level 3 — atomic card**: read only the selected `tools/<lens>/<tool>.md` cards. Unselected tool cards stay outside the context path. Defer tool-card reads until `Verdict=proceed` and fast-path is not used.

The index must describe what a tool does and when to use it; it must not duplicate the tool card's procedure, examples, or output body.

Rejected, alternative, and fast-path deliveries should stop at Level 1 unless the rejection itself needs a Negative ADR using a Domain Lens concept.

## Classification

`registry.yaml` carries lightweight `signals` for each lens and a `tool_index` for tool discovery. The classifier uses them as hints, not as a scoring engine:

1. If one lens clearly matches the dominant user intent, select that lens.
2. If two or more lenses are equally necessary, follow `conflict_policy: decompose-on-equal-match` and split the demand into child demands.
3. If no installed lens fits, continue with `domain_lens: none`.

The classifier must never ask the user to pick a domain. Domain choice is Archon's responsibility.

## Tool Selection

Tool order in `registry.yaml` is priority order. After a lens is selected:

1. Start from the selected lens's ordered tool list.
2. Use `tool_index` descriptions to keep the smallest set that explains the delivery approach.
3. Read the selected lens router before reading any tool cards.
4. Prefer no more than the registry's preferred tool count.
5. Never exceed the registry's max tools per delivery.
6. Emit selected tools using their full registry IDs, such as `design/component-pattern`.
7. A lens `Default Output` must either list full tool IDs within `max_tools_per_delivery` or use a budget-safe selected-tool template when the full tool list would exceed the budget. Empty or vague tool output is invalid for an installed lens.

Tool selection must be explainable from the demand. Do not load a tool just because it exists.

## Load Budget

Tool counts are not the only retrieval cost. Each tool card has a different size, so a "3-tool selection" can still blow the context window if the cards are long. The registry encodes per-tool cost and a per-delivery ceiling so the selector can prefer **smallest explainable subset**, not just smallest count.

- Each `tool_index` entry declares `load_lines: <N>` — the file's hard line count, deterministic and git-checkable. Lines, not tokens, because lines are stable across tokenizers and platforms.
- `defaults.max_total_load_lines` is the hard ceiling for a single delivery's combined Level 3 tool reads. `preferred_total_load_lines` is the soft target the selector should hit first.
- `defaults.load_lines_tolerance` (percent) is the allowed drift between declared `load_lines` metadata and the live `wc -l` of the tool card. Drift beyond tolerance fails the contract test, forcing the metadata to be re-synced when a tool card grows.
- The selector MUST sum `load_lines` for its `selected_assets` and emit `total_load_lines: <sum>` in the `capability_selection` packet. Packets without `total_load_lines`, or where the sum exceeds `max_total_load_lines`, are rejected and the main agent falls back to Level 1 metadata-only routing.
- Tool count budget (`max_tools_per_delivery`) and line budget (`max_total_load_lines`) are AND-conjoined: both must hold. Tool count protects against shallow chaining; line budget protects against one over-large card eating the whole context.
- `load_lines` is NOT a quality signal — large does not mean good. When two tools cover the same reasoning step within tolerance, prefer the lower-cost one and explain the choice in `why_selected`.

This is the same idea ACL 2026 *Reasoning Skills* applies at inference time (encode reasoning steps as discrete cost-bearing skills, then chain by budget instead of regenerating the chain). Archon applies it at the file level rather than the prompt level — cards are git-tracked, costs are line-counted by the validation gate, and the selector enforces the budget mechanically.

## Capability Toolsets And Skills

Some user requests ask for reusable best-practice capability rather than a single professional focus. Examples include deployment strategy, data backend selection, state management, responsive behavior, loading feedback, skeleton screen policy, or other repeatable adoption guidance.

Use the `capability` lens for that routing problem. Its job is to map the user need to the strongest knowledge vehicle:

- **Skill**: provider, framework, API, or library practice that may contain named commands, versions, pitfalls, and examples.
- **Domain tool**: provider-agnostic decision aid that shapes one delivery's reasoning.
- **Rule or test**: enforceable project constraint that should fail fast.
- **Design plan**: one-off project adaptation when the practice is useful but not yet reusable.
- **ADR or manifest**: durable architecture rationale or project fact.

The capability lens must not turn universal tool cards into vendor manuals. If a practice needs provider-specific commands, API names, version notes, pricing assumptions, or runtime caveats, load or create a skill and let the capability lens only describe why that skill is the right asset for the current demand.

When capability routing would require reading several full skills or tool cards, the main agent may launch a generic read-only subagent as a context-budget helper. The subagent follows this selector protocol and returns a compact packet:

```text
capability_selection:
- demand_summary: <one sentence>
- selected_assets: [<skill-or-domain-tool-id>, ... max 3]
- load_order: [<asset ids in the order the main agent should read them>]
- total_load_lines: <sum of selected_assets load_lines from registry, or "n/a" only when every selected asset is a skill outside the registry>
- why_selected: <one sentence>
- rejected_assets: [<asset id>: <reason>, ...]
- project_facts_needed: [<manifest fact, source file, env blocker, validation proof>, ...]
- context_budget: <low|medium|high>
- handoff_note: <what the main agent should decide next>
```

The selector cannot output a Verdict, create lifecycle gates, launch other subagents, or implement changes. The main agent remains responsible for Verdict, execution, validation, and Close-Out.

Selector packet acceptance:

- Accept only packets with all required `capability_selection` fields present.
- Accept only if `selected_assets` contains at most 3 items and each item is a known skill or registered domain tool id.
- Accept only if `total_load_lines` is present and either (a) is a number ≤ `defaults.max_total_load_lines` and matches the sum of `load_lines` for registered domain tools in `selected_assets`, or (b) is `"n/a"` when every selected asset is a skill outside the registry. A skill+tool mixed selection MUST emit a numeric sum covering at least the registered domain tools.
- Reject the packet if it includes a Verdict, lifecycle status, implementation steps, provider API calls, secret handling, or requests to launch another subagent.
- When rejected, discard the packet and let the main agent choose from Level 1 registry metadata plus manifest/platform skill metadata directly.

Selector subagent prompt skeleton:

```text
You are a read-only capability selector. Do not edit files, call provider APIs, output a Verdict, launch subagents, or implement changes.

Demand: <one-sentence demand>
Candidate assets: <registered domain tool ids from Level 1 metadata + plausible skill ids from manifest or platform skill metadata>
Load budget: max_total_load_lines=<from registry defaults>; per-tool load_lines available in Level 1 metadata
Known project facts: <manifest facts or none>

Inspect only the minimum plausible skill/tool metadata needed to choose assets.
Return only capability_selection with demand_summary, selected_assets (max 3), load_order, total_load_lines (sum of registered tool load_lines, or "n/a" for skill-only), why_selected, rejected_assets, project_facts_needed, context_budget, and handoff_note.
```

## Boundary With Extensions

Domain Lenses and Extensions solve different problems:

- **Domain-like capability** belongs here: PM, QA, development, design, planning, architecture, creative, art, or any other professional focus.
- **Lifecycle hook capability** belongs in `.archon/extensions/`: pre-scan, close-out, review, dashboard, demand-pool, or project-local workflow hooks.

If unsure, choose Domain Lens by default. Promote to an Extension only when the capability must hook into Archon's lifecycle rather than focus a single delivery's reasoning.

## Adding a Domain

Add a new domain only after real demand shows the MVP lenses are insufficient. A complete domain addition has five parts:

1. Add one entry to `registry.yaml` with `purpose`, at least three unique `signals`, one `lens` path, and an ordered `tools` list.
2. Copy `templates/lens.md` to `lenses/<domain>.md` and fill `Classifier Signals`, `Looks At`, `Does Not Look At`, `Default Output`, and `Boundary Rule`.
3. Copy `templates/tool.md` for each atomic tool under `tools/<domain>/`; each tool declares `Domain: <domain>`, has one purpose, and includes `Do Not` constraints.
4. Keep the tool list within `max_tools_per_lens`; prefer three tools unless real demand proves more are necessary.
5. Extend the Domain Lens contract tests only when the contract itself changes; adding a normal domain should pass the existing tests without new test logic.

Do not add a domain by creating an Extension, sub-agent, command, or persona. Domain registration is always registry-first.

## Authoring Checklist

Before opening a new domain:

- Confirm the demand cannot be handled by an installed lens or by `domain_lens: none`.
- Confirm the capability focuses one delivery's reasoning; lifecycle hooks still belong in Extensions.
- Name at least three unique classifier signals before writing tools.
- Before adding a new tool card, check whether an adjacent existing atomic card can carry the capability without losing its one-purpose boundary. Prefer extending the existing card when the responsibility is the same, especially for visual explanation variants or context-budget helpers.
- Use lowercase slug IDs only: lens IDs match `design`, lens files live at `lenses/<lens>.md`, and tool IDs match `design/component-pattern`.
- Add one `tool_index` entry per registered tool with short `description`, `when_to_use`, `load_hint`, and `load_lines` fields. `load_lines` MUST equal the live `wc -l` of the tool card within `defaults.load_lines_tolerance` percent; the contract test asserts this drift on every validation gate run.

Before closing a new domain:

- Confirm `registry.yaml` is the only membership index.
- Confirm the lens `Default Output` either uses full tool IDs within `max_tools_per_delivery` or a budget-safe selected-tool template.
- Confirm every tool has one purpose and repeats the no-chain, no-lifecycle-gate, no-soul-override constraints.
- Confirm the active governance/source ratio remains inside its declared healthy band after any new file is added.
- Run the Domain Lens contract tests and the adopter's validation command.

## Invariants

- A lens is a focus filter, not a persona.
- A lens cannot override soul, technical sovereignty, quality discipline, or close-out rules.
- A delivery uses one lens at most.
- A delivery loads at most five atomic tools, with three preferred by default.
- A delivery's combined Level 3 tool reads must stay within `max_total_load_lines`; tool count and line-budget ceilings are AND-conjoined, not alternatives.
- Lens signals are hints, not weighted scores or mode flags.
- Equal lens matches must decompose; they must not blend tools from multiple lenses.
- Registry tool order is priority order for the Tool Selector.
- `tool_index` is the Level 1 discovery surface; tool cards are Level 3 and load only when selected.
- Lens and tool IDs are lowercase slugs. Lens files use `lenses/<lens>.md`; tool IDs are namespaced as `<lens>/<tool>`; a lens Default Output must not reference another lens's tools.
- Lens and tool card files must match `registry.yaml`; orphan files are invalid.
- Domain-like capabilities must not be installed as Extensions.
- New domains must be registry-first and pass the existing Domain Lens contract tests.
- Atomic tools cannot call other tools or create lifecycle gates.
- `registry.yaml` is the only index for installed lenses and tool membership.

## MVP Scope

The installed proving set began with `dev`, `design`, and `platform`; `ecosystem` was added after a real starter-system recommendation demand proved the initial set insufficient. Other domains such as PM, QA, planning, architecture, creative, and art should be added only after real demand proves the classifier and tool budget useful.
