---
title: "05 · boot-cursor-node"
test_id: boot-cursor-node
fixture: fixtures/sandbox-node-ts (post-01)
ide: Cursor
language: Node 20 + TypeScript
stage: boot
status: pending
---

# 05 · boot-cursor-node

## 本 scenario 验证什么

在安装完成后（scenario 01），**wake 规则会在会话启动时自动加载**，
agent 能够**无需 URL** 响应 Archon 路由的提示词。这是安装后流程的
杀手级特性 —— 用户不再需要记住 `aaep.site/skill.md`。

本 scenario 同时演练**第一次真实的 demand 周期**：agent 加载
`soul.md` + `manifest.md`，挑选一个 domain lens，跑完交付循环，并按需
写入 `drift.md` + `debt.md` + `memos.md`，并在 fixture 的 `src/` 中
产出真实代码变更。

## 测试环境

| | |
|---|---|
| Fixture | scenario 01 的输出（`/tmp/archon-test-01`，安装后状态）|
| IDE | Cursor（同一会话或全新重启）|
| 操作系统 | 与 scenario 01 相同 |
| Archon 源 | 本地（不联网拉取）|
| 待测 manifest 版本 | v0.1.0 |

## 前置条件

1. Scenario 01 已成功运行，且其 run 记录为 ✅。
2. Cursor 已**完全关闭并重新打开**到同一项目，确保 wake 规则的
   "会话启动时加载"行为被真正触发。

## 步骤

```text
1. With Cursor reopened on /tmp/archon-test-01, open the chat panel.
2. Paste exactly (no URL):
     hi archon, add a "completedAt: Date | null" field to Todo and a
     toggleAndStamp helper that sets it on completion, undoes on uncheck
3. Watch the agent walk the Archon delivery loop:
     - reads soul.md / manifest.md / drift.md / debt.md
     - picks the dev lens
     - drafts a plan, asks for confirmation if the change is non-trivial
     - implements src/todo.ts + src/todo.test.ts
     - runs npm run validate
     - appends a row to drift.md with the demand summary
     - prints close-out summary
4. Inspect git diff to confirm changes are scoped to src/ and
   .archon/drift.md (not the wider Archon kit).
```

## 预期结果

| 检查项 | 期望 |
|-------|----------|
| Agent 在用户未提供 URL 的情况下识别 `hi archon, ...` | yes |
| `src/todo.ts` 包含新的 `completedAt` 字段及 helper | yes |
| `src/todo.test.ts` 覆盖新增的 helper | yes |
| `npm run validate` 退出码 | 0 |
| `.archon/drift.md` 新增一行，含今日日期 + demand 摘要 | yes |
| `.archon/debt.md` 保持不变（一次干净交付不应登记 debt）| yes |
| `.archon/VERSION` 保持不变 | yes |
| `src/` 与 `.archon/drift.md` 之外被改动的文件数 | 0 |

## 演示录像

<VideoPlaceholder test-id="boot-cursor-node" />

<AsciinemaPlaceholder test-id="boot-cursor-node" />

## 运行记录

下表由 sandbox runner
（[`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs)）
写入 `docs/testing/sandbox/runs/boot-cursor-node/` 下的 JSON 实时渲染。
追加新一行运行记录请执行：

```bash
node scripts/sandbox-run.mjs --only=boot-cursor-node
```

<RunRecords test-id="boot-cursor-node" />


## 已知局限

- "wake 规则在会话启动时加载"依赖 Cursor 规则加载器是否真的把
  `archon-wake.mdc` 暴露出来。如果冷启动 Cursor 后规则要等到手动
  reload 才生效，那是 Cursor 的 UI 行为问题，应在
  `KNOWN-ISSUES.md` 中记录，而不是判定本 scenario 失败。
- 实现质量的评判标准是 `npm run validate` 通过 —— 而非代码风格偏好。
  风格打磨不在本 scenario 范围内（由 design lens 负责，而非
  delivery）。

## 交叉引用

- 协议页面：[`/zh/setup/lifecycle`](/zh/setup/lifecycle) §
  "Daily Cognitive Loop"
- Soul / delivery：[`/source/soul-delivery`](/source/soul-delivery)
- 前置：[01 install-cursor-node](./install-cursor-node)
- 平行：[06 boot-claude-python](./boot-claude-python)

<!-- sandbox-spec:start -->

```json
{
  "runnable": "agent",
  "fixture": "fixtures/sandbox-node-ts",
  "ide_platform": "cursor",
  "prerequisites": [
    {
      "name": "archon install",
      "cli": "install",
      "flags": [
        "--with=cli"
      ]
    }
  ],
  "steps": [
    {
      "name": "agent boot (hi archon)",
      "agent": "boot"
    }
  ],
  "assertions": [
    {
      "file_exists": ".archon/run.md"
    }
  ],
  "notes": "Boot lifecycle requires a real coding agent. Recorded as result=manual until an agent SDK adapter ships (KNOWN-003)."
}
```

<!-- sandbox-spec:end -->
