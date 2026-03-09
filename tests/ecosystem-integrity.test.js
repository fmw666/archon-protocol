import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join, resolve } from "path";

const AP_ROOT = resolve(__dirname, "..");
const SKILLS_DIR = join(AP_ROOT, "skills");
const AGENTS_DIR = join(AP_ROOT, "agents");

function getSkillNames() {
  if (!existsSync(SKILLS_DIR)) return [];
  return readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function getAgentNames() {
  if (!existsSync(AGENTS_DIR)) return [];
  return readdirSync(AGENTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(".md", ""));
}

function readSkill(name) {
  const path = join(SKILLS_DIR, name, "SKILL.md");
  return existsSync(path) ? readFileSync(path, "utf-8") : "";
}

function readAgent(name) {
  const path = join(AGENTS_DIR, `${name}.md`);
  return existsSync(path) ? readFileSync(path, "utf-8") : "";
}

describe("Ecosystem Integrity", () => {
  const skillNames = getSkillNames();
  const agentNames = getAgentNames();
  const readme = readFileSync(join(AP_ROOT, "README.md"), "utf-8");
  const initSkill = readSkill("archon-init");
  const initAgent = readAgent("archon-init");

  it("all skill names start with 'archon-'", () => {
    for (const name of skillNames) {
      expect(name.startsWith("archon-"), `${name} missing archon- prefix`).toBe(true);
    }
  });

  it("all agent names start with 'archon-'", () => {
    for (const name of agentNames) {
      expect(name.startsWith("archon-"), `${name} missing archon- prefix`).toBe(true);
    }
  });

  it("should find at least 11 skills", () => {
    expect(skillNames.length).toBeGreaterThanOrEqual(11);
  });

  it("should find at least 7 agents", () => {
    expect(agentNames.length).toBeGreaterThanOrEqual(7);
  });

  it("every command/internal agent has a matching skill", () => {
    for (const agent of agentNames) {
      expect(skillNames, `agent ${agent} has no matching skill`).toContain(agent);
    }
  });

  it("constraint skills exist (no agent equivalent)", () => {
    const constraints = ["archon-code-quality", "archon-test-sync", "archon-async-loading", "archon-error-handling"];
    for (const name of constraints) {
      expect(skillNames, `missing constraint: ${name}`).toContain(name);
      expect(agentNames, `constraint ${name} should NOT have an agent`).not.toContain(name);
    }
  });

  it("init skill lists all agents", () => {
    for (const name of agentNames) {
      expect(initSkill, `init skill missing agent: ${name}`).toContain(name);
    }
  });

  it("init agent lists all constraint skills", () => {
    const constraints = ["archon-code-quality", "archon-test-sync", "archon-async-loading", "archon-error-handling"];
    for (const name of constraints) {
      expect(initAgent, `init agent missing constraint: ${name}`).toContain(name);
    }
  });

  it("README references every skill", () => {
    for (const name of skillNames) {
      expect(readme, `README missing skill: ${name}`).toContain(name);
    }
  });

  it("README references every agent", () => {
    for (const name of agentNames) {
      expect(readme, `README missing agent: ${name}`).toContain(name);
    }
  });

  it("demand agent preloads constraint skills via 'skills' field", () => {
    const demand = readAgent("archon-demand");
    expect(demand).toContain("archon-code-quality");
    expect(demand).toContain("archon-test-sync");
  });

  it("self-auditor agent preloads ALL constraint skills", () => {
    const auditor = readAgent("archon-self-auditor");
    expect(auditor).toContain("archon-code-quality");
    expect(auditor).toContain("archon-test-sync");
    expect(auditor).toContain("archon-async-loading");
    expect(auditor).toContain("archon-error-handling");
  });

  it("audit agent is read-only", () => {
    const audit = readAgent("archon-audit");
    expect(audit).toMatch(/readonly:\s*true/);
  });

  it("verifier agent is read-only", () => {
    const verifier = readAgent("archon-verifier");
    expect(verifier).toMatch(/readonly:\s*true/);
  });

  it("all skills are in English (no CJK)", () => {
    for (const name of skillNames) {
      const content = readSkill(name);
      const cjk = content.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/g);
      expect(cjk, `${name} contains CJK`).toBeNull();
    }
  });

  it("all agents are in English (no CJK)", () => {
    for (const name of agentNames) {
      const content = readAgent(name);
      const cjk = content.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/g);
      expect(cjk, `${name} contains CJK`).toBeNull();
    }
  });

  it("no contradictions: same pattern is not prohibited and promoted", () => {
    const prohibited = [];
    const promoted = [];

    for (const name of skillNames) {
      const content = readSkill(name);
      for (const line of content.split(/\r?\n/)) {
        const codes = (line.match(/`([^`]+)`/g) || []).map((c) => c.replace(/`/g, ""));
        if (line.trimStart().startsWith("- ❌")) {
          for (const code of codes) prohibited.push({ skill: name, code });
        }
        if (line.includes("✅")) {
          for (const code of codes) promoted.push({ skill: name, code });
        }
      }
    }

    for (const p of prohibited) {
      const contradiction = promoted.find(
        (pr) => pr.code === p.code && pr.skill !== p.skill,
      );
      expect(
        contradiction,
        `"${p.code}" is ❌ in ${p.skill} but ✅ in ${contradiction?.skill}`,
      ).toBeUndefined();
    }
  });
});
