---
title: ADR 时间线
outline: deep
---

# ADR 时间线

按时间顺序索引每一条框架级架构决策记录（ADR）。完整的理由与权衡请参阅 [Architecture Decisions](/zh/concepts/decisions)。

## 本页是什么

[Architecture Decisions](/zh/concepts/decisions) 页面按**主题**列出 ADR —— 解耦、演化、保全、验证 —— 这是当你想理解"机制 X 为何存在？"时的正确视角。

本页将**同一组 ADR 按时间顺序**列出，提供一个"Archon 是怎么走到今天的？"视角：哪些问题最先浮现、尝试过哪些答案、哪些曾被拒绝又在后来被重新评估。

## 按时代分组

### Bootstrap 时代（ADR-1 至 ADR-9）

最早的 ADR 关注**身份 + 强制执行**：确立 Archon 是什么、cognitive loop 如何运转、存在哪些 enforcement 层级，以及 Archon 可以假定哪些平台级原语（husky、Cursor hooks）。

- **ADR-1** —— Supabase 作为 BaaS（项目级，而非框架级）
- **ADR-9** —— B4 git-guardrails：pre-push + shell 层双层破坏性命令拦截

### Sovereignty 时代（ADR-10 至 ADR-14）

焦点转向**故障下的自治**：claim verifier、保全轴、sub-agent 独立性、run-state 机制。

- **ADR-10** —— Sub-agent 模型族独立性
- **ADR-14** —— Run-State v2（按交付的临时状态）

### Knowledge-evolution 时代（ADR-15 至 ADR-22）

Archon 如何从自身交付中学习：演化循环、drift 机制、records-folder event sourcing。

- **ADR-17** —— Blink Dispatch（sub-agent dispatch 薄切片闸门）
- **ADR-20** —— Lint-Rule Bridge（将承重 skill 提升为 linter 规则）
- **ADR-22** —— Records-folder event sourcing（drift / debt / memos 作为热摘要）

### Preservation 时代（ADR-27 至 ADR-29）

防御对治理实质的悄然侵蚀。

- **ADR-27** —— Claim Verifier（说-与-实之间的 drift 捕获器）
- **ADR-28** —— Preservation Axis（承重规则钉定：anchor + body-shape test + portable contract）
- **ADR-29** —— Decision Gate 上的 Source Modularity Probe + Verdict card

## 否决型 ADR

被显式拒绝的选项。每一条都附带**重新评估条件**，以便当世界发生变化时可以机械地重新审视该拒绝。

- **ADR-N1** —— SSR 迁移（在当前规模下拒绝；若 SEO / 首屏时间变得关键，则重新评估）。

## 在哪里阅读完整内容

- [Architecture Decisions](/zh/concepts/decisions) —— 权威来源，按主题排序，附带权衡与重新评估条件。
- [Framework Changelog](/zh/changelog/framework) —— 哪个发布版本承载了哪条 ADR。

## 新增一条 ADR

当某次交付引入一个框架级决策时，通过 `/archon-demand` 在 close-out 阶段添加新的 ADR。工作流：

1. 在 `/archon-plan` 期间，于 Decision Gate 提出该 ADR。
2. 用户裁决（accept / reject / defer）。
3. 若被接受，close-out 将条目写入 `docs/archon/decisions.md` 并递增下一个 ID。
4. 本页（ADR Timeline）从 decisions-log 表头重新生成。
