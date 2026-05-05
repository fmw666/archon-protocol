# Sync Protocol（漂移检查）

只读健康检查。拉取规范 manifest，本地走遍每条 Archon 拥有的路径，并报告是否有偏离规范的内容。**默认不写任何内容**，除了在发现值得关注时可选地写一条单行 memo。

> 代理在 [`https://aaep.site/sync.md`](https://aaep.site/sync.md) 拉取可执行的指令文件。本页是代理将要做的事的人类可读视图。

![漫画图解：交叉引用检查](/images/setup/06-cross-ref.png)

## 何时适用此协议

用户说（一旦 `archon-wake.mdc` 或其平台等价物加载，就不需要 URL）：

- "check archon"
- "is archon healthy?"
- "any archon drift?"
- "sync archon"
- "diff archon"
- "hi archon, sync yourself"

它默认**幂等且无副作用**。想跑多少次都行 —— pre-commit、CI、或任何怀疑时刻。

## 7 个步骤

### 1. 检查项目

`.archon/soul.md` 缺失时拒绝。建议改用 **Install**。

### 2. 拉取规范 manifest

```
GET https://aaep.site/manifest.json
```

### 3. 构建规范集

把 manifest 过滤为**项目至少装了一个文件的模块**。装了零个文件的可选模块被分开报为"not installed (optional, N files available)"而不是 `missing`。

这避免了你只是不要 dashboard 时看到「0/8 ok」这种混乱输出。

### 4. 遍历并分类

对规范集的每条路径，加上项目中每个 Archon 拥有的目录：

| 标签 | 含义 |
|-------|---------|
| `ok` | 路径在规范中 AND sha256 匹配 |
| `modified` | 路径在规范中 AND sha256 不同（你编辑了框架文件） |
| `missing` | 路径在规范中 AND 本地不存在（被删或从未装） |
| `extra` | 路径在 Archon 拥有的目录里但不在规范中（定制，或老版本留下的陈旧文件） |
| `ledger` | 路径在 `runtime_ledger_paths` 里 —— 归你所有，故意不 diff |

### 5. 打印报告

`modified` 文件的逐文件 diff 头（路径 + 双方 sha256 短哈希），然后逐模块摘要：

```
Module: core-soul              11/11 ok
Module: commands                5/5  ok
Module: rules                   2/3  ok, 1 modified
Module: cli                     not installed (optional, 14 files available)
Module: dashboard               not installed (optional, 22 files available)

Totals: 78 ok · 1 modified · 0 missing · 2 extra · 6 ledger
```

### 6. 提供后续

| 如果… | 建议 |
|-----|---------|
| `modified > 0` | 检查 diff；故意的就记下来；意外的跑 `update` 恢复 |
| `missing > 0` | 跑 `update` 拉缺失文件 |
| `extra > 0` | 检查 —— 可能是项目定制或老版本留下 |
| 全干净 | "Archon is healthy. ✓" |

### 7. 可选 memo

仅当发现值得关注时，给 `.archon/memos.md` 追加一行简洁说明。例行「全干净」结果不写任何内容。

## 为什么可选模块显示 "not installed"

早期 `sync` 版本对未选模块打印 `0/8 ok`，看起来像失败。当前协议把装了零个文件的模块视为**主动未装**，并清晰标注。

要装当前缺失的可选模块：

```bash
npx @archon/cli@latest update --with=<module-id>
```

## CLI 等价（可选，需要 Node ≥ 18）

```bash
# 人类可读报告
npx @archon/cli@latest sync

# 机器可读、可管道
npx @archon/cli@latest sync --json

# 私有镜像
npx @archon/cli@latest sync --base-url=https://archon.mycorp.com
```

CLI 自身需要 Node ≥ 18。如果你没装 Node，让你的代理 *"sync archon"* —— 对话路径在任何平台都能用。

## 原始代理文件

[`https://aaep.site/sync.md`](https://aaep.site/sync.md)

## 接下来

- 看到漂移？[Update](/zh/setup/update) 恢复规范。
- 全干净？回去写需求。下一篇值得读的概念页是[10 分钟速览](/zh/concepts/overview)。
- 准备离开 Archon？[Uninstall](/zh/setup/uninstall)。
