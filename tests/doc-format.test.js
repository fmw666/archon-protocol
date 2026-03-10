import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join, resolve } from "path";

const DOCS_ROOT = join(resolve(__dirname, ".."), "docs");

function collectDocs(subdir) {
  const dir = join(DOCS_ROOT, subdir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "index.md")
    .map((f) => {
      const path = join(dir, f);
      const content = readFileSync(path, "utf-8");
      return { name: f.replace(".md", ""), layer: subdir, path, content };
    });
}

const drivers = collectDocs("drivers");
const syscalls = collectDocs("syscalls");
const daemons = collectDocs("daemons");
const allDocs = [...drivers, ...syscalls, ...daemons];

describe("Document Format (docs/ hierarchy)", () => {
  it("should find at least 5 drivers", () => {
    expect(drivers.length).toBeGreaterThanOrEqual(5);
  });

  it("should find at least 6 syscalls", () => {
    expect(syscalls.length).toBeGreaterThanOrEqual(6);
  });

  it("should find at least 2 daemons", () => {
    expect(daemons.length).toBeGreaterThanOrEqual(2);
  });

  describe.each(allDocs)("$layer/$name", ({ name, layer, content }) => {
    it("has a markdown body with instructions (>50 chars)", () => {
      const body = content.replace(/^---[\s\S]*?---/, "").trim();
      expect(body.length).toBeGreaterThan(50);
    });

    it("contains no CJK characters", () => {
      const cjk = content.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/g);
      expect(cjk).toBeNull();
    });

    it("has actionable steps or prohibitions", () => {
      const hasSteps = /##\s+(Step|Stage|Phase|Dimension|Workflow)/m.test(content);
      const hasNumbered = /^\d+\./m.test(content);
      const hasCheckboxes = /- \[ \]/.test(content);
      const hasProhibitions = /❌/.test(content);
      expect(hasSteps || hasNumbered || hasCheckboxes || hasProhibitions).toBe(true);
    });

    it("is under 20KB", () => {
      const sizeKB = Buffer.byteLength(content, "utf-8") / 1024;
      expect(sizeKB).toBeLessThan(20);
    });
  });

  describe.each(drivers)("driver: $name", ({ content }) => {
    it("has at least one ❌ prohibition", () => {
      expect(content).toMatch(/❌/);
    });
  });
});
