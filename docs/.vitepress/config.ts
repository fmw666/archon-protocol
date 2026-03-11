import { defineConfig } from "vitepress";
import { codeBlockTitlePlugin } from "./theme/codeBlockTitle";

export default defineConfig({
  base: "/",
  title: "Archon Protocol",
  description:
    "AI Agent Operating System — kernel, drivers, syscalls, daemons. Powered by AAEP.",

  lastUpdated: true,
  cleanUrls: true,

  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }]],

  markdown: {
    config: (md) => {
      md.use(codeBlockTitlePlugin);
    },
  },

  locales: {
    root: {
      label: "English",
      lang: "en",
      themeConfig: {
        nav: [
          { text: "Guide", link: "/guide/getting-started" },
          {
            text: "OS Layers",
            items: [
              { text: "Kernel", link: "/kernel/" },
              { text: "Drivers", link: "/drivers/" },
              { text: "Syscalls", link: "/syscalls/" },
              { text: "Daemons", link: "/daemons/" },
            ],
          },
          { text: "Architecture", link: "/architecture/overview" },
          { text: "Reference", link: "/reference/commands" },
        ],
        sidebar: {
          "/guide/": [
            {
              text: "Guide",
              items: [
                { text: "Getting Started", link: "/guide/getting-started" },
                {
                  text: "Design Philosophy",
                  link: "/guide/design-philosophy",
                },
                { text: "Installation", link: "/guide/installation" },
                {
                  text: "Migration Guide",
                  link: "/guide/migration",
                },
                { text: "FAQ", link: "/guide/faq" },
              ],
            },
          ],
          "/kernel/": [
            {
              text: "Kernel",
              items: [
                { text: "Overview", link: "/kernel/" },
                {
                  text: "Doc Integrity",
                  link: "/kernel/doc-integrity",
                },
              ],
            },
          ],
          "/drivers/": [
            {
              text: "Drivers (Constraints)",
              items: [
                { text: "Overview", link: "/drivers/" },
                { text: "Code Quality", link: "/drivers/code-quality" },
                { text: "Test Sync", link: "/drivers/test-sync" },
                { text: "Async Loading", link: "/drivers/async-loading" },
                { text: "Error Handling", link: "/drivers/error-handling" },
                { text: "Handoff", link: "/drivers/handoff" },
              ],
            },
          ],
          "/syscalls/": [
            {
              text: "Syscalls (Commands)",
              items: [
                { text: "Overview", link: "/syscalls/" },
                { text: "/archon-init", link: "/syscalls/init" },
                { text: "/archon-demand", link: "/syscalls/demand" },
                { text: "/archon-audit", link: "/syscalls/audit" },
                { text: "/archon-refactor", link: "/syscalls/refactor" },
                { text: "/archon-verifier", link: "/syscalls/verifier" },
                { text: "/archon-lint", link: "/syscalls/lint" },
              ],
            },
          ],
          "/daemons/": [
            {
              text: "Daemons (Internal)",
              items: [
                { text: "Overview", link: "/daemons/" },
                { text: "Self-Auditor", link: "/daemons/self-auditor" },
                { text: "Test Runner", link: "/daemons/test-runner" },
              ],
            },
          ],
          "/architecture/": [
            {
              text: "Architecture",
              items: [
                {
                  text: "Core Principles",
                  link: "/architecture/core-principles",
                },
                { text: "Overview", link: "/architecture/overview" },
                {
                  text: "The OS Model",
                  link: "/architecture/os-model",
                },
                {
                  text: "Single-Agent Design",
                  link: "/architecture/single-agent",
                },
                { text: "Feedback Loop", link: "/architecture/feedback-loop" },
                {
                  text: "Naming & AAEP",
                  link: "/architecture/naming-protocol",
                },
              ],
            },
          ],
          "/reference/": [
            {
              text: "Reference",
              items: [
                { text: "Commands", link: "/reference/commands" },
                { text: "Agents", link: "/reference/agents" },
                { text: "Constraint Skills", link: "/reference/constraints" },
              ],
            },
          ],
          "/decisions/": [
            {
              text: "Architecture Decisions (ADRs)",
              items: [
                {
                  text: "ADR-001: Response to Critiques",
                  link: "/decisions/ADR-001-response-to-external-critiques",
                },
                {
                  text: "ADR-002: EvoMap Experience Absorption",
                  link: "/decisions/ADR-002-evomap-experience-absorption",
                },
                {
                  text: "ADR-003: Executable Enforcement",
                  link: "/decisions/ADR-003-executable-enforcement",
                },
              ],
            },
          ],
        },
      },
    },
    zh: {
      label: "中文",
      lang: "zh-CN",
      themeConfig: {
        nav: [
          { text: "指南", link: "/zh/guide/getting-started" },
          {
            text: "OS 层级",
            items: [
              { text: "内核", link: "/kernel/" },
              { text: "驱动", link: "/drivers/" },
              { text: "系统调用", link: "/syscalls/" },
              { text: "守护进程", link: "/daemons/" },
            ],
          },
          { text: "架构", link: "/zh/architecture/overview" },
          { text: "参考", link: "/zh/reference/commands" },
        ],
        sidebar: {
          "/zh/guide/": [
            {
              text: "指南",
              items: [
                { text: "快速上手", link: "/zh/guide/getting-started" },
                { text: "设计哲学", link: "/zh/guide/design-philosophy" },
                { text: "常见问题", link: "/zh/guide/faq" },
              ],
            },
          ],
          "/zh/architecture/": [
            {
              text: "架构",
              items: [
                {
                  text: "核心原则",
                  link: "/zh/architecture/core-principles",
                },
                { text: "架构总览", link: "/zh/architecture/overview" },
                { text: "单代理架构", link: "/zh/architecture/single-agent" },
                {
                  text: "自动化反馈循环",
                  link: "/zh/architecture/feedback-loop",
                },
                {
                  text: "命名与协议",
                  link: "/zh/architecture/naming-protocol",
                },
                {
                  text: "操作系统模型",
                  link: "/zh/architecture/os-model",
                },
              ],
            },
          ],
          "/zh/reference/": [
            {
              text: "参考",
              items: [{ text: "命令与工作流", link: "/zh/reference/commands" }],
            },
          ],
        },
        outline: { label: "目录" },
        lastUpdated: { text: "最后更新" },
        docFooter: { prev: "上一篇", next: "下一篇" },
      },
    },
  },

  themeConfig: {
    search: { provider: "local" },
    socialLinks: [
      { icon: "github", link: "https://github.com/fmw666/archon-protocol" },
    ],
    editLink: {
      pattern: "https://github.com/fmw666/archon-protocol/edit/main/docs/:path",
    },
    footer: {
      message: "Powered by AAEP (AI Architect Evolution Protocol)",
      copyright: "Archon Protocol",
    },
  },
});
