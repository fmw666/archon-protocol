import type { DefaultTheme } from "vitepress";

export const zhLocaleConfig: DefaultTheme.Config = {
  logo: "/logo.svg",

  nav: [
    { text: "核心概念", link: "/zh/concepts/" },
    { text: "安装与启动", link: "/zh/setup/" },
    { text: "完整源码", link: "/source/" },
    { text: "测试", link: "/zh/testing/" },
    { text: "更新日志", link: "/zh/changelog/" },
  ],

  sidebar: {
    "/zh/concepts/": [
      {
        text: "核心概念",
        items: [
          { text: "导读", link: "/zh/concepts/" },
          { text: "10 分钟速览", link: "/zh/concepts/overview" },
          { text: "五大支柱", link: "/zh/concepts/five-pillars" },
          { text: "架构参考", link: "/zh/concepts/architecture" },
          { text: "全旅途与时序链路", link: "/zh/concepts/lifecycle-sequencing" },
          { text: "用户旅程（AI 编码 16 个坑）", link: "/zh/concepts/user-journeys" },
          { text: "架构决策（ADR）", link: "/zh/concepts/decisions" },
        ],
      },
      {
        text: "深入主题",
        items: [
          { text: "漂移机制", link: "/zh/concepts/drift-mechanism" },
          { text: "模型 vs 框架", link: "/zh/concepts/model-vs-harness" },
          { text: "产品-架构工作流", link: "/zh/concepts/product-architecture-workflow" },
          { text: "Superpowers 对比", link: "/zh/concepts/superpowers-comparison" },
          { text: "重构与采用", link: "/zh/concepts/refactoring-adoption" },
        ],
      },
    ],

    "/zh/setup/": [
      {
        text: "从这里开始",
        items: [
          { text: "概览", link: "/zh/setup/" },
          { text: "5 分钟快速上手", link: "/zh/setup/quickstart" },
          { text: "完整生命周期", link: "/zh/setup/lifecycle" },
        ],
      },
      {
        text: "生命周期命令",
        items: [
          { text: "Install（首次安装）", link: "/zh/setup/install" },
          { text: "Update（升级）", link: "/zh/setup/update" },
          { text: "Sync（漂移检查）", link: "/zh/setup/sync" },
          { text: "Uninstall（卸载）", link: "/zh/setup/uninstall" },
        ],
      },
      {
        text: "参考",
        items: [
          { text: "标准 Manifest", link: "/zh/setup/manifest" },
          { text: "完整安装指南", link: "/zh/setup/full-guide" },
          { text: "Archon CLI", link: "/zh/setup/cli" },
        ],
      },
      {
        text: "原始 Agent 文件（按 verbatim 提供）",
        items: [
          { text: "skill.md", link: "https://aaep.site/skill.md" },
          { text: "init.md（install 别名）", link: "https://aaep.site/init.md" },
          { text: "install.md", link: "https://aaep.site/install.md" },
          { text: "update.md", link: "https://aaep.site/update.md" },
          { text: "sync.md", link: "https://aaep.site/sync.md" },
          { text: "uninstall.md", link: "https://aaep.site/uninstall.md" },
          { text: "manifest.json", link: "https://aaep.site/manifest.json" },
        ],
      },
      {
        text: "模板（保留英文）",
        items: [
          { text: "manifest.template.md", link: "/setup/templates/manifest.template" },
          { text: "decisions.template.md", link: "/setup/templates/decisions.template" },
          { text: "drift.template.md", link: "/setup/templates/drift.template" },
          { text: "debt.template.md", link: "/setup/templates/debt.template" },
          { text: "memos.template.md", link: "/setup/templates/memos.template" },
        ],
      },
      {
        text: "附录",
        items: [
          { text: "Dashboard 重设计 PRD", link: "/zh/setup/dashboard-prd" },
        ],
      },
    ],

    "/zh/testing/": [
      {
        text: "概览",
        items: [
          { text: "测试中心", link: "/zh/testing/" },
        ],
      },
      {
        text: "Sandbox 测试",
        items: [
          { text: "Sandbox 总览", link: "/zh/testing/sandbox/" },
          { text: "Runner 工作原理", link: "/zh/testing/how-runner-works" },
          { text: "测试 Fixtures", link: "/zh/testing/sandbox/fixtures" },
          { text: "测试矩阵（12 项）", link: "/zh/testing/sandbox/test-matrix" },
          { text: "测试记录模板", link: "/zh/testing/sandbox/template" },
        ],
      },
      {
        text: "Sandbox 场景",
        collapsed: false,
        items: [
          { text: "01 install-cursor-node", link: "/zh/testing/sandbox/scenarios/install-cursor-node" },
          { text: "02 install-claude-python", link: "/zh/testing/sandbox/scenarios/install-claude-python" },
          { text: "03 install-codex-go", link: "/zh/testing/sandbox/scenarios/install-codex-go" },
          { text: "04 install-aider-rust", link: "/zh/testing/sandbox/scenarios/install-aider-rust" },
          { text: "05 boot-cursor-node", link: "/zh/testing/sandbox/scenarios/boot-cursor-node" },
          { text: "06 boot-claude-python", link: "/zh/testing/sandbox/scenarios/boot-claude-python" },
          { text: "07 update-cursor-node", link: "/zh/testing/sandbox/scenarios/update-cursor-node" },
          { text: "08 update-cli-without-cli", link: "/zh/testing/sandbox/scenarios/update-cli-without-cli" },
          { text: "09 sync-clean", link: "/zh/testing/sandbox/scenarios/sync-clean" },
          { text: "10 sync-modified", link: "/zh/testing/sandbox/scenarios/sync-modified" },
          { text: "11 uninstall-preserve", link: "/zh/testing/sandbox/scenarios/uninstall-preserve" },
          { text: "12 uninstall-archive", link: "/zh/testing/sandbox/scenarios/uninstall-archive" },
        ],
      },
      {
        text: "契约测试",
        items: [
          { text: "测试策略", link: "/zh/testing/strategy" },
          { text: "代表性样例", link: "/zh/testing/samples" },
          { text: "在你自己的项目中运行", link: "/zh/testing/how-to-run" },
        ],
      },
    ],

    "/zh/changelog/": [
      {
        text: "更新日志",
        items: [
          { text: "概览", link: "/zh/changelog/" },
          { text: "Framework 更新日志", link: "/zh/changelog/framework" },
          { text: "Archon CLI 更新日志", link: "/zh/changelog/cli" },
          { text: "ADR 时间线", link: "/zh/changelog/adr-timeline" },
        ],
      },
    ],
  },

  outline: { level: [2, 3], label: "本页内容" },

  search: { provider: "local" },

  socialLinks: [
    { icon: "github", link: "https://github.com/fmw666/archon-protocol" },
  ],

  editLink: {
    pattern: "https://github.com/fmw666/archon-protocol/edit/main/docs/:path",
    text: "在 GitHub 上编辑此页",
  },

  docFooter: {
    prev: "上一页",
    next: "下一页",
  },

  lastUpdated: {
    text: "最后更新于",
  },

  langMenuLabel: "切换语言",
  returnToTopLabel: "回到顶部",
  sidebarMenuLabel: "目录",
  darkModeSwitchLabel: "外观",
  lightModeSwitchTitle: "切换到浅色模式",
  darkModeSwitchTitle: "切换到深色模式",

  footer: {
    message: "依据 Apache-2.0 许可证发布。",
    copyright: "Copyright © 2026 Archon Framework 贡献者",
  },
};
