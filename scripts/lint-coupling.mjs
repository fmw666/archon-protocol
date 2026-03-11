// lint-coupling.mjs — Git-based document coupling analyzer.
// Inspired by Nexus-skills git_detective concept, adapted for documentation projects.
// Discovers file pairs that frequently co-change in git history,
// then validates them against the documented ripple propagation graph.
// Exit code 0 = healthy, 1 = undocumented coupling found.

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DAYS = parseInt(process.argv[2] || "90", 10);
const MIN_COUPLING = parseInt(process.argv[3] || "3", 10);

// ---------------------------------------------------------------------------
// Documented propagation pairs from doc-integrity.md
// ---------------------------------------------------------------------------
const KNOWN_PROPAGATION = [
  ["docs/drivers/", "docs/reference/constraints.md"],
  ["docs/drivers/", "tests/"],
  ["docs/syscalls/", "docs/reference/commands.md"],
  ["docs/daemons/", "docs/reference/commands.md"],
  ["docs/kernel/", ".cursor/rules/archon-kernel.md"],
  ["docs/kernel/", ".cursor/rules/archon-doc-integrity.md"],
  ["docs/kernel/", "AGENTS.md"],
  // Structural change propagation
  ["docs/drivers/", "docs/drivers/index.md"],
  ["docs/drivers/", ".cursor/rules/archon-kernel.md"],
  ["docs/drivers/", "ai-index.md"],
  ["docs/drivers/", "docs/public/init.md"],
  ["docs/drivers/", "docs/syscalls/init.md"],
  ["docs/drivers/", "README.md"],
  ["docs/syscalls/", "docs/syscalls/index.md"],
  ["docs/syscalls/", ".cursor/rules/archon-kernel.md"],
  ["docs/syscalls/", "ai-index.md"],
  ["docs/syscalls/", "docs/public/init.md"],
  ["docs/syscalls/", "README.md"],
  ["docs/daemons/", "docs/daemons/index.md"],
  ["docs/daemons/", ".cursor/rules/archon-kernel.md"],
  ["docs/daemons/", "ai-index.md"],
  ["docs/daemons/", "docs/public/init.md"],
  // Reference docs trigger test updates
  ["docs/reference/", "tests/"],
];

// Hub files that naturally co-change with many files during structural changes.
// Co-changes involving these are expected and not flagged.
const HUB_FILES = [
  "AGENTS.md",
  "ai-index.md",
  "README.md",
  "docs/index.md",
  "docs/zh/index.md",
];

// Deployed artifacts are derived from docs/ sources.
// agents/* ← docs/syscalls/* or docs/daemons/*
// skills/* ← docs/drivers/* or docs/syscalls/*
// Co-changes between deployed copies and their sources (or each other) are expected.
const DEPLOY_PREFIXES = ["agents/", "skills/", ".cursor/rules/", ".cursor/agents/", ".claude/"];

function norm(p) {
  return p.replace(/\\/g, "/");
}

function isDocFile(f) {
  return f.endsWith(".md") || f.endsWith(".mjs") || f.endsWith(".js");
}

function getCommitFilePairs() {
  let raw;
  try {
    raw = execSync(
      `git log --since="${DAYS} days ago" --name-only --pretty=format:"---COMMIT---" --diff-filter=ACMR`,
      { cwd: ROOT, encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
    );
  } catch {
    console.log("⚠️  Git history not available or too short. Skipping coupling analysis.");
    process.exit(0);
  }

  const commits = raw
    .split("---COMMIT---")
    .map((block) =>
      block
        .split(/\r?\n/)
        .map((l) => norm(l.trim()))
        .filter((l) => l && isDocFile(l))
    )
    .filter((files) => files.length >= 2);

  return commits;
}

function buildCouplingMap(commits) {
  const pairCount = new Map();

  for (const files of commits) {
    const unique = [...new Set(files)].sort();
    for (let i = 0; i < unique.length; i++) {
      for (let j = i + 1; j < unique.length; j++) {
        const key = `${unique[i]}|||${unique[j]}`;
        pairCount.set(key, (pairCount.get(key) || 0) + 1);
      }
    }
  }

  return [...pairCount.entries()]
    .filter(([, count]) => count >= MIN_COUPLING)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => {
      const [a, b] = key.split("|||");
      return { fileA: a, fileB: b, count };
    });
}

function isHubFile(f) {
  return HUB_FILES.some((h) => f === h || f.endsWith("/" + h));
}

function isDeployArtifact(f) {
  return DEPLOY_PREFIXES.some((p) => f.startsWith(p));
}

function isPairDocumented(fileA, fileB) {
  if (isHubFile(fileA) || isHubFile(fileB)) return true;

  if (isDeployArtifact(fileA) || isDeployArtifact(fileB)) return true;

  for (const [pattern, target] of KNOWN_PROPAGATION) {
    const patternMatchesA = fileA.startsWith(pattern) || fileA === pattern.replace(/\/$/, "");
    const patternMatchesB = fileB.startsWith(pattern) || fileB === pattern.replace(/\/$/, "");
    const targetMatchesA = fileA === target || fileA.startsWith(target.replace(/\/$/, ""));
    const targetMatchesB = fileB === target || fileB.startsWith(target.replace(/\/$/, ""));

    if ((patternMatchesA && targetMatchesB) || (patternMatchesB && targetMatchesA)) {
      return true;
    }
  }

  if (path.dirname(fileA) === path.dirname(fileB)) return true;

  return false;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
console.log(`\nlint-coupling: analyzing git history (last ${DAYS} days, threshold: ${MIN_COUPLING} co-changes)\n`);

const commits = getCommitFilePairs();

if (commits.length === 0) {
  console.log("  ℹ️  No qualifying commits found. Skipping.");
  process.exit(0);
}

const coupledPairs = buildCouplingMap(commits);

if (coupledPairs.length === 0) {
  console.log("  ℹ️  No significant coupling pairs found.");
  process.exit(0);
}

console.log(`  Found ${coupledPairs.length} coupled pair(s):\n`);

const undocumented = [];

for (const { fileA, fileB, count } of coupledPairs) {
  const documented = isPairDocumented(fileA, fileB);
  const status = documented ? "✅" : "⚠️";
  console.log(`  ${status} [${count}x] ${fileA}  ↔  ${fileB}`);
  if (!documented) {
    undocumented.push({ fileA, fileB, count });
  }
}

console.log("");

if (undocumented.length > 0) {
  console.log(`lint-coupling: ${undocumented.length} undocumented coupling pair(s) ⚠️`);
  console.log("  These files frequently co-change but are NOT in the ripple propagation graph.");
  console.log("  Consider: add to doc-integrity.md propagation table, or investigate if coupling is accidental.\n");
  process.exit(1);
} else {
  console.log("lint-coupling: all coupling pairs documented ✅");
  process.exit(0);
}
