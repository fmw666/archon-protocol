import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join, resolve } from "path";

const AP_ROOT = resolve(__dirname, "..");
const SKILLS_DIR = join(AP_ROOT, "skills");
const AGENTS_DIR = join(AP_ROOT, "agents");

function readSkill(name) {
  const path = join(SKILLS_DIR, name, "SKILL.md");
  return existsSync(path) ? readFileSync(path, "utf-8") : "";
}

function readAgent(name) {
  const path = join(AGENTS_DIR, `${name}.md`);
  return existsSync(path) ? readFileSync(path, "utf-8") : "";
}

describe("Demand Pipeline Completeness", () => {
  const demandSkill = readSkill("archon-demand");
  const demandAgent = readAgent("archon-demand");
  const selfAuditorSkill = readSkill("archon-self-auditor");
  const selfAuditorAgent = readAgent("archon-self-auditor");

  it("demand skill exists", () => {
    expect(demandSkill).toBeTruthy();
  });

  it("demand agent exists", () => {
    expect(demandAgent).toBeTruthy();
  });

  it("self-auditor skill exists", () => {
    expect(selfAuditorSkill).toBeTruthy();
  });

  it("self-auditor agent exists", () => {
    expect(selfAuditorAgent).toBeTruthy();
  });

  describe.each([
    { name: "skill", content: demandSkill },
    { name: "agent", content: demandAgent },
  ])("demand $name", ({ content }) => {
    it("contains all stages (0-6)", () => {
      expect(content).toContain("Stage 0");
      expect(content).toContain("Stage 1");
      expect(content).toContain("Stage 2");
      expect(content).toContain("Stage 3");
      expect(content).toContain("Stage 4");
      expect(content).toContain("Stage 5");
      expect(content).toContain("Stage 6");
    });

    it("Stage 0 references refactor plan", () => {
      expect(content).toMatch(/refactor.plan/i);
    });

    it("Stage 3 references 6 audit dimensions", () => {
      const dimensions = content.match(/### 3\.\d/g) || [];
      expect(dimensions.length).toBe(6);
    });

    it("has a completion report template", () => {
      expect(content).toMatch(/✅/);
    });

    it("has opt-out flags", () => {
      expect(content).toMatch(/opt.out|quick|skip/i);
    });

    it("references knowledge evolution", () => {
      expect(content).toMatch(/knowledge evolution/i);
    });
  });

  describe.each([
    { name: "skill", content: selfAuditorSkill },
    { name: "agent", content: selfAuditorAgent },
  ])("self-auditor $name", ({ content }) => {
    it("covers 6 dimensions", () => {
      const dims = content.match(/## Dimension \d/g) || [];
      expect(dims.length).toBe(6);
    });
  });

  it("demand dimension count matches self-auditor dimension count", () => {
    const demandDims = (demandSkill.match(/### 3\.\d/g) || []).length;
    const auditorDims = (selfAuditorSkill.match(/## Dimension \d/g) || []).length;
    expect(demandDims).toBe(auditorDims);
  });
});
