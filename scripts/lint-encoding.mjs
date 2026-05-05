// lint-encoding.mjs — Mojibake detector for Archon Protocol docs.
// Catches files that were written through a non-UTF-8 codepage (e.g.,
// PowerShell Add-Content without -Encoding UTF8) and now contain
// double-decoded byte sequences masquerading as content.
//
// Heuristic: count code points in the Latin-1 supplement block
// (U+0080..U+00FF) per file. Real translations contain at most a few
// such characters from legitimate punctuation (×, ·, ©, é, …). Files
// that crossed a wrong-codepage boundary contain hundreds — typically
// 5%+ of the file — because every Chinese character was re-encoded as
// 2-3 latin-1 supplement code points.
//
// Exit code 0 = all clean, 1 = mojibake detected.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, "docs");

// Files whose mojibake share crosses this percentage are flagged.
// Empirically chosen: clean docs sit at 0-1.3%; the only false-positive
// pattern is heavy use of "·" (U+00B7) as a separator. Real corruption
// reaches 14%+. 1.5% is the safe gap.
const MOJIBAKE_PCT_THRESHOLD = 1.5;

// Absolute count floor: avoid flagging tiny files where a single
// stray latin-1 char would push the percentage above the threshold.
const MOJIBAKE_MIN_COUNT = 20;

// Directories to scan. Excludes static assets (docs/public/) which
// hosts third-party media + READMEs that are not site routes, and
// the build output (docs/.vitepress/dist/).
const SCAN_GLOBS = [
  "docs/zh",
  "docs/.vitepress/locales",
  "docs/.vitepress/theme",
];

if (!fs.existsSync(DOCS_DIR) || !fs.statSync(DOCS_DIR).isDirectory()) {
  console.error("lint-encoding: missing docs/ directory; run from repo root.");
  process.exit(1);
}

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && entry.name !== ".vitepress") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "dist" || entry.name === "node_modules") continue;
      out.push(...walk(full));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function norm(p) {
  return p.replace(/\\/g, "/");
}

function isTextFile(abs) {
  return /\.(md|mdx|ts|tsx|js|mjs|vue|json|yaml|yml)$/i.test(abs);
}

function analyze(abs) {
  const buf = fs.readFileSync(abs);

  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return { hasBOM: true, latin1Count: 0, totalChars: 0, pct: 0 };
  }

  const text = buf.toString("utf8");
  let latin1Count = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0x80 && code <= 0xff) latin1Count++;
  }

  const totalChars = text.length;
  const pct = totalChars > 0 ? (100 * latin1Count) / totalChars : 0;

  return { hasBOM: false, latin1Count, totalChars, pct };
}

const offenders = [];
const bomFiles = [];
let checked = 0;

for (const glob of SCAN_GLOBS) {
  const dir = path.join(ROOT, glob);
  for (const abs of walk(dir)) {
    if (!isTextFile(abs)) continue;
    checked++;
    const rel = norm(path.relative(ROOT, abs));
    const { hasBOM, latin1Count, totalChars, pct } = analyze(abs);

    if (hasBOM && /\.(ts|tsx|js|mjs|vue|json)$/i.test(abs)) {
      bomFiles.push({ file: rel });
      continue;
    }

    if (
      pct >= MOJIBAKE_PCT_THRESHOLD &&
      latin1Count >= MOJIBAKE_MIN_COUNT
    ) {
      offenders.push({
        file: rel,
        latin1Count,
        totalChars,
        pct: pct.toFixed(2),
      });
    }
  }
}

console.log(
  `lint-encoding: scanned ${checked} text files across ${SCAN_GLOBS.length} directories`,
);

if (bomFiles.length > 0) {
  console.log(
    `lint-encoding: ${bomFiles.length} module file(s) carry a UTF-8 BOM (TS/JS/JSON modules should not have BOM):`,
  );
  for (const item of bomFiles) {
    console.log(`  ${item.file} (UTF-8 BOM)`);
  }
}

console.log(
  `lint-encoding: ${offenders.length} file(s) above ${MOJIBAKE_PCT_THRESHOLD}% latin-1 supplement char ratio (mojibake suspect)`,
);
for (const item of offenders) {
  console.log(
    `  ${item.file}: ${item.latin1Count}/${item.totalChars} chars = ${item.pct}%`,
  );
}

const failed = offenders.length + bomFiles.length;
process.exit(failed > 0 ? 1 : 0);
