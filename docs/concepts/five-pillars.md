# The Five Pillars — Core Idea and Real Design

> The home page argues that a session-based agent does not need a *bigger model* — it needs an **engineering environment**, and it lists five concrete things that environment must supply. This page takes each of those five and shows two layers: the **core idea** (why it exists) and the **real design** (the actual file, contract clause, or script that enforces it — not the marketing sentence).
>
> **Audience**: readers who have skimmed the [10-Minute Overview](/concepts/overview) and want to see how each promise is mechanically backed before reading the full [Architecture Reference](/concepts/architecture). Every "real design" claim below points at a shipped file you can open in [Full Source](/source/).

Archon's diagnosis: the model supplies thrust, the environment supplies direction. The five pillars are the environment. Each one is designed so that *degrading into lip-service is mechanically detectable* — a rule that can only be obeyed "if the agent remembers" is treated as a reliability gap, not a rule.

| # | Pillar | Core idea in one line | Where it actually lives |
|---|--------|------------------------|--------------------------|
| 1 | **Cognitive loop** | Every delivery walks a fixed, machine-checked loop — not a free-form chat. | `run_state` status ledger in [governance-contract.yaml](/source/contracts/governance-contract) |
| 2 | **Mechanical gates** | If a machine can enforce it, don't write prose. Gates fail closed. | Constraint pyramid + [archon-check](/source/scripts/archon-check-py) / governance tests |
| 3 | **Persistent state** | Project truth survives between sessions — and can't silently go stale. | `manifest` · `drift` · `debt` · `memos` + event-sourced records |
| 4 | **Preservation axis** | Load-bearing rules are pinned so a later edit can't quietly drain them. | `critical_rule_substrings` registry in the contract |
| 5 | **Ownership contract** | The agent is the accountable engineering owner, not a suggestion box. | [soul.md](/source/soul) §Ownership / §Technical Sovereignty |

---

## 1. The Cognitive Loop — a walked loop, not a chat

**Core idea.** The model is strong enough; what it lacks is a *loop it must walk on every delivery*. Archon fixes the shape — `Perceive → Model → Act → Verify` — with backtracking to any earlier step when evidence invalidates the current conclusion. This is a loop, not a waterfall.

**Real design.**

- Three wake **modes** map to three command files: `/archon-plan` (negotiate *what* and *how big*), [`/archon-demand`](/source/commands/archon-demand) (execute one scoped delivery end-to-end), and `/archon-review` (independent full-review when drift pressure crosses the threshold).
- The delivery lifecycle is a hard sequence: `Wake → Decision Gate → Plan → Execute → Validate → Close-Out → Git`.
- The loop is **mechanically ledgered** so it cannot decay into a performance. The contract's `run_state.status_keys` enumerates ~22 status rows — `boot.soul_loaded`, `prescan.memos_scanned`, `decision.verdict_output`, `validate.validation_green`, `closeout.auditor_ran`, … — and [`archon-run-state.mjs resolve-for-commit`](/source/scripts/archon-run-state) gates the commit on them. A `smart_skip_allowed` allow-list names the *only* rows that may be skipped; skipping any other row is a violation.

> One line: the thinking process is turned into a checklist with machine verification — a loop that degrades into going-through-the-motions gets caught at commit time.

## 2. Mechanical Gates — fail closed, don't rely on prose

**Core idea.** Axiom #2, *Constraints > Documentation*. Documentation is the weakest constraint — effective only when read. So every load-bearing rule is pushed to the lowest level a machine can still enforce.

**Real design** — a five-to-six level constraint pyramid, strongest at the bottom:

| Level | Vehicle | Failure mode |
|-------|---------|--------------|
| L0 | Type system (strictest mode) | Won't compile = doesn't exist |
| L1 | Linter / static scan | Violation = won't commit |
| L2 | Tests / editor rules / pre-commit | Red = won't deliver |
| L3+ | Skills · ADRs · prose | Carries only the "why" |

The concrete gates all live in [`governance-contract.yaml`](/source/contracts/governance-contract), executed by [`archon-check.py`](/source/scripts/archon-check-py) / `archon-check.sh` / the governance test suite:

- **`file_budgets`** — every hot-path governance file has a hard line cap (soul ≤ 310, drift ≤ 80, memos ≤ 30 …). Over budget fails `validate` red, same severity as a type error — no "soft breach" grace. Context budget is treated as a *performance* constraint, not an aspiration.
- **`forbidden_substrings`** — obsolete semantics (e.g. "loaded on every boot") are blacklisted; reappearance fails.
- **Decision Gate probes** — before any code is written, three mechanical probes run: `radius_probe` (blast radius), `soul_headroom` (soul cap pressure), `modularity_probe` (is a second responsibility-axis being folded into one file). They don't block the Verdict; they force the structural fact onto the table so any owner override carries explicit rationale.
- **Lint-Rule Bridge** — every custom lint error message must end with `→ Read <spec-path>`. L2 rules are passive (only work if loaded); L1 lint errors are a channel the agent always reads. So an L1 violation actively pulls up the full L2 spec at the violation site.
- **Code Validation Gate** — the manifest declares one command covering lint + typecheck + test; it must run green before delivery. Red means fix it — "pass now, fix later" does not exist.

## 3. Persistent State — project truth between sessions

**Core idea.** Every session starts from a blank slate. Writing project truth into files lets the agent reload it on boot — but that creates a subtler hazard: *who guarantees those files haven't gone stale?* (That is exactly what Pillar 4's sibling, the [drift mechanism](/concepts/drift-mechanism), answers.)

**Real design** — four hot state files plus event-sourced record folders:

| File | Role |
|------|------|
| `manifest.md` | The *only* file allowed to hold project specifics: concept glossary, user-language alias index, current state, validation command, tech stack |
| `drift.md` | Memory-decay alarm — a counter with tiered thresholds |
| `memos.md` | Stakeholder conclusions: vetoes, decisions, clarifications. Scanned at every demand pre-scan |
| `debt.md` | Unresolved responsibility — the milestone gate reads it |

The load-bearing mechanism is **ADR-22 event sourcing** (`records_folder` in the contract):

- Each delivery / memo / debt item is one immutable file under `.archon/{kind}/records/<ISO-time>-<slug>.md`.
- The hot files (`drift.md` etc.) are a **regenerated projection** produced by [`archon-records.mjs`](/source/scripts/archon-records); hand-editing between sentinels fails validation.
- This makes the drift counter a **commutative sum** over records — two parallel branches can each write `+5` / `-3` and still converge after merge, with no manual renumbering and no merge conflict on a shared append-only file.
- Records past a threshold fold into quarterly cold archives via `archon-records-fold.mjs`.

> Design nuance: *snapshot* state ("what is true right now" — manifest current-state, convergence scope, latest review) deliberately stays **outside** records. Parallel edits there are real semantic conflicts that need human resolution, not a CRDT.

## 4. The Preservation Axis — load-bearing rules can't silently vanish (ADR-28)

**Core idea.** Evolution is a **two-motion** discipline, not a one-way correction loop. Most evolutionary cost is paid not when the wrong thing is added, but when the load-bearing thing is silently eroded by an edit aimed elsewhere. A correction-only framework drifts toward "whatever broke last," losing the rules that explain why nothing else broke — because those rules live only in agent memory, have no mechanical anchor, and no failure to observe means the trigger table never fires.

**Real design** — preservation is the *dual* of crystallization, and it is **mechanical, not narrative**:

- **Crystallization** asks "what did this delivery teach that should change Archon?" → promote into a stronger vehicle (test / rule / skill / ADR).
- **Preservation** asks "what did this delivery rely on that must not silently drain?" → pin the anchor with a **mechanical triple**: ① a critical-rule registry entry, ② a body-shape test, ③ a portable-contract clause.
- That registry is real: the `critical_rule_substrings` array in [`governance-contract.yaml`](/source/contracts/governance-contract) holds 40+ pinned substrings, each with a rationale naming the failure mode that reappears if the anchor is deleted. `archon-check` fails red if a pinned substring goes missing.
- **Close-Out forces the preservation answer**, one of: `preservation: pinned(<anchor>+<test>+<contract>)` or `preservation: none-this-cycle(<evidence>)` — where the evidence must name the scan target and verb. [`archon-claim-verifier.mjs`](/source/scripts/archon-claim-verifier) `--mode=preservation` checks it at L1.
- **Boundary**: a pin is a *tripwire, not a wall*. You can still remove a pinned rule — but the removal must be explicit (delete the anchor, the test, and the contract entry together), never a silent body-drain. That is precisely the line between *evolution* and *drift-toward-last-fix*.

## 5. The Ownership Contract — accountable owner, not suggestion box

**Core idea.** Axiom #1, *Ownership > Assistance*. The project is the agent's, not the user's. The user is the product stakeholder expressing intent; the agent is the sole engineering owner — architecture, technology choice, quality, and consequences are all its responsibility.

**Real design** — the [`soul.md`](/source/soul) §Ownership / §Autonomy Principles / §Technical Sovereignty sections, with mechanical companions:

- **Autonomy principles**: do not make the user think. Don't ask questions, don't present option menus, fix what breaks instead of reporting and awaiting instructions. The sole exception is *product-direction* ambiguity (intent confirmation) — *technical* ambiguity never qualifies.
- **Technical sovereignty**: user statements are product intent, not technical directives. "Use technology X" first gets assessed for soundness in *this* project; if unsound, the agent rejects with an alternative. Never ship known tech debt because "the user said so" — the mess is the owner's to clean. The only deference is to a stated hard constraint, not a preference.
- **Memory is ownership**: every stakeholder conclusion (approval / rejection / deferral / direction change) becomes a `memos` record, with the hot index loaded at every demand pre-scan. The user should never have to repeat themselves — repetition means lost context, which is an ownership failure.
- **Separation > Self-Review** (axiom #5, with teeth): the executor must not judge its own work. Code is written by the main agent, but review goes to an independent **reviewer** sub-agent and knowledge capture to an independent **capture-auditor** — because within one context window the author rationalizes its own output (sunk-cost bias). The rule even asks for a *different model family* for sub-agents (`model_family: different-from-main`), since same-family priors collapse "independent judgment" into "rephrased self-review." [Blink Dispatch](/source/skills/blink-dispatch) decides *when* a slice is risky enough to spend a sub-agent on.
- **Communication contract**: the user sees results only — product outcome on delivery, silence during work, and a single proactive channel (confirming ambiguous product intent).

---

## Where to go next

| You now want to… | Read |
|------------------|------|
| See the full structural reference | [Architecture Reference](/concepts/architecture) |
| Understand drift + review in depth | [Drift Mechanism](/concepts/drift-mechanism) |
| Feel the problem-fit through real pitfalls | [User Journeys](/concepts/user-journeys) |
| See every decision and its trade-offs | [Architecture Decisions (ADRs)](/concepts/decisions) |
| Read why a stronger model doesn't remove the need | [Model vs. Harness](/concepts/model-vs-harness) |
