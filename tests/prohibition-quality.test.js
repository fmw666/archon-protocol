import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join, resolve } from "path";

const SKILLS_DIR = join(resolve(__dirname, ".."), "skills");

function collectProhibitions() {
  const results = [];
  if (!existsSync(SKILLS_DIR)) return results;
  for (const dir of readdirSync(SKILLS_DIR, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    const skillPath = join(SKILLS_DIR, dir.name, "SKILL.md");
    if (!existsSync(skillPath)) continue;
    const content = readFileSync(skillPath, "utf-8");
    for (const line of content.split(/\r?\n/)) {
      if (line.trimStart().startsWith("- ❌")) {
        results.push({ skill: dir.name, line: line.trim() });
      }
    }
  }
  return results;
}

const prohibitions = collectProhibitions();

describe("Prohibition Quality", () => {
  it("should find at least 15 prohibitions across all skills", () => {
    expect(prohibitions.length).toBeGreaterThanOrEqual(15);
  });

  describe.each(prohibitions)("'$line'", ({ skill, line }) => {
    it("contains a concrete code pattern (verifiable by grep)", () => {
      const hasBacktick = /`[^`]+`/.test(line);
      const hasPattern = /\.(push|splice|skip|test|replace)\b|catch\s*\{|console\.log|alert\(|any\s|Object\s|import\s|0.*loading|API.*fail/i.test(line);
      expect(hasBacktick || hasPattern, `Prohibition in ${skill} lacks concrete pattern: ${line}`).toBe(true);
    });

    it("is not too vague (>=20 chars after ❌)", () => {
      const afterMarker = line.split("❌")[1] || "";
      expect(afterMarker.trim().length).toBeGreaterThanOrEqual(20);
    });
  });
});
