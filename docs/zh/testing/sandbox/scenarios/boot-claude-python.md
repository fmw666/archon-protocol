---
title: "06 · boot-claude-python"
test_id: boot-claude-python
fixture: fixtures/sandbox-python (post-02)
ide: Claude Code
language: Python 3.12
stage: boot
status: pending
---

# 06 · boot-claude-python

## 本场景验证什么

启动流程（wake 规则 + 首个 demand）在 **Claude Code + Python** 上工作方式完全一致 ——
也就是说，cognitive loop 中没有任何环节暗中假设 Cursor 或 Node。具体来说：

1. Claude 的 wake 规则在会话启动时加载，无需 URL。
2. delivery loop 产出了 Python 源码改动，并伴随 pytest 通过结果。
3. drift 日志行使用与场景 05 相同的结构（证明行模板与平台无关）。

## 测试环境

| | |
|---|---|
| Fixture | 场景 02 的产物（`/tmp/archon-test-02`，安装后） |
| IDE | Claude Code |
| OS | 与场景 02 相同 |
| Archon source | local |
| 被测 Manifest 版本 | v0.1.0 |

## 前置条件

1. 场景 02 成功执行，且 run record 为 ✅。
2. Claude Code 已完全关闭并在同一项目上重新打开。

## 步骤

```text
1. With Claude Code reopened on /tmp/archon-test-02, in the chat panel
   paste exactly (no URL):
     hi archon, add a multiply(a, b) function to calculator.py with
     tests for both positive and negative inputs
2. Confirm any Plan-mode prompt the agent raises.
3. Watch it edit src/calculator.py + tests/test_calculator.py and run
   pytest.
4. Confirm close-out summary appears.
```

## 预期结果

| 检查项 | 预期 |
|-------|----------|
| Agent 接受不带 URL 的 `hi archon, ...` 调用 | yes |
| `src/calculator.py` 包含带类型注解的 `multiply` | yes |
| `tests/test_calculator.py` 覆盖正数 + 负数用例 | yes |
| `python -m pytest` 退出码 | 0 |
| `.archon/drift.md` 新增一行 | yes |
| 在 `src/`、`tests/`、`.archon/drift.md` 之外被修改的文件数 | 0 |

## 演示录像

<VideoPlaceholder test-id="boot-claude-python" />

<AsciinemaPlaceholder test-id="boot-claude-python" />

## 运行记录

下方表格根据 sandbox runner
（[`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs)）
写入 `docs/testing/sandbox/runs/boot-claude-python/` 目录下的 JSON 实时渲染。要新增一行，请运行

```bash
node scripts/sandbox-run.mjs --only=boot-claude-python
```

<RunRecords test-id="boot-claude-python" />


## 已知局限

- 与场景 05 相同的注意事项：Claude Code 在冷启动时的规则重载属于 UI 行为，
  并非可通过文件状态断言验证的内容。

## 交叉引用

- 前置：[02 install-claude-python](/zh/testing/sandbox/scenarios/install-claude-python)
- 平行：[05 boot-cursor-node](/zh/testing/sandbox/scenarios/boot-cursor-node)

<!-- sandbox-spec:start -->

```json
{
  "runnable": "agent",
  "fixture": "fixtures/sandbox-python",
  "ide_platform": "claude",
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
      "name": "agent boot (hi archon, claude code)",
      "agent": "boot"
    }
  ],
  "assertions": [
    {
      "file_exists": ".archon/run.md"
    }
  ],
  "notes": "Boot lifecycle is agent-only. Recorded as result=manual until an agent SDK adapter ships (KNOWN-003)."
}
```

<!-- sandbox-spec:end -->
