// lint-integrity.mjs — Consistency invariant checker for Archon Protocol.
// Verifies CI-1 through CI-9 from docs/kernel/doc-integrity.md.
// Exit code 0 = all invariants hold, 1 = violations found.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DOCS = path.join(ROOT, "docs");

function norm(p) {
  return p.replace(/\\/g, "/");
}

function listMd(subdir) {
  const dir = path.join(DOCS, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "index.md")
    .map((f) => f.replace(".md", ""));
}

function readFile(relPath) {
  const abs = path.join(ROOT, relPath);
  return fs.existsSync(abs) ? fs.readFileSync(abs, "utf-8") : null;
}

const violations = [];
function fail(id, msg) {
  violations.push({ id, msg });
  console.log(`  ❌ ${id}: ${msg}`);
}
function pass(id, msg) {
  console.log(`  ✅ ${id}: ${msg}`);
}

const driverFiles = listMd("drivers");
const syscallFiles = listMd("syscalls");
const daemonFiles = listMd("daemons");

const kernel = readFile(".cursor/rules/archon-kernel.md") || "";

// ---------------------------------------------------------------------------
// CI-1: Driver count in kernel = file count in docs/drivers/
// ---------------------------------------------------------------------------
const kernelDriverRows = (kernel.match(/\| `archon-[^`]+` \|/g) || []).length;
const driverTableMatches = kernel.match(/\| `archon-[\w-]+` \| `docs\/drivers\//g) || [];
const kernelDriverCount = driverTableMatches.length;

if (kernelDriverCount === driverFiles.length) {
  pass("CI-1", `driver count matches: ${driverFiles.length}`);
} else {
  fail("CI-1", `kernel lists ${kernelDriverCount} drivers, docs/drivers/ has ${driverFiles.length}`);
}

// ---------------------------------------------------------------------------
// CI-2: Syscall count in kernel = file count in docs/syscalls/
// ---------------------------------------------------------------------------
const kernelSyscallMatches = kernel.match(/\| `\/archon-[\w-]+` \|/g) || [];
const kernelSyscallCount = kernelSyscallMatches.length;

if (kernelSyscallCount === syscallFiles.length) {
  pass("CI-2", `syscall count matches: ${syscallFiles.length}`);
} else {
  fail("CI-2", `kernel lists ${kernelSyscallCount} syscalls, docs/syscalls/ has ${syscallFiles.length}`);
}

// ---------------------------------------------------------------------------
// CI-3: Daemon count in kernel = file count in docs/daemons/
// ---------------------------------------------------------------------------
const kernelDaemonMatches = kernel.match(/\| `archon-[\w-]+` \| `docs\/daemons\//g) || [];
const kernelDaemonCount = kernelDaemonMatches.length;

if (kernelDaemonCount === daemonFiles.length) {
  pass("CI-3", `daemon count matches: ${daemonFiles.length}`);
} else {
  fail("CI-3", `kernel lists ${kernelDaemonCount} daemons, docs/daemons/ has ${daemonFiles.length}`);
}

// ---------------------------------------------------------------------------
// CI-4: Every name in kernel tables has a corresponding docs/ file
// ---------------------------------------------------------------------------
for (const m of kernel.matchAll(/\| `archon-([\w-]+)` \| `docs\/drivers\//g)) {
  const name = m[1];
  if (!driverFiles.includes(name)) {
    fail("CI-4", `kernel references driver "${name}" but docs/drivers/${name}.md not found`);
  }
}
for (const m of kernel.matchAll(/\| `\/archon-([\w-]+)` \|/g)) {
  const name = m[1];
  if (!syscallFiles.includes(name)) {
    fail("CI-4", `kernel references syscall "${name}" but docs/syscalls/${name}.md not found`);
  }
}
for (const m of kernel.matchAll(/\| `archon-([\w-]+)` \| `docs\/daemons\//g)) {
  const name = m[1];
  if (!daemonFiles.includes(name)) {
    fail("CI-4", `kernel references daemon "${name}" but docs/daemons/${name}.md not found`);
  }
}
const ci4Fails = violations.filter((v) => v.id === "CI-4");
if (ci4Fails.length === 0) {
  pass("CI-4", "all kernel table names resolve to docs/ files");
}

// ---------------------------------------------------------------------------
// CI-5: Every ❌ in reference/constraints.md exists in its source driver
// ---------------------------------------------------------------------------
const constraintsRef = readFile("docs/reference/constraints.md");
if (constraintsRef) {
  let ci5ok = true;
  for (const line of constraintsRef.split(/\r?\n/)) {
    if (!line.includes("❌")) continue;
    const codes = (line.match(/`([^`]+)`/g) || []).map((c) => c.replace(/`/g, ""));
    for (const driverName of driverFiles) {
      const driverContent = readFile(`docs/drivers/${driverName}.md`) || "";
      for (const code of codes) {
        if (line.includes(driverName) && !driverContent.includes(code)) {
          fail("CI-5", `"${code}" listed for ${driverName} in constraints.md but not in source`);
          ci5ok = false;
        }
      }
    }
  }
  if (ci5ok) pass("CI-5", "constraint summaries match driver sources");
} else {
  fail("CI-5", "docs/reference/constraints.md not found");
}

// ---------------------------------------------------------------------------
// CI-6: Every deployed .cursor/rules/archon-* traces to a docs/ source
// ---------------------------------------------------------------------------
const cursorRulesDir = path.join(ROOT, ".cursor", "rules");
if (fs.existsSync(cursorRulesDir)) {
  let ci6ok = true;
  for (const f of fs.readdirSync(cursorRulesDir)) {
    if (!f.startsWith("archon-") || !f.endsWith(".md")) continue;
    const content = fs.readFileSync(path.join(cursorRulesDir, f), "utf-8");
    const sourceMatch = content.match(/Source.*?:\s*`?(docs\/[\w/.-]+)`?/i)
      || content.match(/docs\/[\w/.-]+\.md/);
    if (sourceMatch) {
      const sourcePath = sourceMatch[1] || sourceMatch[0];
      if (!fs.existsSync(path.join(ROOT, sourcePath))) {
        fail("CI-6", `.cursor/rules/${f} references ${sourcePath} but file not found`);
        ci6ok = false;
      }
    }
  }
  if (ci6ok) pass("CI-6", "all deployed rules trace to docs/ sources");
} else {
  pass("CI-6", "no .cursor/rules/ directory (skip)");
}

// ---------------------------------------------------------------------------
// CI-7: docs/public/init.md lists all drivers, syscalls, daemons
// ---------------------------------------------------------------------------
const initPublic = readFile("docs/public/init.md");
if (initPublic) {
  let ci7ok = true;
  for (const d of ["code-quality", "test-sync", "async-loading", "error-handling", "handoff"]) {
    if (!initPublic.includes(d)) {
      fail("CI-7", `init.md missing driver: ${d}`);
      ci7ok = false;
    }
  }
  for (const s of ["demand", "audit", "refactor", "verifier", "lint"]) {
    if (!initPublic.includes(s)) {
      fail("CI-7", `init.md missing syscall: ${s}`);
      ci7ok = false;
    }
  }
  for (const d of ["self-auditor", "test-runner"]) {
    if (!initPublic.includes(d)) {
      fail("CI-7", `init.md missing daemon: ${d}`);
      ci7ok = false;
    }
  }
  if (ci7ok) pass("CI-7", "init.md lists all components");
} else {
  fail("CI-7", "docs/public/init.md not found");
}

// ---------------------------------------------------------------------------
// CI-9: ai-index.md lists all components (supplementary check)
// ---------------------------------------------------------------------------
const aiIndex = readFile("ai-index.md");
if (aiIndex) {
  let ci9ok = true;
  for (const s of syscallFiles) {
    if (!aiIndex.includes(`syscalls/${s}.md`)) {
      fail("CI-9", `ai-index.md missing syscall: ${s}`);
      ci9ok = false;
    }
  }
  for (const d of driverFiles) {
    if (!aiIndex.includes(`drivers/${d}.md`)) {
      fail("CI-9", `ai-index.md missing driver: ${d}`);
      ci9ok = false;
    }
  }
  if (ci9ok) pass("CI-9", "ai-index.md lists all components");
} else {
  fail("CI-9", "ai-index.md not found");
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log("");
if (violations.length === 0) {
  console.log("lint-integrity: all invariants hold ✅");
  process.exit(0);
} else {
  console.log(`lint-integrity: ${violations.length} violation(s) found ❌`);
  process.exit(1);
}
