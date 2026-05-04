import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import { codeBlockTitlePlugin } from "./theme/codeBlockTitle";

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
          text: "Install & Boot",
          items: [
            { text: "Overview", link: "/setup/" },
            { text: "5-Minute Quickstart", link: "/setup/quickstart" },
            { text: "Full Setup Guide", link: "/setup/full-guide" },
            { text: "Archon CLI", link: "/setup/cli" },
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
            { text: "archon.mdc", link: "/source/rules/archon" },
            { text: "archon-wake.mdc", link: "/source/rules/archon-wake" },
          ],
        },
        {
          text: "Skills",
          items: [
            { text: "Overview", link: "/source/skills/" },
            { text: "archon-framework", link: "/source/skills/archon-framework" },
            { text: "archon-git-commit", link: "/source/skills/archon-git-commit" },
            { text: "archon-signs", link: "/source/skills/archon-signs" },
            { text: "blink-dispatch", link: "/source/skills/blink-dispatch" },
            { text: "external-agent-patterns", link: "/source/skills/external-agent-patterns" },
          ],
        },
        {
          text: "Domain Lenses",
          items: [
            { text: "Overview", link: "/source/domain-lenses/" },
            { text: "registry.yaml", link: "/source/domain-lenses/registry" },
            { text: "lens: dev", link: "/source/domain-lenses/dev" },
            { text: "lens: design", link: "/source/domain-lenses/design" },
            { text: "lens: platform", link: "/source/domain-lenses/platform" },
            { text: "lens: ecosystem", link: "/source/domain-lenses/ecosystem" },
            { text: "lens: capability", link: "/source/domain-lenses/capability" },
          ],
        },
        {
          text: "Contracts",
          items: [
            { text: "governance-contract.yaml", link: "/source/contracts/governance-contract" },
          ],
        },
        {
          text: "Runtime Templates",
          items: [
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
            { text: "export-archon-core.mjs", link: "/source/scripts/export-archon-core" },
            { text: "test-archon-export.mjs", link: "/source/scripts/test-archon-export" },
          ],
        },
        {
          text: "Archon CLI",
          items: [
            { text: "Overview", link: "/source/cli/" },
            { text: "package.json", link: "/source/cli/package" },
            { text: "bin/archon.mjs", link: "/source/cli/bin-archon" },
            { text: "lib/common.mjs", link: "/source/cli/lib-common" },
            { text: "lib/init.mjs", link: "/source/cli/lib-init" },
            { text: "lib/doctor.mjs", link: "/source/cli/lib-doctor" },
            { text: "lib/export.mjs", link: "/source/cli/lib-export" },
          ],
        },
      ],

      "/testing/": [
        {
          text: "Testing",
          items: [
            { text: "Overview", link: "/testing/" },
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
