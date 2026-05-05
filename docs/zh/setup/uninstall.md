# Uninstall Protocol（移除）

当你决定从项目中移除 Archon 时，Archon 代理与 CLI 跑的协议。具有破坏性，但默认可逆 —— 你的治理 ledger 会被保留，除非你显式选了别的方式。

> 代理在 [`https://aaep.site/uninstall.md`](https://aaep.site/uninstall.md) 拉取可执行指令文件。本页是代理将要做的事的人类可读视图。

## 何时适用此协议

用户说（一旦 wake 规则加载就不需要 URL）：

- "uninstall archon"
- "remove archon"
- "I want to stop using archon"
- "hi archon, uninstall yourself"

代理把它当作破坏性操作：每一步都要求显式同意。

## 你的 ledger 三种选择

代理呈现的第一项决定：

| 模式 | 运行时 ledger 怎么办 | 默认？ |
|------|--------------------------------|----------|
| **P** Preserve in place | 留在 `.archon/` 下；周围的框架文件被移除 | ✓ 默认 |
| **A** Archive | 移到 `.archon-history-<ISO>/`，然后从 `.archon/` 移除 | |
| **D** Delete | 永久擦除 —— 需要键入字面单词 `DELETE` | |

`runtime_ledger_paths` 同时覆盖文件（`drift.md`、`debt.md` 等）与目录（`drift/`、`debt/`、`runs/`、`dashboard/heartbeats/` 等）。

默认（Preserve）意味着未来重装从你既有的治理历史接续 —— install + 同样的 ledger = 从你停下的地方继续。

## 8 个步骤

### 1. 确认意图与 ledger 模式

解释三种选择。等待显式 P / A / D 选择。

如果用户选 **D**，要求他们键入 `DELETE` 字面字符串。其他任何输入都中止。

### 2. 拉取 manifest

```
GET https://aaep.site/manifest.json
```

为了准确知道 Archon 拥有哪些路径。manifest 之外的文件**永远**不被触及。

### 3. 构建移除集

对项目中存在的每个规范文件分类：

- **REMOVE** 如果不在 `runtime_ledger_paths` 中。
- **LEDGER** 如果在 —— 第 4 步按 ledger 模式处理。

### 4. 按选择处理 ledger

| 模式 | 动作 |
|------|--------|
| **Preserve** | ledger 文件/目录无改动。原地保留。 |
| **Archive** | `mkdir .archon-history-<ISO>/` → 把每条 ledger 路径移进去 → 从 `.archon/` 移除原件。 |
| **Delete** | 完全移除每条 ledger 路径。 |

### 5. 移除框架文件

打印完整移除清单。要求最后一次确认。然后移除。

### 6. 最终清理

修剪由移除产生的空 Archon 目录（`.archon/`、`<binding-root>/commands/` 等）。**永不触及**含非 Archon 内容的同级目录 —— 例如 `<binding-root>/rules/` 仍可能含不以 `archon` 开头的用户规则。

### 7. 记录 uninstall

写 `.archon-uninstall-<ISO>.log` 到项目根，含：

- 时间戳。
- Manifest 版本。
- 选择的 ledger 模式。
- 移除路径完整清单。
- 归档位置（Archive 模式时）。

此日志住在 `.archon/` 之外，所以即便 Delete 模式它也能存活。

### 8. 总结

打印简洁摘要：

- ✓ 移除了 N 个文件。
- 📁 Ledger：preserved / archived to `<path>` / deleted。
- 🪵 日志写到 `.archon-uninstall-<ISO>.log`。
- 💡 后续重装：让你的代理 *"read aaep.site/skill.md and install archon"*（uninstall 移除了 wake 规则，所以又需要 URL 引导），或者如果你有 Node ≥ 18，跑 `npx @archon/cli@latest install --force`。如果选了 Preserve 或 Archive，你的 ledger 会接续。

## 安全保证

- 默认模式是 **Preserve** —— 破坏性选择要求显式选入。
- Delete 模式要求字面键入 `DELETE`。没有一键灾难。
- 不在规范 manifest 中的文件**永不**被触及。代理拒绝删除任何无法证明 Archon 拥有的东西。
- uninstall 日志写在 `.archon/` **之外**，所以即便 Delete 模式 uninstall 之后你也有记录。

## CLI 等价（可选，需要 Node ≥ 18）

```bash
# 保留 ledger（默认）
npx @archon/cli@latest uninstall

# 归档 ledger 到 .archon-history-<ISO>/
npx @archon/cli@latest uninstall --archive-ledgers

# 破坏性 —— 擦除 ledger，要求 DELETE 确认
npx @archon/cli@latest uninstall --delete-ledgers

# 预览将发生什么，不写任何东西
npx @archon/cli@latest uninstall --dry-run
```

CLI 自身需要 Node ≥ 18。如果你没装 Node，让你的代理 *"uninstall archon"* —— 对话路径执行同样的 8 步协议。

## Uninstall 之后重装

如果你保留或归档了 ledger，未来重装会恢复它们。

**没有 Node**（任何平台的代理路径）：

```text
# 在你的 AI 编码 chat 面板里：
read aaep.site/skill.md and install archon (force)
```

URL 又需要了，因为 uninstall 把 wake 规则从你的绑定目录里移除了；没有 `archon-wake.mdc`（或其平台等价物）在上下文中，你的代理在拉协议之前没有「Archon」的概念。

**有 Node ≥ 18**（CLI 路径）：

```bash
# preserved: ledger 仍在 .archon/，只需在它们周围重装框架
npx @archon/cli@latest install --force

# archived: 先移回，再装
mv .archon-history-<ISO>/* .archon/
npx @archon/cli@latest install --force
```

`--force` 告诉 install 跳过「已装」拒绝检查并重拉框架文件。

## 原始代理文件

[`https://aaep.site/uninstall.md`](https://aaep.site/uninstall.md)

## 接下来

- 去别处？带上你的 `.archon-history-<ISO>/` 归档 —— 它就是 markdown，任何编辑器都能读。
- 回来？见 [Install](/zh/setup/install)。
- 这条命令所在的完整生命周期：[完整生命周期](/zh/setup/lifecycle)。
