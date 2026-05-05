# @archon/cli 更新日志

## [0.1.0] — 2026-05-04

首个预览版本。npm 包名为占位名称，最终名称将在首次公开发布前确定。

### 新增
- `archon init &lt;target-dir&gt;` — 通过仓库内的导出管线脚手架生成一个新的
  Archon 治理项目，并在初始化完成后展示横幅，列出 4 项首次接触任务
  （填写 manifest、替换 ADR-1、接入 validation-command、阅读快速上手指南）。
- `archon doctor [project-dir]` — 三层审计：L1 结构性文件存在性检查、
  L2 委托给 `scripts/archon-check.py`、L3 manifest 占位符与
  validation-command 提示。
- `archon export &lt;output-dir&gt;` — 对 `scripts/export-archon-core.mjs` 的轻量封装，
  复用同一份 DOC_FILE_MAP / PLATFORM_FILES / TEMPLATE_FILE_MAP 作为唯一事实来源。
- 通用参数：`--platform`、`--overwrite`、`--dry-run`、`--source`、
  `--python`（仅 doctor 使用）、`--help`、`--version`。
- 源码根目录自动发现：从 `cwd` 向上逐级查找 `.archon/VERSION` 与
  `scripts/export-archon-core.mjs`。

### 已知限制
- 需要已检出的 Archon 源码仓库（暂无独立的 npm 发布包）。
- 不提供交互式提示 — 仅支持参数驱动。
