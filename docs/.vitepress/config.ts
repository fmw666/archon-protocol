import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import { codeBlockTitlePlugin } from "./theme/codeBlockTitle";
import { zhLocaleConfig } from "./locales/zh";

export default withMermaid(defineConfig({
  base: "/",
  title: "Archon",
  description:
    "A session-based AI engineering governance framework. Elevates the AI agent from tool-that-follows-instructions to engineering owner with full project accountability.",

  lastUpdated: true,
  cleanUrls: true,

  srcExclude: ["source-files/**/*.md", "**/*.template.md.bak"],

  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }]],

  markdown: {
    config: (md) => {
      md.use(codeBlockTitlePlugin);
    },
    lineNumbers: true,
  },

  locales: {
    root: {
      label: "English",
      lang: "en-US",
    },
    zh: {
      label: "简体中文",
      lang: "zh-CN",
      link: "/zh/",
      title: "Archon",
      description:
        "基于会话的 AI 工程治理框架。把 AI 代理从「按指令办事的工具」抬升为「对项目负完整工程责任的所有者」。",
      themeConfig: zhLocaleConfig,
    },
  },

  themeConfig: {
    logo: "/logo.svg",

    nav: [
      { text: "Core Concepts", link: "/concepts/" },
      { text: "Install & Boot", link: "/setup/" },
      { text: "Full Source", link: "/source/" },
      { text: "Testing", link: "/testing/" },
      { text: "Changelog", link: "/changelog/" },
    ],

    sidebar: {
      "/concepts/": [
        {
          text: "Core Concepts",
          items: [
            { text: "Introduction", link: "/concepts/" },
            { text: "10-Minute Overview", link: "/concepts/overview" },
            { text: "Architecture Reference", link: "/concepts/architecture" },
            { text: "User Journeys (16 AI-Coding Pitfalls)", link: "/concepts/user-journeys" },
            { text: "Architecture Decisions (ADRs)", link: "/concepts/decisions" },
          ],
        },
        {
          text: "Deeper Dives",
          items: [
            { text: "Drift Mechanism", link: "/concepts/drift-mechanism" },
            { text: "Model vs. Harness", link: "/concepts/model-vs-harness" },
            { text: "Product-Architecture Workflow", link: "/concepts/product-architecture-workflow" },
            { text: "Superpowers Comparison", link: "/concepts/superpowers-comparison" },
            { text: "Refactoring Adoption", link: "/concepts/refactoring-adoption" },
          ],
        },
      ],

      "/setup/": [
        {
          text: "Start Here",
          items: [
            { text: "Overview", link: "/setup/" },
            { text: "5-Minute Quickstart", link: "/setup/quickstart" },
            { text: "Complete Lifecycle", link: "/setup/lifecycle" },
          ],
        },
        {
          text: "Lifecycle Commands",
          items: [
            { text: "Install (first time)", link: "/setup/install" },
            { text: "Update (upgrade)", link: "/setup/update" },
            { text: "Sync (drift check)", link: "/setup/sync" },
            { text: "Uninstall (remove)", link: "/setup/uninstall" },
          ],
        },
        {
          text: "Reference",
          items: [
            { text: "Canonical Manifest", link: "/setup/manifest" },
            { text: "Full Setup Guide", link: "/setup/full-guide" },
            { text: "Archon CLI", link: "/setup/cli" },
          ],
        },
        {
          text: "Raw Agent Files (served verbatim)",
          items: [
            { text: "skill.md", link: "https://aaep.site/skill.md" },
            { text: "init.md (alias of install)", link: "https://aaep.site/init.md" },
            { text: "install.md", link: "https://aaep.site/install.md" },
            { text: "update.md", link: "https://aaep.site/update.md" },
            { text: "sync.md", link: "https://aaep.site/sync.md" },
            { text: "uninstall.md", link: "https://aaep.site/uninstall.md" },
            { text: "manifest.json", link: "https://aaep.site/manifest.json" },
          ],
        },
        {
          text: "Templates",
          items: [
            { text: "manifest.template.md", link: "/setup/templates/manifest.template" },
            { text: "decisions.template.md", link: "/setup/templates/decisions.template" },
            { text: "drift.template.md", link: "/setup/templates/drift.template" },
            { text: "debt.template.md", link: "/setup/templates/debt.template" },
            { text: "memos.template.md", link: "/setup/templates/memos.template" },
          ],
        },
        {
          text: "Appendix",
          items: [
            { text: "Dashboard Redesign PRD", link: "/setup/dashboard-prd" },
          ],
        },
      ],

      "/source/": [
        {
          text: "Full Source",
          items: [
            { text: "Overview", link: "/source/" },
          ],
        },
        {
          text: "Soul (Cognitive Core)",
          items: [
            { text: "soul.md", link: "/source/soul" },
            { text: "soul/delivery.md", link: "/source/soul-delivery" },
            { text: "soul/review.md", link: "/source/soul-review" },
          ],
        },
        {
          text: "Commands",
          items: [
            { text: "Overview", link: "/source/commands/" },
            { text: "archon.md", link: "/source/commands/archon" },
            { text: "archon-plan.md", link: "/source/commands/archon-plan" },
            { text: "archon-demand.md", link: "/source/commands/archon-demand" },
            { text: "archon-review.md", link: "/source/commands/archon-review" },
            { text: "archon-dashboard.md", link: "/source/commands/archon-dashboard" },
          ],
        },
        {
          text: "Sub-Agents",
          items: [
            { text: "Overview", link: "/source/agents/" },
            { text: "archon-reviewer.md", link: "/source/agents/archon-reviewer" },
            { text: "archon-capture-auditor.md", link: "/source/agents/archon-capture-auditor" },
          ],
        },
        {
          text: "Rules",
          items: [
            { text: "Overview", link: "/source/rules/" },
            { text: "archon.mdc", link: "/source/rules/archon" },
            { text: "archon-wake.mdc", link: "/source/rules/archon-wake" },
            { text: "archon-heartbeat.mdc", link: "/source/rules/archon-heartbeat" },
          ],
        },
        {
          text: "Skills",
          items: [
            { text: "Overview", link: "/source/skills/" },
            { text: "archon-framework", link: "/source/skills/archon-framework" },
            { text: "archon-git-commit", link: "/source/skills/archon-git-commit" },
            { text: "archon-signs", link: "/source/skills/archon-signs" },
            { text: "archon-comic-doc-refactor", link: "/source/skills/archon-comic-doc-refactor" },
            { text: "blink-dispatch", link: "/source/skills/blink-dispatch" },
            { text: "external-agent-patterns", link: "/source/skills/external-agent-patterns" },
          ],
        },
        {
          text: "Domain Lenses",
          items: [
            { text: "Overview", link: "/source/domain-lenses/" },
            { text: "README", link: "/source/domain-lenses/README" },
            { text: "registry.yaml", link: "/source/domain-lenses/registry" },
            { text: "lens: dev", link: "/source/domain-lenses/dev" },
            { text: "lens: design", link: "/source/domain-lenses/design" },
            { text: "lens: platform", link: "/source/domain-lenses/platform" },
            { text: "lens: ecosystem", link: "/source/domain-lenses/ecosystem" },
            { text: "lens: capability", link: "/source/domain-lenses/capability" },
            { text: "template: lens", link: "/source/domain-lenses/templates/lens" },
            { text: "template: tool", link: "/source/domain-lenses/templates/tool" },
          ],
        },
        {
          text: "Domain Lens Tools",
          collapsed: true,
          items: [
            { text: "capability/adoption-plan", link: "/source/domain-lenses/tools/capability/adoption-plan" },
            { text: "capability/need-map", link: "/source/domain-lenses/tools/capability/need-map" },
            { text: "capability/practice-selector", link: "/source/domain-lenses/tools/capability/practice-selector" },
            { text: "design/component-pattern", link: "/source/domain-lenses/tools/design/component-pattern" },
            { text: "design/critique-audit-loop", link: "/source/domain-lenses/tools/design/critique-audit-loop" },
            { text: "design/interaction-state", link: "/source/domain-lenses/tools/design/interaction-state" },
            { text: "design/layout-reference", link: "/source/domain-lenses/tools/design/layout-reference" },
            { text: "design/palette-boundary", link: "/source/domain-lenses/tools/design/palette-boundary" },
            { text: "design/visual-constraint", link: "/source/domain-lenses/tools/design/visual-constraint" },
            { text: "dev/blast-radius", link: "/source/domain-lenses/tools/dev/blast-radius" },
            { text: "dev/implementation-path", link: "/source/domain-lenses/tools/dev/implementation-path" },
            { text: "dev/validation-plan", link: "/source/domain-lenses/tools/dev/validation-plan" },
            { text: "ecosystem/adoption-path", link: "/source/domain-lenses/tools/ecosystem/adoption-path" },
            { text: "ecosystem/evidence-gate", link: "/source/domain-lenses/tools/ecosystem/evidence-gate" },
            { text: "ecosystem/starter-catalog", link: "/source/domain-lenses/tools/ecosystem/starter-catalog" },
            { text: "platform/platform-boundary", link: "/source/domain-lenses/tools/platform/platform-boundary" },
          ],
        },
        {
          text: "Contracts",
          items: [
            { text: "Overview", link: "/source/contracts/" },
            { text: "governance-contract.yaml", link: "/source/contracts/governance-contract" },
          ],
        },
        {
          text: "Runtime Templates",
          items: [
            { text: "Overview", link: "/source/runtime-templates/" },
            { text: "run.template.md", link: "/source/runtime-templates/run.template" },
            { text: "run-state.schema.json", link: "/source/runtime-templates/run-state.schema" },
          ],
        },
        {
          text: "Scripts",
          items: [
            { text: "Overview", link: "/source/scripts/" },
            { text: "archon-check.py", link: "/source/scripts/archon-check-py" },
            { text: "archon-check.sh", link: "/source/scripts/archon-check-sh" },
            { text: "archon-run-state.mjs", link: "/source/scripts/archon-run-state" },
            { text: "archon-claim-verifier.mjs", link: "/source/scripts/archon-claim-verifier" },
            { text: "archon-records.mjs", link: "/source/scripts/archon-records" },
            { text: "archon-records-fold.mjs", link: "/source/scripts/archon-records-fold" },
            { text: "archon-records-migrate.mjs", link: "/source/scripts/archon-records-migrate" },
            { text: "export-archon-core.mjs", link: "/source/scripts/export-archon-core" },
            { text: "test-archon-export.mjs", link: "/source/scripts/test-archon-export" },
          ],
        },
        {
          text: "Archon CLI",
          items: [
            { text: "Overview", link: "/source/cli/" },
            { text: "README.md", link: "/source/cli/README" },
            { text: "CHANGELOG.md", link: "/source/cli/CHANGELOG" },
            { text: "package.json", link: "/source/cli/package" },
            { text: "bin/archon.mjs", link: "/source/cli/bin-archon" },
            { text: "lib/common.mjs", link: "/source/cli/lib-common" },
            { text: "lib/manifest.mjs", link: "/source/cli/lib-manifest" },
            { text: "lib/install.mjs", link: "/source/cli/lib-install" },
            { text: "lib/update.mjs", link: "/source/cli/lib-update" },
            { text: "lib/sync.mjs", link: "/source/cli/lib-sync" },
            { text: "lib/uninstall.mjs", link: "/source/cli/lib-uninstall" },
            { text: "lib/doctor.mjs", link: "/source/cli/lib-doctor" },
            { text: "lib/init.mjs", link: "/source/cli/lib-init" },
            { text: "lib/export.mjs", link: "/source/cli/lib-export" },
          ],
        },
        {
          text: "Dashboard",
          collapsed: true,
          items: [
            { text: "Overview", link: "/source/dashboard/" },
            { text: "server.js", link: "/source/dashboard/server" },
            { text: "inference.js", link: "/source/dashboard/inference" },
            { text: "providers.js", link: "/source/dashboard/providers" },
            { text: "schema.js", link: "/source/dashboard/schema" },
            { text: "package.json", link: "/source/dashboard/package" },
            { text: "public/public-index.html", link: "/source/dashboard/public/public-index" },
            { text: "public/css/styles.css", link: "/source/dashboard/public/css/styles" },
            { text: "public/js/app.js", link: "/source/dashboard/public/js/app" },
            { text: "public/js/components.js", link: "/source/dashboard/public/js/components" },
            { text: "public/js/views.js", link: "/source/dashboard/public/js/views" },
            { text: "public/js/views-trace.js", link: "/source/dashboard/public/js/views-trace" },
            { text: "public/js/workflow.js", link: "/source/dashboard/public/js/workflow" },
            { text: "public/js/workflow-data.js", link: "/source/dashboard/public/js/workflow-data" },
          ],
        },
        {
          text: "Extensions",
          items: [
            { text: "Overview", link: "/source/extensions/" },
            { text: "demand-pool: extension", link: "/source/extensions/demand-pool/extension" },
            { text: "demand-pool: demands", link: "/source/extensions/demand-pool/demands" },
          ],
        },
        {
          text: "Misc",
          items: [
            { text: "VERSION", link: "/source/version" },
            { text: "LICENSE", link: "/source/license" },
            { text: "NOTICE", link: "/source/notice" },
          ],
        },
      ],

      "/testing/": [
        {
          text: "Overview",
          items: [
            { text: "Testing Hub", link: "/testing/" },
          ],
        },
        {
          text: "Sandbox Tests",
          items: [
            { text: "Sandbox Overview", link: "/testing/sandbox/" },
            { text: "How the Runner Works", link: "/testing/how-runner-works" },
            { text: "Test Fixtures", link: "/testing/sandbox/fixtures" },
            { text: "Test Matrix (19)", link: "/testing/sandbox/test-matrix" },
            { text: "Install Matrix (7)", link: "/testing/sandbox/install-matrix" },
            { text: "Test Record Template", link: "/testing/sandbox/template" },
          ],
        },
        {
          text: "Sandbox Scenarios",
          collapsed: false,
          items: [
            { text: "01 install-cursor-node", link: "/testing/sandbox/scenarios/install-cursor-node" },
            { text: "02 install-claude-python", link: "/testing/sandbox/scenarios/install-claude-python" },
            { text: "03 install-codex-go", link: "/testing/sandbox/scenarios/install-codex-go" },
            { text: "04 install-aider-rust", link: "/testing/sandbox/scenarios/install-aider-rust" },
            { text: "05 boot-cursor-node", link: "/testing/sandbox/scenarios/boot-cursor-node" },
            { text: "06 boot-claude-python", link: "/testing/sandbox/scenarios/boot-claude-python" },
            { text: "07 update-cursor-node", link: "/testing/sandbox/scenarios/update-cursor-node" },
            { text: "08 update-cli-without-cli", link: "/testing/sandbox/scenarios/update-cli-without-cli" },
            { text: "09 sync-clean", link: "/testing/sandbox/scenarios/sync-clean" },
            { text: "10 sync-modified", link: "/testing/sandbox/scenarios/sync-modified" },
            { text: "11 uninstall-preserve", link: "/testing/sandbox/scenarios/uninstall-preserve" },
            { text: "12 uninstall-archive", link: "/testing/sandbox/scenarios/uninstall-archive" },
            { text: "13 install-empty-dir", link: "/testing/sandbox/scenarios/install-empty-dir" },
            { text: "14 install-existing-project", link: "/testing/sandbox/scenarios/install-existing-project" },
            { text: "15 install-rejects-reinstall", link: "/testing/sandbox/scenarios/install-rejects-reinstall" },
            { text: "16 install-force-reinstall", link: "/testing/sandbox/scenarios/install-force-reinstall" },
            { text: "17 install-half-archon-dir", link: "/testing/sandbox/scenarios/install-half-archon-dir" },
            { text: "18 install-without-cli", link: "/testing/sandbox/scenarios/install-without-cli" },
            { text: "19 install-agent-cursor", link: "/testing/sandbox/scenarios/install-agent-cursor" },
          ],
        },
        {
          text: "Contract Tests",
          items: [
            { text: "Test Strategy", link: "/testing/strategy" },
            { text: "Representative Samples", link: "/testing/samples" },
            { text: "How to Run in Your Project", link: "/testing/how-to-run" },
          ],
        },
      ],

      "/changelog/": [
        {
          text: "Changelog",
          items: [
            { text: "Overview", link: "/changelog/" },
            { text: "Framework Changelog", link: "/changelog/framework" },
            { text: "Archon CLI Changelog", link: "/changelog/cli" },
            { text: "ADR Timeline", link: "/changelog/adr-timeline" },
          ],
        },
      ],
    },

    outline: { level: [2, 3], label: "On this page" },

    search: { provider: "local" },

    socialLinks: [
      { icon: "github", link: "https://github.com/fmw666/archon-protocol" },
    ],

    editLink: {
      pattern: "https://github.com/fmw666/archon-protocol/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },

    footer: {
      message: "Released under the Apache-2.0 License.",
      copyright: "Copyright © 2026 Archon Framework contributors",
    },
  },

  mermaid: {},
}));
