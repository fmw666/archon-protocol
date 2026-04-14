# Project Manifest

> Archon 每次启动时读取此文件获取项目全貌。每次交付后由 Archon 自行更新。

## 平台

<!-- Archon 核心文件统一在 .archon/（所有平台通用），平台特定文件在各平台 dotdir 下 -->

| 逻辑名 | 实际路径 | 说明 |
|--------|---------|------|
| Archon 核心 | `.archon/` | 所有平台通用 |
| 规则目录 | <!-- .cursor/rules / .claude/rules --> | 平台特定 |
| 技能目录 | <!-- .cursor/skills / .claude/skills --> | 平台特定 |
| Agent 目录 | <!-- .cursor/agents / .claude/agents --> | 平台特定 |
| 命令目录 | <!-- .cursor/commands / .claude/commands --> | 平台特定 |

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
| 提交规范 | <!-- 如 Conventional Commits --> |

## 目录结构

<!-- 项目目录树，每个目录加简要说明 -->

## 知识资产

### 规则（规则目录）

| 文件 | 职责 | 约束范围 |
|------|------|----------|
| `archon.mdc` | Archon 解耦守则 | archon 相关文件 |

### 技能（技能目录）

<!-- 按需添加 -->

### 生命周期钩子（Agent 目录）

| Agent | 触发时机 | 职责 |
|-------|---------|------|
| `archon-capture-auditor.md` | 每次交付收尾 | 知识捕获 + 盲区反思 + 交付卫生 |
| `archon-reviewer.md` | drift ≥ 12 或手动触发 | 全量项目审查 |

### 架构决策

<!-- 如 `docs/archon/decisions.md`，填写 ADR 数量和摘要 -->

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

### Stakeholder 对话备忘

| 日期 | 议题 | 结论 | 依据 |
|------|------|------|------|
