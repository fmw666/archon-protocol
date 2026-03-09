import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join, resolve } from "path";

const SKILLS_DIR = join(resolve(__dirname, ".."), "skills");

function collectSkills() {
  if (!existsSync(SKILLS_DIR)) return [];
  return readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const skillPath = join(SKILLS_DIR, d.name, "SKILL.md");
      return {
        name: d.name,
        path: skillPath,
        exists: existsSync(skillPath),
        content: existsSync(skillPath) ? readFileSync(skillPath, "utf-8") : "",
      };
    });
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const yaml = match[1];
  const result = {};
  let currentKey = null;
  let currentValue = "";

  for (const line of yaml.split(/\r?\n/)) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (kv) {
      if (currentKey) result[currentKey] = currentValue.trim();
      currentKey = kv[1];
      const val = kv[2].replace(/^["'>]\s*/, "").replace(/["']$/, "");
      currentValue = val;
    } else if (currentKey && /^\s+/.test(line)) {
      currentValue += " " + line.trim();
    }
  }
  if (currentKey) result[currentKey] = currentValue.trim();
  return result;
}

const skills = collectSkills();

describe("Skill Format (SKILL.md standard)", () => {
  it("should find at least 10 skills", () => {
    expect(skills.length).toBeGreaterThanOrEqual(10);
  });

  describe.each(skills)("$name", ({ name, exists, content }) => {
    it("has a SKILL.md file", () => {
      expect(exists).toBe(true);
    });

    it("has valid YAML frontmatter", () => {
      const fm = parseFrontmatter(content);
      expect(fm).not.toBeNull();
    });

    it("has required 'name' field matching directory name", () => {
      const fm = parseFrontmatter(content);
      expect(fm?.name).toBe(name);
    });

    it("has required 'description' field (>20 chars)", () => {
      const fm = parseFrontmatter(content);
      expect(fm?.description).toBeTruthy();
      expect(fm.description.length).toBeGreaterThan(20);
    });

    it("body is under 5000 tokens (~20KB) per SKILL.md spec", () => {
      const body = content.replace(/^---[\s\S]*?---/, "").trim();
      const sizeKB = Buffer.byteLength(body, "utf-8") / 1024;
      expect(sizeKB).toBeLessThan(20);
    });

    it("contains no CJK characters", () => {
      const cjk = content.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/g);
      expect(cjk).toBeNull();
    });

    it("has actionable steps (numbered lists, checkboxes, or step headings)", () => {
      const hasNumbered = /^\d+\./m.test(content);
      const hasCheckboxes = /- \[ \]/.test(content);
      const hasSteps = /##\s+(Step|Stage|Phase|Dimension|Workflow)/m.test(content);
      const hasProhibitions = /❌/.test(content);
      expect(hasNumbered || hasCheckboxes || hasSteps || hasProhibitions).toBe(true);
    });
  });
});
