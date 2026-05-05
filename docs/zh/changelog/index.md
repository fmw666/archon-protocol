# Changelog

Archon 的版本历史分为三条时间线：**framework 本身**、**CLI**，以及驱动每次重大变更的**架构决策**。

## 页面

- [Framework Changelog](/zh/changelog/framework) — 可移植治理套件的每次发布（由 `export-archon-core.mjs` 输出的文件）。
- [Archon CLI Changelog](/zh/changelog/cli) — `tools/archon-cli/` 的发布历史。
- [ADR Timeline](/zh/changelog/adr-timeline) — 按时间顺序排列的架构决策，附带"变更内容"摘要。

## 版本规则

Archon 使用单一的 `MAJOR.MINOR.PATCH` 版本号，记录在 `.archon/VERSION` 中，并写入每一个独立导出的包：

- **MAJOR** — 治理契约、文件布局或唤醒协议的破坏性变更，需要使用者手动迁移。
- **MINOR** — 以向后兼容的方式新增机制、ADR、skill 或 domain lens。
- **PATCH** — 文档修订、模板澄清、可移植 helper 的 bug 修复、视觉资产更新。

当前版本：**v0.1.0**（首个打标签的发布）。发布说明详见 [Framework Changelog](/zh/changelog/framework)。
