// lint-links.mjs — Internal link auditor for Archon Protocol docs.
// Exit code 0 = all links valid, 1 = broken links found.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, "docs");

if (!fs.existsSync(DOCS_DIR) || !fs.statSync(DOCS_DIR).isDirectory()) {
  console.error("lint-links: missing docs/ directory; run from repo root.");
  process.exit(1);
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

function norm(p) {
  return p.replace(/\\/g, "/");
}

function normalizeRoute(p) {
  const stripped = p.replace(/^\/+|\/+$/g, "");
  return stripped ? `/${stripped}` : "/";
}

function stripInlineCode(text) {
  return text.replace(/`[^`]+`/g, "");
}

const allFiles = walk(DOCS_DIR);
const relAllFiles = new Set(allFiles.map((abs) => norm(path.relative(DOCS_DIR, abs))));

const markdownFiles = allFiles.filter((abs) => /\.(md|mdx)$/i.test(abs));
const routes = new Set();

for (const abs of markdownFiles) {
  const rel = norm(path.relative(DOCS_DIR, abs));
  const slug = rel.replace(/\.(md|mdx)$/i, "");
  routes.add(normalizeRoute(slug));
  if (slug.endsWith("/index")) {
    routes.add(normalizeRoute(slug.slice(0, -"/index".length)));
  }
}

const markdownLinkRegex = /!?\[[^\]]*\]\(([^)]+)\)/g;
const broken = [];
let checked = 0;

for (const abs of markdownFiles) {
  const rel = norm(path.relative(DOCS_DIR, abs));
  const baseDir = norm(path.dirname(rel));
  const rawText = fs.readFileSync(abs, "utf8");
  const lines = rawText.split("\n");

  let inCodeFence = false;
  let inFrontmatter = false;
  let frontmatterDone = false;

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    let line = lines[lineNum];

    if (lineNum === 0 && line.trim() === "---") {
      inFrontmatter = true;
      continue;
    }
    if (inFrontmatter) {
      if (line.trim() === "---") {
        inFrontmatter = false;
        frontmatterDone = true;
      }
      continue;
    }

    if (line.trim().startsWith("```")) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;

    line = stripInlineCode(line);

    for (const match of line.matchAll(markdownLinkRegex)) {
      const raw = match[1]?.trim();
      if (!raw) continue;
      if (/^(https?:|mailto:|tel:|data:|#)/i.test(raw)) continue;

      const [pathPart] = raw.split("#");
      const clean = pathPart.split("?")[0];
      if (!clean) continue;
      checked++;

      if (clean.startsWith("/")) {
        const route = normalizeRoute(clean);
        if (!routes.has(route)) {
          const staticRel = route.replace(/^\//, "");
          if (!relAllFiles.has(staticRel)) {
            broken.push({ file: rel, line: lineNum + 1, link: raw, reason: "route not found" });
          }
        }
        continue;
      }

      if (!clean.startsWith(".") && !clean.includes("/")) continue;

      const normalizedRel = norm(path.normalize(path.join(baseDir, clean)));

      if (/\.[a-zA-Z0-9]+$/.test(normalizedRel)) {
        if (!relAllFiles.has(normalizedRel)) {
          broken.push({ file: rel, line: lineNum + 1, link: raw, reason: "relative file not found" });
        }
        continue;
      }

      const candidates = [
        normalizedRel,
        `${normalizedRel}.md`,
        `${normalizedRel}.mdx`,
        `${normalizedRel}/index.md`,
        `${normalizedRel}/index.mdx`,
      ];

      if (!candidates.some((c) => relAllFiles.has(c))) {
        broken.push({ file: rel, line: lineNum + 1, link: raw, reason: "relative target not found" });
      }
    }
  }
}

console.log(`lint-links: checked ${checked} internal links across ${markdownFiles.length} files`);
console.log(`lint-links: broken ${broken.length}`);

for (const item of broken) {
  console.log(`  ${item.file}:${item.line} → ${item.link} (${item.reason})`);
}

process.exit(broken.length > 0 ? 1 : 0);
