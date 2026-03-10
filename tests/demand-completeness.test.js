import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join, resolve } from "path";

const DOCS_ROOT = join(resolve(__dirname, ".."), "docs");

function readDoc(subdir, name) {
  const path = join(DOCS_ROOT, subdir, `${name}.md`);
  return existsSync(path) ? readFileSync(path, "utf-8") : "";
}

describe("Demand Pipeline Completeness", () => {
  const demandDoc = readDoc("syscalls", "demand");
  const selfAuditorDoc = readDoc("daemons", "self-auditor");

  it("demand doc exists", () => {
    expect(demandDoc).toBeTruthy();
  });

  it("self-auditor doc exists", () => {
    expect(selfAuditorDoc).toBeTruthy();
  });

  describe("demand doc", () => {
    it("contains all stages (0-6)", () => {
      expect(demandDoc).toContain("Stage 0");
      expect(demandDoc).toContain("Stage 1");
      expect(demandDoc).toContain("Stage 2");
      expect(demandDoc).toContain("Stage 3");
      expect(demandDoc).toContain("Stage 4");
      expect(demandDoc).toContain("Stage 5");
      expect(demandDoc).toContain("Stage 6");
    });

    it("Stage 0 references refactor plan", () => {
      expect(demandDoc).toMatch(/refactor.plan/i);
    });

    it("Stage 3 references 7 sub-stages (3.1-3.7)", () => {
      const dimensions = demandDoc.match(/### 3\.\d/g) || [];
      expect(dimensions.length).toBe(7);
    });

    it("has a completion report template", () => {
      expect(demandDoc).toMatch(/✅/);
    });

    it("has opt-out flags", () => {
      expect(demandDoc).toMatch(/opt.out|quick|skip/i);
    });

    it("references knowledge evolution", () => {
      expect(demandDoc).toMatch(/knowledge evolution/i);
    });
  });

  describe("self-auditor doc", () => {
    it("covers 6 dimensions", () => {
      const dims = selfAuditorDoc.match(/## Dimension \d/g) || [];
      expect(dims.length).toBe(6);
    });
  });

  it("demand sub-stages include all self-auditor dimensions plus doc integrity", () => {
    const demandDims = (demandDoc.match(/### 3\.\d/g) || []).length;
    const auditorDims = (selfAuditorDoc.match(/## Dimension \d/g) || []).length;
    expect(demandDims).toBe(auditorDims + 1);
  });
});
