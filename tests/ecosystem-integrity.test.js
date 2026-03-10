import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join, resolve } from "path";

const AP_ROOT = resolve(__dirname, "..");
const DOCS_ROOT = join(AP_ROOT, "docs");

function getDocNames(subdir) {
  const dir = join(DOCS_ROOT, subdir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "index.md")
    .map((f) => f.replace(".md", ""));
}

function readDoc(subdir, name) {
  const path = join(DOCS_ROOT, subdir, `${name}.md`);
  return existsSync(path) ? readFileSync(path, "utf-8") : "";
}

describe("Ecosystem Integrity", () => {
  const driverNames = getDocNames("drivers");
  const syscallNames = getDocNames("syscalls");
  const daemonNames = getDocNames("daemons");

  const readme = readFileSync(join(AP_ROOT, "README.md"), "utf-8");
  const initDoc = readDoc("syscalls", "init");

  it("has at least 5 drivers", () => {
    expect(driverNames.length).toBeGreaterThanOrEqual(5);
  });

  it("has at least 5 syscalls", () => {
    expect(syscallNames.length).toBeGreaterThanOrEqual(5);
  });

  it("has at least 2 daemons", () => {
    expect(daemonNames.length).toBeGreaterThanOrEqual(2);
  });

  it("init doc lists all core drivers", () => {
    const coreDrivers = ["code-quality", "test-sync", "async-loading", "error-handling", "handoff"];
    for (const name of coreDrivers) {
      expect(initDoc, `init doc missing driver: ${name}`).toContain(name);
    }
  });

  it("init doc lists all syscalls", () => {
    const coreSyscalls = ["demand", "audit", "refactor", "verifier"];
    for (const name of coreSyscalls) {
      expect(initDoc, `init doc missing syscall: ${name}`).toContain(name);
    }
  });

  it("init doc lists all daemons", () => {
    const coreDaemons = ["self-auditor", "test-runner"];
    for (const name of coreDaemons) {
      expect(initDoc, `init doc missing daemon: ${name}`).toContain(name);
    }
  });

  it("README references core drivers", () => {
    const coreDrivers = ["archon-code-quality", "archon-test-sync", "archon-async-loading", "archon-error-handling", "archon-handoff"];
    for (const name of coreDrivers) {
      expect(readme, `README missing driver: ${name}`).toContain(name);
    }
  });

  it("README references core syscalls", () => {
    const coreSyscalls = ["/archon-init", "/archon-demand", "/archon-audit", "/archon-refactor", "/archon-verifier"];
    for (const name of coreSyscalls) {
      expect(readme, `README missing syscall: ${name}`).toContain(name);
    }
  });

  it("demand doc preloads constraint drivers", () => {
    const demand = readDoc("syscalls", "demand");
    expect(demand).toContain("code-quality");
    expect(demand).toContain("test-sync");
  });

  it("self-auditor doc preloads ALL constraint drivers", () => {
    const auditor = readDoc("daemons", "self-auditor");
    expect(auditor).toContain("code-quality");
    expect(auditor).toContain("test-sync");
    expect(auditor).toContain("async-loading");
    expect(auditor).toContain("error-handling");
    expect(auditor).toContain("handoff");
  });

  it("all docs are in English (no CJK)", () => {
    for (const layer of ["drivers", "syscalls", "daemons"]) {
      for (const name of getDocNames(layer)) {
        const content = readDoc(layer, name);
        const cjk = content.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/g);
        expect(cjk, `${layer}/${name} contains CJK`).toBeNull();
      }
    }
  });

  it("no contradictions: same pattern is not prohibited and promoted", () => {
    const prohibited = [];
    const promoted = [];

    for (const name of driverNames) {
      const content = readDoc("drivers", name);
      for (const line of content.split(/\r?\n/)) {
        const codes = (line.match(/`([^`]+)`/g) || []).map((c) => c.replace(/`/g, ""));
        if (line.trimStart().startsWith("- ❌")) {
          for (const code of codes) prohibited.push({ driver: name, code });
        }
        if (line.includes("✅")) {
          for (const code of codes) promoted.push({ driver: name, code });
        }
      }
    }

    for (const p of prohibited) {
      const contradiction = promoted.find(
        (pr) => pr.code === p.code && pr.driver !== p.driver,
      );
      expect(
        contradiction,
        `"${p.code}" is ❌ in ${p.driver} but ✅ in ${contradiction?.driver}`,
      ).toBeUndefined();
    }
  });
});
