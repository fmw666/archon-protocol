# 快速开始

将 Archon Protocol 接入你的项目，只需要三步。

## 前置条件

- AI 编程平台（Cursor / Claude Code / 其他支持规则 + 命令的平台）
- Git 仓库
- 包管理器（npm / pip / cargo 等，用于注册验证命令）

## 第一步：获取协议文件

### 方式一：下载压缩包

前往 [下载页面](/download/)，选择你的平台，下载并解压到项目根目录。

### 方式二：手动复制

从 [GitHub 仓库](https://github.com/fmw666/archon-protocol) 的 `protocol/` 目录复制文件。

按以下结构放置：

```
你的项目/
├── .archon/
│   └── soul.md              ← 从 protocol/.archon/soul.md
├── .cursor/                  ← 或 .claude/（取决于平台）
│   ├── commands/
│   │   ├── archon.md
│   │   ├── archon-plan.md
│   │   ├── archon-demand.md
│   │   └── archon-review.md
│   ├── agents/
│   │   ├── archon-reviewer.md
│   │   └── archon-capture-auditor.md
│   └── rules/
│       ├── archon-decouple.mdc    ← Cursor 用 .mdc，Claude Code 用 .md
│       └── archon-wake.mdc
└── ...
```

## 第二步：创建项目状态文件

这些文件是**项目特定**的，用模板初始化后按你的项目实况填写。

### manifest.md

路径：`.archon/manifest.md`

这是 Archon 每次启动时加载的**项目全貌文件**，也是唯一允许放项目细节的 Archon 文件。

::: details 查看模板
```markdown
# Project Manifest

> Archon 每次启动时读取此文件获取项目全貌。每次交付后由 Archon 自行更新。

## 产品

<!-- 一段话描述产品是什么、核心用户流程、商业模式 -->

## 技术栈

| 层 | 选型 | 版本 |
|----|------|------|
| <!-- 逐层填写 --> | | |

## 验证命令

<!-- 声明项目的验证命令，覆盖 lint + typecheck + test -->

## Git 策略

| 配置项 | 值 |
|--------|---|
| 模式 | `prompt` / `auto` / `off` |
| 分支模型 | `direct` / `feature-branch` / `trunk-based` |

## 目录结构

<!-- 项目目录树 -->

## 知识资产

<!-- 规则、技能、决策的索引 -->

## 里程碑与验收标准

### M0 — 基础设施 ⬜

功能验收：
- [ ] <!-- 具体、可测试的功能点 -->

质量门：
- [ ] 验证命令全绿

## 当前状态

- **当前里程碑**：M0
- **已完成**：—
- **已知问题**：见 `debt.md`
```
:::

### drift.md

路径：`.archon/drift.md`

::: details 查看模板
```markdown
# Drift Counter

> 认知漂移计数器。每次交付后由 Archon 评估复杂度并累加。达到阈值时触发全量审查。

## 当前值

**drift: 0**

## 规则

| 交付复杂度 | 定义 | 加分 |
|-----------|------|------|
| trivial | 单文件改动、配置调整 | +1 |
| small | 2-5 文件、无新模式 | +2 |
| medium | 新模块、新模式、5-10 文件 | +3 |
| large | 架构变更、跨层改动 | +5 |

**阈值：12** — drift ≥ 12 时，下次交付前必须先执行全量审查。

## 日志

| 日期 | 交付摘要 | +分 | 沉淀 | 累计 |
|------|---------|-----|------|------|
```
:::

### debt.md

路径：`.archon/debt.md`

::: details 查看模板
```markdown
# 技术债务登记簿

> 推迟可以，遗忘不行。推迟 = 登记 + 截止日期。不登记 = 不存在 = 没人管。

| ID | 来源 | 严重度 | 描述 | 截止日期 | 状态 |
|----|------|--------|------|----------|------|
```
:::

## 第三步：配置结构守卫

Archon 的治理效力取决于机器化执行。

### 注册验证命令

在包管理器中注册一个**单一入口**的验证命令：

::: code-group
```json [Node.js (package.json)]
{
  "scripts": {
    "validate": "eslint . && tsc --noEmit && vitest run"
  }
}
```

```toml [Python (pyproject.toml)]
[tool.taskipy.tasks]
validate = "ruff check . && mypy . && pytest"
```

```makefile [Makefile]
validate:
	cargo clippy -- -D warnings && cargo test
```
:::

在 `manifest.md` 的验证命令区块中声明这个命令。

### 可选：治理预算测试

治理文件会随交付膨胀。将长度约束写成**测试用例**，让它跑在验证命令中：

```typescript
// governance.test.ts
const FILE_BUDGET = {
  '.archon/drift.md': { limit: 100, hint: '压缩旧周期日志' },
  '.archon/debt.md': { limit: 40, hint: '移除已解决条目' },
  '.archon/manifest.md': { limit: 350, hint: '折叠已完成里程碑' },
}

for (const [file, { limit, hint }] of Object.entries(FILE_BUDGET)) {
  test(`${file} ≤ ${limit} lines`, () => {
    const lines = readFileSync(resolve(ROOT, file), 'utf-8').split('\n').length
    expect(lines, `${lines} 行超出预算 ${limit}。→ ${hint}`).toBeLessThanOrEqual(limit)
  })
}
```

### 可选：Pre-commit Hook

```bash
# .husky/pre-commit
cd <source-dir> && <validate-command>
cd ..

# Archon 生命周期门禁：源码变更必须伴随 drift 日志更新
if git diff --cached --name-only | grep -q '^<source-dir>/'; then
  if ! git diff --cached --name-only | grep -q '^.archon/drift\.md$'; then
    echo "⛔ source changed but drift.md not staged."
    exit 1
  fi
fi
```

## 验证安装

在 AI 编程平台中运行：

```
/archon plan
```

或直接说：

```
hi archon, 当前项目状态如何？
```

如果 Archon 能读取 soul + manifest 并输出状态分析和下一步建议，说明接入成功。

## 下一步

- 了解完整架构 → [系统总览](/architecture/)
- 深入理解 Drift 机制 → [漂移机制](/architecture/drift)
- 查看协议源码 → [协议源码](/reference/)
