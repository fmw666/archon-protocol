import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join, resolve } from "path";

const DRIVERS_DIR = join(resolve(__dirname, ".."), "docs", "drivers");

function collectProhibitions() {
  const results = [];
  if (!existsSync(DRIVERS_DIR)) return results;
  for (const file of readdirSync(DRIVERS_DIR).filter((f) => f.endsWith(".md") && f !== "index.md")) {
    const filePath = join(DRIVERS_DIR, file);
    const content = readFileSync(filePath, "utf-8");
    for (const line of content.split(/\r?\n/)) {
      if (line.trimStart().startsWith("- ❌")) {
        results.push({ driver: file.replace(".md", ""), line: line.trim() });
      }
    }
  }
  return results;
}

const prohibitions = collectProhibitions();

describe("Prohibition Quality", () => {
  it("should find at least 15 prohibitions across all drivers", () => {
    expect(prohibitions.length).toBeGreaterThanOrEqual(15);
  });

  describe.each(prohibitions)("'$line'", ({ driver, line }) => {
    it("contains a concrete code pattern (verifiable by grep)", () => {
      const hasBacktick = /`[^`]+`/.test(line);
      const hasPattern = /\.(push|splice|skip|test|replace)\b|catch\s*\{|console\.log|alert\(|any\s|Object\s|import\s|0.*loading|API.*fail/i.test(line);
      expect(hasBacktick || hasPattern, `Prohibition in ${driver} lacks concrete pattern: ${line}`).toBe(true);
    });

    it("is not too vague (>=20 chars after ❌)", () => {
      const afterMarker = line.split("❌")[1] || "";
      expect(afterMarker.trim().length).toBeGreaterThanOrEqual(20);
    });
  });
});
