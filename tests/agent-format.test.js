import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join, resolve } from "path";

const AGENTS_DIR = join(resolve(__dirname, ".."), "agents");

function collectAgents() {
  if (!existsSync(AGENTS_DIR)) return [];
  return readdirSync(AGENTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const path = join(AGENTS_DIR, f);
      const content = readFileSync(path, "utf-8");
      return { name: f.replace(".md", ""), path, content };
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

const agents = collectAgents();

describe("Agent Format (Cursor + Claude Code compatible)", () => {
  it("should find at least 7 agents", () => {
    expect(agents.length).toBeGreaterThanOrEqual(7);
  });

  describe.each(agents)("$name", ({ name, content }) => {
    it("has valid YAML frontmatter", () => {
      const fm = parseFrontmatter(content);
      expect(fm).not.toBeNull();
    });

    it("has 'name' field matching filename", () => {
      const fm = parseFrontmatter(content);
      expect(fm?.name).toBe(name);
    });

    it("has 'description' field (>20 chars)", () => {
      const fm = parseFrontmatter(content);
      expect(fm?.description).toBeTruthy();
      expect(fm.description.length).toBeGreaterThan(20);
    });

    it("has a markdown body with instructions", () => {
      const body = content.replace(/^---[\s\S]*?---/, "").trim();
      expect(body.length).toBeGreaterThan(50);
    });

    it("contains no CJK characters", () => {
      const cjk = content.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/g);
      expect(cjk).toBeNull();
    });

    it("has actionable steps", () => {
      const hasSteps = /##\s+(Step|Stage|Phase|Dimension)/m.test(content);
      const hasNumbered = /^\d+\./m.test(content);
      const hasCheckboxes = /- \[ \]/.test(content);
      expect(hasSteps || hasNumbered || hasCheckboxes).toBe(true);
    });
  });
});
