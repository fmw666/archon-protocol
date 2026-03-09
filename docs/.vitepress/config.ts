import { defineConfig } from "vitepress";
import { codeBlockTitlePlugin } from "./theme/codeBlockTitle";

export default defineConfig({
  base: "/",
  title: "Archon Protocol",
  description:
    "Agent-first governance system for AI-driven development, powered by AAEP.",

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
                { text: "FAQ", link: "/guide/faq" },
              ],
            },
          ],
          "/architecture/": [
            {
              text: "Architecture",
              items: [
                { text: "Overview", link: "/architecture/overview" },
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
