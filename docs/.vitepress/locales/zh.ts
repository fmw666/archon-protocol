import type { DefaultTheme } from "vitepress";

export const zhLocaleConfig: DefaultTheme.Config = {
  logo: "/logo.svg",

  nav: [
    { text: "æ ¸å¿ƒæ¦‚å¿µ", link: "/zh/concepts/" },
    { text: "å®‰è£…ä¸Žå¯åŠ¨", link: "/zh/setup/" },
    { text: "å®Œæ•´æºç ", link: "/source/" },
    { text: "æµ‹è¯•", link: "/zh/testing/" },
    { text: "æ›´æ–°æ—¥å¿—", link: "/zh/changelog/" },
  ],

  sidebar: {
    "/zh/concepts/": [
      {
        text: "æ ¸å¿ƒæ¦‚å¿µ",
        items: [
          { text: "å¯¼è¨€", link: "/zh/concepts/" },
          { text: "10 åˆ†é’Ÿé€Ÿè§ˆ", link: "/zh/concepts/overview" },
          { text: "æž¶æž„å‚è€ƒ", link: "/zh/concepts/architecture" },
          { text: "ç”¨æˆ·æ—…ç¨‹ï¼ˆAI ç¼–ç  16 å¤§å‘ï¼‰", link: "/zh/concepts/user-journeys" },
          { text: "æž¶æž„å†³ç­–ï¼ˆADRï¼‰", link: "/zh/concepts/decisions" },
        ],
      },
      {
        text: "æ·±å…¥ä¸»é¢˜",
        items: [
          { text: "æ¼‚ç§»æœºåˆ¶", link: "/zh/concepts/drift-mechanism" },
          { text: "æ¨¡åž‹ vs éžæž¶", link: "/zh/concepts/model-vs-harness" },
          { text: "äº§å“-æž¶æž„å·¥ä½œæµ", link: "/zh/concepts/product-architecture-workflow" },
          { text: "è¶…èƒ½åŠ›å¯¹ç…§", link: "/zh/concepts/superpowers-comparison" },
          { text: "é‡æž„ä¸Žæ¸è¿›é‡‡ç”¨", link: "/zh/concepts/refactoring-adoption" },
        ],
      },
    ],

    "/zh/setup/": [
      {
        text: "ä»Žè¿™é‡Œå¼€å§‹",
        items: [
          { text: "æ¦‚è§ˆ", link: "/zh/setup/" },
          { text: "5 åˆ†é’Ÿå¿«é€Ÿä¸Šæ‰‹", link: "/zh/setup/quickstart" },
          { text: "å®Œæ•´ç”Ÿå‘½å‘¨æœŸ", link: "/zh/setup/lifecycle" },
        ],
      },
      {
        text: "ç”Ÿå‘½å‘¨æœŸå‘½ä»¤",
        items: [
          { text: "Installï¼ˆé¦–æ¬¡å®‰è£…ï¼‰", link: "/zh/setup/install" },
          { text: "Updateï¼ˆå‡çº§ï¼‰", link: "/zh/setup/update" },
          { text: "Syncï¼ˆæ¼‚ç§»æ£€æŸ¥ï¼‰", link: "/zh/setup/sync" },
          { text: "Uninstallï¼ˆå¸è½½ï¼‰", link: "/zh/setup/uninstall" },
        ],
      },
      {
        text: "å‚è€ƒ",
        items: [
          { text: "æ ‡å‡† Manifest", link: "/zh/setup/manifest" },
          { text: "å®Œæ•´å®‰è£…æŒ‡å—", link: "/zh/setup/full-guide" },
          { text: "Archon CLI", link: "/zh/setup/cli" },
        ],
      },
      {
        text: "Agent åŽŸå§‹æ–‡ä»¶ï¼ˆæŒ‰åŽŸæ–‡ä¾›å¥‰ï¼‰",
        items: [
          { text: "skill.md", link: "https://aaep.site/skill.md" },
          { text: "init.mdï¼ˆinstall åˆ«åï¼‰", link: "https://aaep.site/init.md" },
          { text: "install.md", link: "https://aaep.site/install.md" },
          { text: "update.md", link: "https://aaep.site/update.md" },
          { text: "sync.md", link: "https://aaep.site/sync.md" },
          { text: "uninstall.md", link: "https://aaep.site/uninstall.md" },
          { text: "manifest.json", link: "https://aaep.site/manifest.json" },
        ],
      },
      {
        text: "æ¨¡æ¿",
        items: [
          { text: "manifest.template.md", link: "/setup/templates/manifest.template" },
          { text: "decisions.template.md", link: "/setup/templates/decisions.template" },
          { text: "drift.template.md", link: "/setup/templates/drift.template" },
          { text: "debt.template.md", link: "/setup/templates/debt.template" },
          { text: "memos.template.md", link: "/setup/templates/memos.template" },
        ],
      },
      {
        text: "é™„å½•",
        items: [
          { text: "Dashboard é‡è®¾è®¡ PRD", link: "/zh/setup/dashboard-prd" },
        ],
      },
    ],

    "/source/": sourceSidebar(),
    "/zh/testing/": testingSidebar(),
    "/zh/changelog/": [
      {
        text: "æ›´æ–°æ—¥å¿—",
        items: [
          { text: "æ¦‚è§ˆ", link: "/zh/changelog/" },
          { text: "æ¡†æž¶æ›´æ–°æ—¥å¿—", link: "/zh/changelog/framework" },
          { text: "Archon CLI æ›´æ–°æ—¥å¿—", link: "/zh/changelog/cli" },
          { text: "ADR æ—¶é—´çº¿", link: "/zh/changelog/adr-timeline" },
        ],
      },
    ],
  },

  outline: { level: [2, 3], label: "æœ¬é¡µç›®å½•" },

  search: { provider: "local" },

  socialLinks: [
    { icon: "github", link: "https://github.com/fmw666/archon-protocol" },
  ],

  editLink: {
    pattern: "https://github.com/fmw666/archon-protocol/edit/main/docs/:path",
    text: "åœ¨ GitHub ä¸Šç¼–è¾‘æ­¤é¡µ",
  },

  footer: {
    message: "ä¾æ® Apache-2.0 è®¸å¯è¯å‘å¸ƒã€‚",
    copyright: "Copyright Â© 2026 Archon Framework è´¡çŒ®è€…",
  },

  docFooter: {
    prev: "ä¸Šä¸€é¡µ",
    next: "ä¸‹ä¸€é¡µ",
  },

  lastUpdatedText: "æœ€åŽæ›´æ–°äºŽ",
  darkModeSwitchLabel: "æ·±è‰²æ¨¡å¼",
  lightModeSwitchTitle: "åˆ‡æ¢ä¸ºæµ…è‰²æ¨¡å¼",
  darkModeSwitchTitle: "åˆ‡æ¢ä¸ºæ·±è‰²æ¨¡å¼",
  sidebarMenuLabel: "èœå•",
  returnToTopLabel: "è¿”å›žé¡¶éƒ¨",
  langMenuLabel: "åˆ‡æ¢è¯­è¨€",

  notFound: {
    title: "é¡µé¢æœªæ‰¾åˆ°",
    quote: "ä½ å¯»æ‰¾çš„é¡µé¢ä¸å­˜åœ¨ â€”â€” ä¹Ÿè®¸å®ƒè¢«æ¼‚ç§»æ‚„æ‚„å¸¦èµ°ï¼Œæˆ–è€…è¿˜æ²¡ç¿»è¯‘è¿‡æ¥ã€‚",
    linkLabel: "è¿”å›žé¦–é¡µ",
    linkText: "è¿”å›žé¦–é¡µ",
  },
};

function sourceSidebar(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "å®Œæ•´æºç ",
      items: [{ text: "æ¦‚è§ˆ", link: "/source/" }],
    },
    {
      text: "Soulï¼ˆè®¤çŸ¥æ ¸å¿ƒï¼‰",
      items: [
        { text: "soul.md", link: "/source/soul" },
        { text: "soul/delivery.md", link: "/source/soul-delivery" },
        { text: "soul/review.md", link: "/source/soul-review" },
      ],
    },
    {
      text: "Commands",
      items: [
        { text: "æ¦‚è§ˆ", link: "/source/commands/" },
        { text: "archon.md", link: "/source/commands/archon" },
        { text: "archon-plan.md", link: "/source/commands/archon-plan" },
        { text: "archon-demand.md", link: "/source/commands/archon-demand" },
        { text: "archon-review.md", link: "/source/commands/archon-review" },
        { text: "archon-dashboard.md", link: "/source/commands/archon-dashboard" },
      ],
    },
    {
      text: "å­ä»£ç†ï¼ˆSub-Agentsï¼‰",
      items: [
        { text: "æ¦‚è§ˆ", link: "/source/agents/" },
        { text: "archon-reviewer.md", link: "/source/agents/archon-reviewer" },
        { text: "archon-capture-auditor.md", link: "/source/agents/archon-capture-auditor" },
      ],
    },
    {
      text: "Rules",
      items: [
        { text: "æ¦‚è§ˆ", link: "/source/rules/" },
        { text: "archon.mdc", link: "/source/rules/archon" },
        { text: "archon-wake.mdc", link: "/source/rules/archon-wake" },
        { text: "archon-heartbeat.mdc", link: "/source/rules/archon-heartbeat" },
      ],
    },
    {
      text: "Skills",
      items: [
        { text: "æ¦‚è§ˆ", link: "/source/skills/" },
        { text: "archon-framework", link: "/source/skills/archon-framework" },
        { text: "archon-git-commit", link: "/source/skills/archon-git-commit" },
        { text: "archon-signs", link: "/source/skills/archon-signs" },
        { text: "archon-comic-doc-refactor", link: "/source/skills/archon-comic-doc-refactor" },
        { text: "blink-dispatch", link: "/source/skills/blink-dispatch" },
        { text: "external-agent-patterns", link: "/source/skills/external-agent-patterns" },
      ],
    },
    {
      text: "é¢†åŸŸé€é•œï¼ˆDomain Lensesï¼‰",
      items: [
        { text: "æ¦‚è§ˆ", link: "/source/domain-lenses/" },
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
      text: "é¢†åŸŸé€é•œå·¥å…·",
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
      text: "å¥‘çº¦ï¼ˆContractsï¼‰",
      items: [
        { text: "æ¦‚è§ˆ", link: "/source/contracts/" },
        { text: "governance-contract.yaml", link: "/source/contracts/governance-contract" },
      ],
    },
    {
      text: "è¿è¡Œæ—¶æ¨¡æ¿",
      items: [
        { text: "æ¦‚è§ˆ", link: "/source/runtime-templates/" },
        { text: "run.template.md", link: "/source/runtime-templates/run.template" },
        { text: "run-state.schema.json", link: "/source/runtime-templates/run-state.schema" },
      ],
    },
    {
      text: "è„šæœ¬ï¼ˆScriptsï¼‰",
      items: [
        { text: "æ¦‚è§ˆ", link: "/source/scripts/" },
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
        { text: "æ¦‚è§ˆ", link: "/source/cli/" },
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
        { text: "æ¦‚è§ˆ", link: "/source/dashboard/" },
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
      text: "æ‰©å±•ï¼ˆExtensionsï¼‰",
      items: [
        { text: "æ¦‚è§ˆ", link: "/source/extensions/" },
        { text: "demand-pool: extension", link: "/source/extensions/demand-pool/extension" },
        { text: "demand-pool: demands", link: "/source/extensions/demand-pool/demands" },
      ],
    },
    {
      text: "æ‚é¡¹",
      items: [
        { text: "VERSION", link: "/source/version" },
        { text: "LICENSE", link: "/source/license" },
        { text: "NOTICE", link: "/source/notice" },
      ],
    },
  ];
}

function testingSidebar(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "æ¦‚è§ˆ",
      items: [{ text: "æµ‹è¯•ä¸­å¿ƒ", link: "/zh/testing/" }],
    },
    {
      text: "æ²™ç›’æµ‹è¯•",
      items: [
        { text: "æ²™ç›’æ¦‚è§ˆ", link: "/zh/testing/sandbox/" },
        { text: "Runner å·¥ä½œæœºåˆ¶", link: "/zh/testing/how-runner-works" },
        { text: "æµ‹è¯•å¤¹å…·", link: "/zh/testing/sandbox/fixtures" },
        { text: "æµ‹è¯•çŸ©é˜µï¼ˆ12 é¡¹ï¼‰", link: "/zh/testing/sandbox/test-matrix" },
        { text: "æµ‹è¯•è®°å½•æ¨¡æ¿", link: "/zh/testing/sandbox/template" },
      ],
    },
    {
      text: "æ²™ç›’åœºæ™¯",
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
      text: "å¥‘çº¦æµ‹è¯•",
      items: [
        { text: "æµ‹è¯•ç­–ç•¥", link: "/zh/testing/strategy" },
        { text: "ä»£è¡¨æ€§æ ·æœ¬", link: "/zh/testing/samples" },
        { text: "å¦‚ä½•åœ¨ä½ çš„é¡¹ç›®é‡Œè·‘", link: "/zh/testing/how-to-run" },
      ],
    },
  ];
}
