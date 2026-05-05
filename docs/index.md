---
layout: home
title: Archon
hero:
  name: Archon
  text: AI Engineering Governance
  tagline: A session-based framework that elevates the AI agent from "tool that follows instructions" to "engineering owner with full project accountability."
  image:
    src: /logo.svg
    alt: Archon
  actions:
    - theme: brand
      text: Install via Agent
      link: /setup/
    - theme: alt
      text: 10-Minute Overview
      link: /concepts/overview
    - theme: alt
      text: 5-Minute Quickstart
      link: /setup/quickstart
    - theme: alt
      text: Full Source
      link: /source/
features:
  - icon: 🧭
    title: Ownership, not Assistance
    details: The agent is the owner, accountable end-to-end — decisions, implementation, verification, knowledge crystallization, self-review. The user expresses product intent; Archon translates it into engineering action.
  - icon: 🔒
    title: Constraints over Prose
    details: A five-level pyramid (L0 runtime → L5 habit) pushes every load-bearing rule to the lowest level a machine can still enforce. If a linter or test can catch it, no governance prose is written.
  - icon: 🌀
    title: Directed Evolution
    details: Each delivery feeds the drift counter, the debt registry, and the preservation axis. Mechanisms that prove themselves are promoted; prose that silently drains is pinned by anchor + body-shape test + portable contract.
  - icon: 🧬
    title: Cognitive Loop Core
    details: Six phases — Recognize → Model → Decide → Execute → Verify → Learn — mapped to concrete files. Every phase has a machine check so the loop does not degrade into lip-service.
  - icon: 🗂️
    title: Decoupled, Portable
    details: .archon/ is project-agnostic and works with any AI coding agent (Cursor / Claude Code / Codex / Continue / Aider / Windsurf). Platform-specific binding directories plug in via Universal Module Guard; one manifest produces ready-to-use kits for every platform.
  - icon: 🔍
    title: Claim Verifier
    details: ADR-27 catches "said-vs-truth" drift. When governance prose claims a behavior, a portable verifier script walks the repo to prove it — or the claim fails the gate.
---

<div style="max-width: 980px; margin: 3rem auto; padding: 0 2rem;">

## What problem does Archon solve?

Every new AI coding session starts from zero. The agent forgets your product
vocabulary, re-invents your architecture, skips the tests your team has already
written, and re-proposes decisions the team already rejected three weeks ago.

The industry's reflex is to reach for **bigger models** or **bigger prompts**.
Archon's diagnosis is different: the agent needs **engineering environment**,
not more raw capability. Specifically it needs:

1. A **cognitive loop** it must walk on every delivery, not a free-form chat.
2. **Mechanical gates** that fail closed — tests, contract checks, lint rules
   — instead of optional prose it can ignore.
3. **Persistent state** — a manifest, a drift counter, a debt registry, an
   ADR log — that survives across sessions and across agents.
4. A **preservation axis** that refuses to let load-bearing rules silently
   disappear during well-meaning refactors.
5. An **ownership contract** that treats the agent as the accountable
   engineering party, not a suggestion-generator the user has to babysit.

Archon ships this as **one consistent vocabulary** — soul, manifest, drift,
debt, memos, decisions, domain lenses, signs, run-state — plus the portable
contract that keeps all of it mechanically verifiable.

## The 5 entry points

| Section | What you find |
|---------|----------------|
| [**Core Concepts**](/concepts/) | The why: identity axioms · cognitive loop · user journeys · architecture reference · every ADR · drift mechanism |
| [**Install & Boot**](/setup/) | The how: agent-first install (`read aaep.site/skill.md and install archon`) · CLI · complete lifecycle (install · update · sync · uninstall) · state templates |
| [**Full Source**](/source/) | The what: every shipped file — soul · commands · agents · rules · skills · domain lenses · contracts · scripts · CLI |
| [**Testing**](/testing/) | The verification: governance contract tests · portable checkers · test strategy · how to run the gates in your own project |
| [**Changelog**](/changelog/) | The history: framework changelog · CLI changelog · ADR timeline |

## Who is this for?

- **AI coding adopters** who have outgrown "ask the agent to add a file" and
  need a durable engineering collaborator that owns the result.
- **Framework builders** who want a concrete example of a session-based
  governance system before inventing their own.
- **Engineering leads** evaluating what guardrails are required before
  letting autonomous agents land code.

## Start here

- **First time? Bootstrap your agent**: open your AI coding chat (Cursor /
  Claude Code / Codex / Continue / Aider / Windsurf — any platform with
  web-fetch + write tools) and say:
  **"read aaep.site/skill.md and install archon"**. The agent fetches the
  protocol, asks 3-4 questions, sha256-verifies every file, and writes the
  framework. Per-platform walkthroughs:
  [5-Minute Quickstart](/setup/quickstart#step-1-install).
- **After install**, the wake rule loads on every session — no URL needed.
  Just say *"hi archon, update yourself"* / *"is archon healthy?"* /
  *"uninstall archon"*. Details: [Install & Boot](/setup/).
- If you want to **understand the design** → [10-Minute Overview](/concepts/overview).
- If you prefer to **run a CLI** (optional, requires Node ≥ 18) →
  [5-Minute Quickstart Path B](/setup/quickstart#path-b-cli-scripted-no-conversation).
- If you want to **see every file** → [Full Source](/source/).

> **No Node required for the framework itself.** Archon's core is plain
> markdown + a Python contract checker (stdlib-only). Node ≥ 18 is needed
> only for the optional `cli` and `dashboard` modules.

</div>
