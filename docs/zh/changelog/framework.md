# Archon Framework Changelog

记录 **Archon framework**（可移植治理套件 —— 由 `scripts/export-archon-core.mjs`
生成的全部文件与机制集合）的所有重要变更。

格式遵循 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)，
版本规则遵循 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)。

> **什么算作 Archon 的变更？** 由导出流水线交付的文件（soul、domain lenses、
> 命令、agents、rules、skills、templates、portable helpers、`docs/archon/` 下
> 的文档）的任何修改。宿主项目应用代码的改动不属于本文件记录范围。

## Versioning Scheme

Archon 使用单一的 `MAJOR.MINOR.PATCH` 版本号，记录在 `.archon/VERSION` 中，
并写入每一个独立导出包：

- **MAJOR** —— governance contract、文件布局或 wake 协议的破坏性变更，
  适配方需要手动迁移。
- **MINOR** —— 以向后兼容方式新增的机制、ADR、skills 或 domain lenses。
- **PATCH** —— 文档修复、模板说明澄清、portable helpers 的 bug 修复，
  或视觉素材更新。

## [Unreleased]

### Added
- _（计划中）_ `archon init` / `archon doctor` / `archon export` CLI (ROI-2)，
  支持一键接入，无需克隆 framework 源仓库。

### Audited
- 模板纯净度：`docs/archon/templates/{manifest,decisions,debt,drift,memos}.template.md`
  已确认不含宿主项目专属内容。所有概念示例要么是 HTML 注释形式的占位符，
  要么是有意为之的通用教学词汇
  （如 user-journeys 中的 `Booking`、`Launch Prep`、`Capability Package`）。

### Changed

### Fixed

## [0.2.0] — 2026-06-08

记忆层升级，来自对 Claude Code 项目级 memory + ADR 实践的对照研究
（见 ADR-31 / ADR-32 与 Negative ADR-N6 / ADR-N7）。

### Added
- **随包发行状态模板**（ADR-31）：五个可播种 ledger 现均有真实、经 sha256 校验的
  模板，归入 `core-templates` 模块并登记进 `export_manifest.required_files`——
  `manifest.template.md`、`decisions.template.md`，以及（在 `install-agent-cursor`
  沙箱跑暴露 LLM agent 会 under-seed 手工构造的 ledger 后补全本论点的）
  `drift.template.md`、`debt.template.md`、`memos.template.md`。`install.md` Step 7
  改为逐字复制 canonical 模板播种 `manifest / debt / drift / memos / decisions`，
  不再从散文构造，使新装确定性通过 `archon-check.py`——drift 的 `**drift: 0**` 哨兵、
  memos 的 `## Archive Index` 段、debt 的 `<!-- no-active-debt -->` 标记不再依赖
  散文遵从度。
- **接管期码库自扫描**（ADR-31）：`install.md` Step 7b——接管期 agent 只读扫描
  （package 清单、目录布局、README 术语）并预填 manifest 的 Tech Stack、目录结构、
  Concept Glossary 候选与 Source Modularity Map 种子。
- **路径作用域 manifest 切片**（ADR-32）：可选的 `.archon/manifest/slices/<slug>.md`
  片段，通过 `scope:` glob 限定子树，索引于根 manifest `## Manifest Slices` 段，
  pre-scan 按需加载。新增条件契约块 `manifest_slices` + `archon-check.py` 的
  `assert_manifest_slices`（缺目录即跳过，单作用域项目不受影响）。

### Changed
- `soul.md` §Knowledge Hygiene 新增 **Path-scoped slices** 预防性规则；核心 soul
  cap 310→315（ADR-32 理由记于 `file_budgets`）。
- `archon-demand.md` pre-scan 新增 **Manifest slice scan** 步骤，`modularity_probe`
  变为 slice-aware（不触动任何 pinned substring）。
- `.archon/VERSION` 0.1.0 → 0.2.0。

## [0.1.0] — 2026-05-04

Archon framework 的首个打标发布版本。机制集合体现了大约三个月在宿主项目中
的迭代成果（ADR-01 至 ADR-26）。

### Added
- **Soul model** —— 认知内核，包含 identity axioms、ownership contract、
  cognitive loop、autonomy principles、evolution axis、guardrail system
  （`soul.md` + 路由级 `soul/delivery.md` · `soul/review.md`）。
- **三层目录布局** —— `.archon/`（core + project state）+ 平台目录
  （`.cursor/` / `.claude/`）+ `docs/archon/`（参考文档）。
- **认知状态文件** —— manifest / drift / debt / memos / decisions 六件套，
  从不可变记录中再生 hot-summary（ADR-22 records-folder）。
- **Delivery 生命周期** —— Decision Gate（Verdict）· Validation Gate ·
  Close-Out，机械化产物由 Claim Verifier 校验（ADR-27）。
- **Blink Dispatch** —— close-out 子 agent 派遣的 thin-slice 分诊门
  （ADR-17）。
- **Constraint pyramid** —— L0–L5 强制等级，配合 Lint-Rule Bridge 将 skills
  晋升为 linter rules（ADR-20）。
- **Preservation Axis** —— 承重 rule 登记表，带 anchor + body-shape test
  + portable contract（ADR-28）。
- **Source Modularity Probe** —— Decision Gate 处的机械化架构债探针
  （ADR-29）。
- **Run-State v2** —— 单次 delivery 的临时状态，存放于
  `.archon/runs/<run_id>/` 并附带 JSON schema（ADR-14 扩展）。
- **Domain Lenses** —— 预 Verdict 的 lens 索引，首批交付五个 lens：dev、
  design、platform、ecosystem、capability。
- **Portable helpers** —— `archon-check.py`（governance contract）、
  `archon-check.sh`（bash 移植版）、`archon-run-state.mjs`、
  `archon-records.mjs`、`archon-claim-verifier.mjs`。
- **双平台导出** —— `scripts/export-archon-core.mjs` 生成 Cursor 与
  Claude Code 就绪套件。
- **完整文档集** —— `docs/archon/` 下 18 个 markdown 文件，覆盖架构、
  接入、decisions（10 篇公开 ADR）、user journeys（16 篇）、concepts，
  以及 adoption quickstart。
- **漫画插图** —— 跨 README、architecture、setup、user-journeys、decisions、
  adoption quickstart 共 26 张生成的漫画解说图。

### Governance
- Apache-2.0 License。
- `NOTICE` 文件描述第三方致谢。
- Portable governance contract（`.archon/contracts/governance-contract.yaml`）
  由 Node 与 Python 两套运行时校验。

---

[Unreleased]: https://github.com/fmw666/archon-protocol/compare/archon-v0.1.0...HEAD
[0.1.0]: https://github.com/fmw666/archon-protocol/releases/tag/archon-v0.1.0
