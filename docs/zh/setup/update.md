# Update Protocol（升级）

当你在**已装 Archon**的项目上说「update archon」时，Archon 代理与 CLI 跑的协议。两条路径同一结果；代理路径是对话式，CLI 路径是脚本式。

> 代理在 [`https://aaep.site/update.md`](https://aaep.site/update.md) 拉取可执行指令文件。本页是代理将要做的事的人类可读视图。

![漫画图解：install 路由](/images/setup/01-install-route.png)

## 何时适用此协议

用户说（一旦 `archon-wake.mdc` 或其平台等价物加载就不需要 URL —— 成功安装后自动加载）：

- "update archon"
- "upgrade archon"
- "pull latest archon"
- "hi archon, update yourself"

…且 `.archon/soul.md` + `.archon/VERSION` 已存在。

如果两者都不存在，代理应改路由到 **Install**。

## 什么**永不**被触及

manifest 的 `runtime_ledger_paths` 列表是神圣的。Update **永不**覆盖这些：

**文件**
- `.archon/manifest.md`
- `.archon/drift.md`
- `.archon/debt.md`
- `.archon/memos.md`
- `.archon/signs.md`
- `.archon/decisions.md`

**目录**
- `.archon/debt/`
- `.archon/drift/`
- `.archon/memos/`
- `.archon/memos-archive/`
- `.archon/manifest/`
- `.archon/dashboard/heartbeats/`
- `.archon/runs/`

这些是你项目的治理历史。只有你能改它们。

![漫画图解：两个家 —— 框架核心 vs 项目状态](/images/setup/02-two-homes.png)

## 9 个步骤

### 1. 确认 Archon 已装

`.archon/soul.md` 或 `.archon/VERSION` 缺失时拒绝。建议改用 **Install** 或 **Sync**。

### 2. 拉取规范 manifest

```
GET https://aaep.site/manifest.json
```

对比规范版本与 `.archon/VERSION`。相等且未设 `--force` 时，问要不要重新校验（本质上是 Sync）或退出。

### 3. 构建更新计划

对每个规范文件（除 ledger 外）：

| 分类 | 条件 |
|----------------|-----------|
| **ADD** | 路径在规范中，本地不存在 |
| **UPDATE** | 路径在规范中，本地存在，sha256 不同 |
| **UNCHANGED** | 路径在规范中，本地存在，sha256 匹配 |
| **REMOVE** | 路径之前装过（在选入的模块里）但用户现在通过 `--without=` 选出 |

代理也检测**之前装的可选模块**并问要不要弃掉任何一个。被弃模块对其文件触发 REMOVE 动作。

任何写入前都先显示计划：

```
Update plan: 0.1.0 → 0.2.0
  ADD     ( 3): .archon/skills/foo/SKILL.md, ...
  UPDATE  (12): .archon/soul.md, ...
  UNCHANGED (57)
  REMOVE  ( 0)
  Optional modules currently installed: cli, dashboard
  Optional modules available but not installed: extensions-demand-pool
Proceed? [y/N]
```

### 4. 下载并校验

与 install 相同的全有或全无 sha256 纪律。并行拉取、逐文件 sha256 检查、任一不匹配就中止整个 update。

### 5. 写入更新并备份

缓冲区里每个文件：

- **ADD** → 直接写（按需创建父目录）。
- **UPDATE** → 先把上一版拷到 `.archon-backup-<ISO>/<path>`，再覆盖。
- **REMOVE**（来自 `--without=`）→ 先拷到备份，再删。
- **UNCHANGED** → 跳过。

所有写入成功后，修剪由 REMOVE 动作产生的空父目录。

### 6. 处理陈旧 extras

如果项目有**不在规范中**的 Archon 拥有路径（如老版本被改名留下的文件），报告但**永不自动删除**。建议用户检查并决定。

### 7. 写入新 VERSION

把 `.archon/VERSION` 更新到规范版本。（注意：这是 `update` 在缓冲拉取之外唯一写的文件 —— 它走同一个保留行尾的写助手，所以后续 `sync` 不会把它报为漂移。）

### 8. 记录 update

追加到 `.archon/drift.md`：

```
- 2026-05-05 14:30 | update | v0.1.0 → v0.2.0 | agent=cursor-claude-opus | add=3 update=12 remove=0 | source=aaep.site/manifest.json
```

### 9. 总结

打印简洁摘要：

- ✓ N 加、M 更、K 不变、R 移除。
- 📦 备份在 `.archon-backup-<ISO>/`。
- 📜 高亮两个版本之间值得注意的 changelog 条目。
- → 建议跑 `archon sync` 确认全干净。

## Update 时的模块选择

`update` 接受与 install 相同的 `--with=` / `--without=` flag（CLI 路径；代理对话式接受同样的选择）：

```bash
# （CLI 示例 —— 需要 Node ≥ 18）

# 拉最新，保持当前模块选择
npx @archon/cli@latest update

# 拉最新 AND 选出 CLI 模块
npx @archon/cli@latest update --without=cli

# 拉最新 AND 选入 demand-pool 扩展
npx @archon/cli@latest update --with=extensions-demand-pool
```

`--without=` 移除模块时，其文件被移到备份并从项目中修剪。代理永不无声删除文件；它总是先显示移除计划。

## 守护规则

- 永不覆盖 `runtime_ledger_paths` 中的路径。
- 写入前总是 sha256 校验。
- 覆盖前总是备份。
- 总是记录到 `drift.md`。
- 永不自动删除 `--without=` 计划之外的 extras。

## CLI 等价（可选，需要 Node ≥ 18）

```bash
# 拉最新、应用 diff
npx @archon/cli@latest update

# 即便版本相同也重新校验（手动编辑后有用）
npx @archon/cli@latest update --force

# 预览计划，不写任何东西
npx @archon/cli@latest update --dry-run

# update + 弃模块
npx @archon/cli@latest update --without=cli,dashboard
```

CLI 自身需要 Node ≥ 18。如果你没装 Node，用上面描述的代理路径 —— 同样结果。

## 原始代理文件

[`https://aaep.site/update.md`](https://aaep.site/update.md)

## 接下来

- 确认全干净：[Sync](/zh/setup/sync)。
- 看它在更大图景中的位置：[完整生命周期](/zh/setup/lifecycle)。
