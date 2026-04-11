<script setup>
import { ref } from 'vue'

const platform = ref('cursor')

const platformConfig = {
  cursor: {
    name: 'Cursor',
    dir: '.cursor',
    ruleExt: '.mdc',
    note: 'Rules 文件需要使用 .mdc 扩展名（YAML frontmatter + Markdown）',
  },
  'claude-code': {
    name: 'Claude Code',
    dir: '.claude',
    ruleExt: '.md',
    note: '需要在项目根目录放置 CLAUDE.md 入口文件',
  },
  other: {
    name: '其他平台',
    dir: '{platform}',
    ruleExt: '.md',
    note: '确认你的平台支持 Commands + Agents + Rules 文件加载',
  },
}
</script>

# 下载 Archon Protocol

## 获取方式

### 方式一：下载压缩包

<a href="https://github.com/fmw666/archon-protocol/archive/refs/heads/main.zip" target="_blank">
  <button style="padding: 12px 24px; background: #6d28d9; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: 600;">
    下载完整仓库 (.zip)
  </button>
</a>

下载后解压，将 `protocol/` 目录中的文件按下方的部署指南放入你的项目。

### 方式二：Git Clone

```bash
git clone https://github.com/fmw666/archon-protocol.git
cd archon-protocol
```

`protocol/` 目录包含所有协议文件。

### 方式三：直接从 GitHub 复制

访问 [protocol/ 目录](https://github.com/fmw666/archon-protocol/tree/main/protocol)，逐个复制需要的文件。

## 部署指南

<div style="display: flex; gap: 8px; margin: 16px 0;">
  <button v-for="(cfg, key) in platformConfig" :key="key" @click="platform = key" :style="{ padding: '8px 16px', background: platform === key ? '#6d28d9' : '#f3f4f6', color: platform === key ? 'white' : '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: platform === key ? '600' : '400' }">
    {{ cfg.name }}
  </button>
</div>

::: info {{ platformConfig[platform].name }}
{{ platformConfig[platform].note }}
:::

将 `protocol/` 中的文件按以下映射放入项目根目录：

```
protocol/.archon/soul.md         →  .archon/soul.md
protocol/commands/archon.md      →  {{ platformConfig[platform].dir }}/commands/archon.md
protocol/commands/archon-plan.md →  {{ platformConfig[platform].dir }}/commands/archon-plan.md
protocol/commands/archon-demand.md → {{ platformConfig[platform].dir }}/commands/archon-demand.md
protocol/commands/archon-review.md → {{ platformConfig[platform].dir }}/commands/archon-review.md
protocol/agents/archon-reviewer.md → {{ platformConfig[platform].dir }}/agents/archon-reviewer.md
protocol/agents/archon-capture-auditor.md → {{ platformConfig[platform].dir }}/agents/archon-capture-auditor.md
protocol/rules/archon-decouple.md → {{ platformConfig[platform].dir }}/rules/archon-decouple{{ platformConfig[platform].ruleExt }}
protocol/rules/archon-wake.md    → {{ platformConfig[platform].dir }}/rules/archon-wake{{ platformConfig[platform].ruleExt }}
```

然后用模板初始化项目状态文件：

```
protocol/templates/manifest.md   →  .archon/manifest.md  （按项目实况填写）
protocol/templates/drift.md      →  .archon/drift.md
protocol/templates/debt.md       →  .archon/debt.md
```

## 文件清单

### 协议核心（必需）

| 文件 | 说明 |
|------|------|
| `.archon/soul.md` | 认知内核 — 身份基石、认知循环、进化机制 |
| `commands/archon.md` | 统一入口 + 意图路由 |
| `commands/archon-plan.md` | 规划模式工作流 |
| `commands/archon-demand.md` | 需求交付工作流 |
| `commands/archon-review.md` | 全量审查工作流 |
| `agents/archon-reviewer.md` | 独立审查 sub-agent |
| `agents/archon-capture-auditor.md` | 知识捕获 sub-agent |
| `rules/archon-decouple` | 解耦守则 |
| `rules/archon-wake` | 唤醒触发器 |

### 项目模板（必需，需按项目填写）

| 文件 | 说明 |
|------|------|
| `.archon/manifest.md` | 项目全貌 — 技术栈、里程碑、状态 |
| `.archon/drift.md` | 漂移计数器 — 初始值 0 |
| `.archon/debt.md` | 债务登记簿 — 初始为空 |

### 可选扩展

| 文件 | 说明 |
|------|------|
| Dashboard | 治理状态可视化仪表盘（见 `extensions/dashboard/`） |
| 治理预算测试 | 文件行数约束的自动化测试（见 `extensions/governance-test/`） |

## 验证安装

部署完成后，在 AI 编程平台中运行：

```
hi archon, 当前状态如何？
```

或：

```
/archon plan
```

如果 Archon 能正确输出项目状态分析和下一步建议，说明安装成功。

::: tip 下一步
安装完成后，阅读 [快速开始](/guide/quick-start) 了解如何配置验证命令和结构守卫。
:::
