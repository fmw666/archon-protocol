---
title: 测试策略
outline: deep
---

# 测试策略

## 三层验证关卡

Archon 的验证体系刻意采用分层设计，让不同类型的失败由不同的机制捕获。

### L1 — 可移植治理契约

由 `.archon/contracts/governance-contract.yaml` 提供，被两个等价的检查器消费：

- `scripts/archon-check.py` — 仅依赖 Python 标准库（可在任何带 Python 3 的 CI 镜像上运行）。
- `scripts/archon-check.sh` — Bash 移植版本。

它验证的内容：

- **文件结构** — `soul.md`、`manifest.md`、`decisions.md` 等文件中必需的标题 / 章节是否存在。
- **交叉引用** — 每个 `<file> §<heading>` 链接都能机械地解析。
- **行数上限** — `.archon/soul.md`、`.archon/manifest.md`、`decisions.md`、drift / debt 热索引遵守其声明的预算。
- **归档卫生** — drift / debt / memos 归档头部携带预期的行数。
- **禁用子串** — 宿主项目术语不会泄漏进通用模块（Universal Module Guard）。
- **Preservation Axis 探针**（ADR-28）— 承重标题保持其正文形态。

### L2 — 导出清单往返检查

`scripts/test-archon-export.mjs` 对每个平台目标执行一次 dry export，并断言：

- 每张被打包 markdown 引用的图片都列在 `DOC_ASSET_FILES` 中。
- 平台路径重写（`.cursor/` → `.claude/`、`.mdc` → `.md`）能够干净地往返。
- 必需的核心文件都存在。

这层关卡捕获最常见的导出回归：往 `architecture.md` 新增一张漫画，但忘了更新导出清单。

### L3 — 项目 validate 流水线

接入方在 `.archon/manifest.md` § Validation Command 中声明这一项。示例（Node 技术栈）：

```bash
npm run validate  # lint + typecheck + test + bundle-budget
```

Archon 不规定这里具体跑什么 —— 它只坚持要求**某种**验证命令存在，并在交付收尾前通过。

## 关卡组合

这三层通过创作仓库的 `npm run validate` 入口组合在一起：

```text
validate
├── archon:records:check   # records 文件夹折叠完整性（ADR-22）
├── archon:check           # archon-check.py（L1）
├── archon:verify          # claim 校验器（ADR-27）
├── archon:export:test     # test-archon-export.mjs（L2）
└── <project-specific>     # eslint + tsc + vitest + bundle budget（L3）
```

所有 pre-commit 与 pre-push 钩子都跑同一条链（通过 `.husky/`）。

## **不**被机械化测试的内容

有意保留的缺口：

- **设计质量** — 视觉打磨、文案语气。这些走 Plan 模式下的人工评审，而不是 CI。
- **ADR 取舍质量** — 一个被否决的备选方案可以在技术上自洽，但在战略上是错的。这类捕获在 ADR-N 行（负 ADR）+ 重评条件中。
- **用户代码中的领域正确性** — Archon 治理的是治理本身，而不是产品逻辑。产品测试由产品团队拥有。

界线是：*如果一个错误可以被机械化，那就必须被机械化*。如果不能，就升级治理面直到它能（Lint-Rule Bridge — ADR-20）。
