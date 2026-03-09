# 快速上手

> 5 分钟理解 Archon Protocol 的使用方式。

---

## 安装

```bash
bash archon-protocol/templates/install.sh
```

这一条命令会将 Archon Protocol 部署到你的项目中：

- `skills/` → 复制到 `.cursor/skills/`、`.claude/skills/`、`.codex/skills/`（所有 AI 工具统一体验）
- `archon.config.yaml` → 项目根目录（若不存在则创建）

## 使用场景

### 场景 1：简单修改

你在 Cursor / Claude Code / Codex 中说：

> "修复按钮的颜色"

AI 正常修改代码。**约束 Skill 静默生效**——AI 不会引入 `any` 类型、不会忘记更新测试、不会产生重复渲染。你感觉不到 Archon Protocol 的存在，但它在工作。

### 场景 2：完整功能交付

你说：

> "/demand 添加暗色模式切换"

AI 进入 Demand 循环：实现 → 性能审计 → 六维自审 → 修复 → 提交。你什么都不用做，等待最终的 commit 和报告。

### 场景 3：只想审计

你完成了一些修改，想检查质量：

> "/self-auditor"

AI 在独立上下文中扫描你的修改，输出六维度的审计报告，不修改任何代码。（self-auditor 是内部 skill，但用户仍可直接调用。）

### 场景 4：不信任 AI 的声称

AI 说"已完成"，你想验证：

> "/verifier"

另一个独立的 AI 会怀疑一切——检查代码是否真的存在、测试是否真的通过、是否有遗漏。

## 各 AI 工具的体验

| 工具 | 你能用什么 | 怎么触发 |
|------|-----------|---------|
| **Cursor** | 全部 Skill | `/demand`、`/self-auditor` 等命令 |
| **Claude Code** | 全部 Skill | 描述任务，AI 自动匹配 skill |
| **Codex / Copilot** | 全部 Skill | 约束自动生效，描述任务时可提及 "follow the demand skill" |
| **其他工具** | 全部 Skill | 复制到对应 skills 目录即可，体验一致 |

所有工具现在获得相同的 Skill 体验，不再有额外的 rules/agents 差异。

## 自定义

### 添加新约束 Skill

1. 在 `archon-protocol/skills/<name>/SKILL.md` 中创建技能
2. 运行测试：`npx vitest run --config archon-protocol/vitest.config.js`

### 添加新工作流

1. 在 `archon-protocol/skills/<name>/SKILL.md` 中创建技能（SKILL.md 标准）
2. 在 init skill 中注册
3. 运行测试验证

### 项目配置

编辑 `archon.config.yaml` 调整：

- `name` — 项目名称
- `stack` — 技术栈
- `enabled_skills` — 启用的技能
- `test_command` — 测试命令

## 验证安装

```bash
npx vitest run --config archon-protocol/vitest.config.js
```

所有测试通过 = Archon Protocol 内部一致性完好。测试覆盖：
- Skill 格式合规
- 禁止项质量（足够具体、可 grep 验证）
- Demand 循环完整性
- 自进化闭环
- 生态完整性
