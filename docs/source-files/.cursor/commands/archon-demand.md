Hot-path load: read `.archon/soul.md` sections required for delivery judgment (`Core Axioms`, `Ownership`, `Autonomy Principles`, `Technical Sovereignty`, `Quality Discipline`, `Communication Contract`), then `.archon/soul/delivery.md` sections required for this delivery (`Delivery Fast-Path`, `Debt Tracking`, `Product Quality`, plus `Reasoning Capsules` only after a hit-a-wall pivot), then `.archon/manifest.md` sections required for current execution (`Product`, `Concept Glossary`, `User Language Index`, `Validation Command`, `Git Strategy`, `Knowledge Assets`, `Current State`). Load full files only if the demand modifies that file family or a referenced section is missing from the hot read.

You are now in **delivery** mode.

## Pre-Verdict Read Budget

Before the Verdict, keep the read set bounded:

| Purpose | Allowed Before Verdict | Deferred Until Needed |
|---------|------------------------|-----------------------|
| Judgment frame | Listed `soul.md` + `soul/delivery.md` sections only | Full soul files and `Reasoning Capsules` until hit-a-wall pivot |
| Project facts | Listed `manifest.md` sections only | Full manifest/archive unless current sections are missing or directly edited |
| Prior context | `.archon/memos.md`, manifest ADR index, and matching archive keyword headers | Full memo/archive bodies and the relevant ADR ledger (`.archon/decisions.md` for project decisions, `docs/archon/decisions.md` for framework decisions); read only matching ADR sections |
| Domain focus | Domain Lens Level 1 `registry.yaml` only | Level 2 lens routers and Level 3 tool cards until `Verdict=proceed` and non-fast-path |
| Delivery proof | Existing `ARCHON_RUN_ID` / legacy conflict checks only | New Run-State creation until Verdict exits |
| Lifecycle hooks | Manifest Extensions index, then extension directory names only if needed | Extension body reads unless a `demand.pre-scan` hook matches |

## Run-State Lazy Activation (ADR-14 / Run-State v2)

Do not create new Run-State before the Verdict. Pre-scan and Decision Gate stay in memory so rejected or tiny demands can answer quickly without writing `.archon/runs/<run_id>/state.json`.

1. **Resume before create**. If `ARCHON_RUN_ID` is already set or `.archon/runs/` contains an active run for this session, resume it. If multiple commit-ready runs exist, commit-time resolution MUST fail closed until `ARCHON_RUN_ID` is explicit.
2. **Legacy fallback**: if `.archon/run.md` already exists, run the demand-mismatch check (orphan defense). Read its YAML front matter `demand` field and compare to the current user request:
   - **Match** (same demand, normalized by lowercasing + trimming whitespace, first 60 chars) -> resume: assert `.archon/run.md` is a single active run-state block (exactly one YAML front matter block, one SOP table, and one `permit_commit` line). If a stale prior-delivery tail appears after the active `permit_commit` line, truncate it immediately.
   - **Mismatch** -> STOP. Do not touch the file. Produce this report and wait for the user to decide:
     ```
     Run-state conflict: .archon/run.md already describes a different delivery.

       existing.demand: "<quoted front-matter demand>"
       current request: "<quoted user demand>"
       started_at:      <front-matter started_at>
       permit_commit:   <0 or 1>

     Options:
       (a) abandon — I rm .archon/run.md and re-initialize for your current request
       (b) switch  — I treat the existing file as authoritative; the current request goes on hold
       (c) concurrent — another Archon session is still running in this working dir; I refuse to proceed

     Which?
     ```
3. **Activate after Verdict**. When the Verdict exits, activate Run-State only if the delivery will execute, needs rejected-delivery close-out evidence, or will be committed. Prefer v2: `node scripts/archon-run-state.mjs init --demand "<one-line demand>"`; record the emitted `run_id`, set `ARCHON_RUN_ID=<run_id>`, then immediately backfill completed boot, pre-scan, and decision rows with one `node scripts/archon-run-state.mjs set-many <run_id> ...` call.
4. Legacy creation is allowed only for adopter projects that have not shipped `scripts/archon-run-state.mjs`; otherwise do not create a new `.archon/run.md`.

After activation, every phase transition flips its row to `1`, `skip:<reason>`, or `2` for user-intent smart-skips per §Smart Skip. Use batched `set-many` by phase; leave incomplete rows at `0` and explain blockers in Close-Out.

## Smart Skip (ADR-15)

Three status tokens co-exist for "not `1`" rows: `skip:<reason>` (mode-driven, structural), `2` (**user-intent smart-skip**, human judgment), and `0` (blocking). The distinction matters for audit: `skip:*` is agent's mechanical call; `2` is the user's choice.

**When to write `2`**:

1. **Explicit user imperative** — user says `skip <step>` / `跳过 <step>` / `这次不用 <step>` / `don't bother with <step>` before or during the delivery.
2. **Affirmative response to agent proposal** — when a row's workload is clearly disproportionate to the delivery (e.g., auditor for a one-line typo fix), agent MAY ask once: `<step> looks low-value for this delivery — skip? (y/n)`. User `y` → `2`.
3. **Demand-level hint** — user opens the demand with `[trivial]`, `[quick patch]`, `[docs-only]`, or similar tag. Agent offers skip candidates up front (step 2 flow) rather than proceeding silently.

**When NOT to write `2`** — write `skip:<reason>` (or `1`) instead:

- Agent's own judgment without user signal → this is a mode-class skip, use `skip:no-change` / `skip:no-decision-value` / `skip:no-extensions` etc.
- Fast-path qualification → `skip:fast-path` (agent-decided, structural).
- Verdict=reject → `skip:rejected`.

**Permission list** — `2` may appear only on these six rows (template §Smart-Skip Permission List enumerates them):

- `prescan.archive_scanned`
- `closeout.auditor_ran` · `closeout.auditor_processed`
- `closeout.memos_appended`
- `closeout.milestone_gate`
- `closeout.extensions_hooked`

**Soul-enforced rows are NEVER user-skippable**: boot.* · prescan.memos_scanned · prescan.adrs_scanned · decision.* · execute.changes_applied (when files changed) · validate.validation_green (when files changed) · closeout.manifest_synced · closeout.drift_updated · closeout.statement_output. If the user asks to skip one of these, the agent MUST refuse with the soul rationale (e.g., "validation is hard-required by soul §Quality Discipline when code changed; I'll run it quickly").

**Audit requirement** — for every `2` row, the Close-Out statement OR the drift record body (`.archon/drift/records/<id>.md` per ADR-22) MUST include a line containing `smart-skip: <phase>.<variable>` (optionally plus reason). Block 8 cross-checks this; missing rationale fails the governance test. Recommended drift record `summary` form: `smart-skip: closeout.auditor_ran — user directive "this is a typo fix, no review value"`.

## Demand

{{input}}

## Pre-Scan

After receiving the demand and before entering the decision gate, scan `.archon/memos.md` (stakeholder memos) and the manifest's `Architecture Decisions` index for prior discussions or conclusions related to this demand. Project/product ADRs live in `.archon/decisions.md`; reusable framework ADRs live in `docs/archon/decisions.md`. Do not read full `.archon/decisions.md` or full `docs/archon/decisions.md` during pre-Verdict scan. If the manifest ADR index points to a matching ADR ID or keyword, read only that ADR section from the relevant ledger; load the full decisions file only when editing that ADR log or when section extraction fails. If found — proactively cite them at the top of your response (when discussed, what was concluded, whether new variables change that conclusion). The user must never repeat themselves.

**Archive recall**: If `.archon/memos-archive/` exists, read each archive file's keyword header/index (top of file only, not full body). If any keyword appears in the demand text, load that archive file in full and include it in the memo scan. Skip archive files whose keywords don't match.

**User language alias scan**: After the memo/ADR scan and before entering the Decision Gate, sweep the demand text against the manifest `User Language Index` (already hot-loaded). Three outcomes, handled deterministically:

1. **Hit** — the demand contains a phrase that appears in a ULI row. Silently resolve it to the canonical target and use that identifier in the Verdict rationale, execution plan, and file references. If the stakeholder is likely unaware of the canonical name, bridge once at the top of the response: `"We call this X in our project."` Do not ask the user to repeat or confirm the mapping.
2. **Near-miss** — the demand contains a recurring phrase that plausibly refers to an existing project artifact but is NOT in the ULI, OR describes the artifact indirectly ("the card that flips over", "那个带蓝色边框的列表"). Treat this as a ULI candidate: proceed using your best-effort mapping to the canonical artifact, AND record the candidate as `uli_candidate: <phrase> → <best-effort target>` so Close-Out step 1 can add it. Do not block the delivery on the mapping.
3. **Miss / N/A** — the demand contains no stakeholder-specific phrasing (generic technical wording only). Record `uli_scan: n/a`.

This scan is a mechanical reminder, not a reading gate: it is satisfied by a single sweep against the already-loaded hot section. The scan runs on every non-fast-path demand; fast-path deliveries inherit the check implicitly (the demand is typically technical, and any alias hit would disqualify fast-path by widening scope anyway).

**Signs sweep** (ADR-24 — required when `signs.md` exists): if the project has a `signs.md` (Trigger-indexed reasoning capsules), sweep its Trigger column against the demand text and the changed-paths candidate set computed during the radius probe. Allowed Trigger forms are `keyword: <quoted>` (substring on demand text), `path: <glob>` (intersects changed-paths), `error: <prefix>` (substring on demand text or last validation log), `phrase: <verbatim>` (full phrase substring). Cite each hit at the top of the response in the form `Sign hit: <trigger> → <instruction>  (signs.md row N)`. Multiple hits → list all in row order. No hits → emit no line. Missing `signs.md` → record `signs_scan: n/a` and continue. The sweep is mechanical and runs before the Verdict; it does not block, it surfaces.

After the memo/ADR scan, check the manifest's `Extensions` index for active extensions with a `demand.pre-scan` hook (see soul.md §Extension Points). If the manifest index is present and no extension lists `demand.pre-scan`, do not read any extension body. If the index is missing or ambiguous, fall back to the archon directory's `extensions/` subdirectory but inspect only extension IDs and hook headings first. For each `demand.pre-scan` match, read that extension's `extension.md` and execute the declared behavior.

**Run-state status after pre-scan**: when Run-State is activated or already resumed, set `prescan.memos_scanned` · `prescan.archive_scanned` (use `skip:no-archive` if `.archon/memos-archive/` is absent) · `prescan.adrs_scanned` · `prescan.extensions_hooked` (use `skip:no-extensions` when no `demand.pre-scan` hook is registered).

## Domain Lens Selection (ADR-19)

Before Fast-Path qualification, check whether the archon directory contains `domain-lenses/registry.yaml`.

If present, use progressive Domain Lens loading:

1. **Level 1 — registry index**: before the Verdict, read only `registry.yaml`. Use lens `signals` plus each tool's `tool_index` `description`, `when_to_use`, and `load_hint` fields to classify the demand into exactly one domain lens or `none`, and to form a minimal candidate tool set.
2. **Level 2 — lens router**: defer until `Verdict=proceed` and fast-path is not used. After selecting one lens, read only that lens file (`lenses/<lens-id>.md`) to apply its contract, `Default Output`, and selection recipes.
3. **Level 3 — selected tool cards**: defer until `Verdict=proceed` and fast-path is not used. Read only the selected `tools/<lens>/<tool>.md` cards. Do not load unselected tool cards.

Classify the demand into exactly one domain lens or `none`:

- **Single-domain demand** → output `domain_lens: <lens-id> · tools=[<tool-id>, ...]`
- **Multi-domain demand** → follow `conflict_policy: decompose-on-equal-match`, choose the planning/decomposition path, output `domain_lens: none · decomposition=[<child-demand>, ...]`, and do not mix lenses in one delivery
- **No relevant lens installed** → output `domain_lens: none · tools=[]`

Lens selection is a focus filter only. It cannot override soul, persona, Verdict, validation, Close-Out, or any lifecycle gate. Tool selection must stay within the registry budget: one delivery loads at most the declared `max_tools_per_delivery` tools, with the preferred count used when sufficient. Registry tool order is priority order; `tool_index` descriptions are discovery metadata only; choose the smallest explainable subset and emit full tool IDs (for example `design/component-pattern`). Atomic tools cannot call other tools, launch subagents, or create lifecycle gates.

The Domain Lens output is advisory context for the main agent's reasoning; Archon remains the decision owner.

**Capability selector protocol**: when the selected lens is `capability`, `Verdict=proceed`, fast-path is not used, and Level 1 domain-tool metadata plus manifest/platform skill metadata point to multiple plausible candidate assets, the main agent may launch a generic read-only subagent as a context-budget helper before reading full candidate assets. Use the selector prompt skeleton in `domain-lenses/README.md §Capability Toolsets And Skills`: pass the one-sentence demand, registered domain tool ids from Level 1 metadata (including each tool's `load_lines`), the active `max_total_load_lines` budget from registry defaults, plausible skill ids from manifest or platform skill metadata, and known manifest facts only. The subagent returns only a compact `capability_selection` packet (`demand_summary`, `selected_assets`, `load_order`, `total_load_lines`, `why_selected`, `rejected_assets`, `project_facts_needed`, `context_budget`, `handoff_note`). Accept the packet only when all required fields are present, `selected_assets` has at most 3 known skill or registered domain tool ids, `total_load_lines` is either a number ≤ `max_total_load_lines` matching the sum of `load_lines` for registered selected tools or `"n/a"` for skill-only selections, and the packet contains no Verdict, lifecycle status, implementation steps, provider API calls, secret handling, or launch another subagent requests; otherwise discard it and choose from Level 1 registry plus manifest/skill metadata directly. This selector is advisory and does not count as Blink Dispatch; the main agent still owns tool loading, execution, validation, and Close-Out.

**Hot-path rule**: before Verdict, do not read any `lenses/<lens-id>.md` or `tools/<lens>/<tool>.md` files. Rejected, alternative, and fast-path deliveries stop at Level 1 unless the rejection itself requires a Negative ADR using a Domain Lens concept.

## Fast-Path Qualification (Self-Assess Before Decision Gate)

Before the Verdict, evaluate fast-path eligibility against soul/delivery.md §Delivery Fast-Path (ALL criteria must hold).

**If eligible**, collapse ceremony: Verdict → one inline line (format below); skip Blink Dispatch and conditional subagent processing, plus memos/extensions; drift fixed at +1, mechanical floors bypassed; Close-Out → one inline line (format below). On Run-State activation, change `mode` to `fast-path` and fill every non-fast-path row with `skip:fast-path` (see template §Mode-Specific Forms).

**If NOT eligible**, proceed through the full flow below.

**Run-state status**: when Run-State is activated or already resumed, set `decision.fastpath_assessed` = `1`.

## Decision Gate

Assess before acting. This is not optional:

- **Should it be done**: Does this change solve a real problem or a hypothetical one? Is there a no-code or less-code solution?
- **How big**: Blast radius (how many files, modules, interfaces affected) + reversibility (rollback cost if wrong) — the larger the change, the stricter the verification
- **Who decides**: Engineering decisions are yours. Product direction questions go to the user.

**Radius probe (mechanical)** (ADR-23 — required input to the Verdict): Before forming the Verdict's Radius/Reversibility self-assessment, derive a mechanical probe from changed-path candidates × the manifest's declared module boundary map. Output one line in the form `radius_probe: files=<N>|modules=<N>|crosses=[<module,...>]` immediately above the Verdict block. When the manifest declares no module boundary map, degrade to `radius_probe: files=<N>|modules=?|crosses=[]` using changed-file count alone — never silently skip the line. The probe is decision input, not the decision itself; agent retains owner authority to override. If the agent's final Verdict `Radius=` differs from the probe by ≥1 module or ≥30% files, it MUST add a sibling line `radius delta: self=<N>f/<M>m vs probe=<X>f/<Y>m — <one-sentence reason>` (mirrors the differ-must-explain pattern of the numeric-claim cross-check in §Close-Out). This promotes Radius from L3 self-assessment to L2 mechanical-input + auditable delta.

**Soul-headroom probe (mechanical)** (ADR-23 extension — required when changed-paths intersect `soul.md` / `soul/*.md`): when the radius probe shows any soul-class file in the changed set, also output `soul_headroom: <current>/<cap> = <pct>% (<remaining> lines)` immediately under `radius_probe:`. When `<pct> ≥ 95%`, the Decision Gate MUST either (a) restructure the demand to land a compress pass FIRST as a separate prior commit (cap-driven Two-hats compliant), or (b) widen the cap with an explicit ADR justifying why compression is exhausted. Skipping the probe when soul is in the radius is a soul-enforced violation. The probe surfaces structural pressure before the soul edit lands so cap-driven failures are caught at Verdict time, not at validate time. Mirrors radius probe's "machinery checks the boundary, owner decides" contract.

**Modularity probe (mechanical)** (ADR-29 — required when changed-paths candidate set creates a new file OR matches a manifest §Source Modularity Map glob): output `modularity_probe: target=<path>|axes=<axis-cell,...>|status=<aligned|fan-out-needed|undeclared>` immediately under `radius_probe:` (or under `soul_headroom:` when both are present). The probe asks: does this delivery fold a second concept-axis into a file already responsible for one, when the project has declared upfront that those axes belong in separate files? Three states: `aligned` = the changed content stays inside one axis-cell of the matching map row (healthy); `fan-out-needed` = the change introduces a second axis-cell into the same file (pre-emptive split is the right move, not "split when it feels long"); `undeclared` = the path matches no map row, probe degrades to advisory and emits the line so the owner can decide whether to extend the map. When `status=fan-out-needed`, the Decision Gate MUST either (a) land a prior commit that fans the file out to per-axis-cell files (Two-hats compliant — refactor commit before content commit), or (b) update §Source Modularity Map in the same delivery to declare the file legitimately spans these axes with a one-line rationale, recomputing the probe to `aligned`, or (c) emit `Override (if any): class=modularity-fanout · rationale=<≥60 chars>` to consciously bypass the probe (project policy decides whether bypass is acceptable; cumulative `class=modularity-fanout` frequency surfaces at plan/review per ADR-10 Override Observability). When the manifest declares no §Source Modularity Map (or the map is empty), the probe degrades to `status=undeclared` for every path and never blocks. The probe surfaces foresight pressure at the Verdict so split decisions are made before the file accumulates concept-axis debt — not after a stakeholder asks "isn't this file getting hard to manage?". Mirrors radius probe's "machinery checks the boundary, owner decides" contract; concurrent-PR merge-conflict reduction is a downstream effect of axis-aligned files, not the probe's job.

When the assessment is "don't do it" or "not like this" — reject the demand with rationale and alternative. This is your responsibility, not an offense.

**Post-rejection crystallization**: If the rejected proposal involves technology selection or architectural direction, and the same question may arise again (criterion: the question stems from reasonable intuition, not a mistake), record the rejection as a Negative ADR (architecture decision record rejection entry — with rejection rationale, alternative path, and conditions for re-evaluation). Rejections use Reject-Only Close-Out: skip validation and delivery ceremony, but still preserve the decision record.

**Reject-path borrowed-concepts check** (DEBT-052): When rejecting or choosing an alternative to an external framework, agent system, tool, architecture, or technology proposal, the Verdict MUST include `Borrowed concepts (if any): [...]`. Use `[]` only after explicitly checking whether a smaller mechanism is worth translating into Archon's ownership model. This prevents cognitive closure where "not adopting the proposal" accidentally discards reusable validation, role-classification, or guardrail ideas. If the proposal is an external agent pattern, consult `external-agent-patterns` first.

**Reject path is not a menu** (DEBT-054): A rejection must be a decision, not an A/B/C choice form. Do not present 3-option override menus (for example: "A reject / B ask reviewer / C override") as the default rejection path, and do not use `AskQuestion` to make the user choose whether governance applies. If override remains possible, state the exact condition or required rationale as prose, then continue the close-out path.

**Verdict** (Decision Gate Exit) — after assessment, you must output this structured ruling. Not skippable:

```
**Verdict**: proceed|reject|alternative · Radius=N files/N modules · Reversibility=high|medium|low · Rationale=one sentence
Borrowed concepts (if any): [...]  # required for external-framework/tool/architecture/technology reject|alternative verdicts
Override (if any): class=<governance-bypass|two-hats-bundle|convergence|review-tier|modularity-fanout|other> · rationale=<≥60 chars verbatim quoting user override phrase OR explaining engineering necessity>  # required when the demand bypasses any normally-mandatory gate (two-hats, convergence, review tier, validation, modularity-fanout-needed, etc.)
```

**Override observability** (project-defined policy lives in the project ADR ledger; framework requires the Verdict line + drift surface): every override of a normally-mandatory gate MUST emit the `Override` line above. The `class` value classifies which gate is bypassed (one of the enumerated values, or a new value with project-ADR justification). The `rationale` MUST be ≥60 chars and SHOULD verbatim-quote the stakeholder override phrase when the override is stakeholder-driven. The override is recorded in the drift record's frontmatter `summary` so cumulative override frequency surfaces at plan/review time without a hard ceiling. Class enumeration deliberately does NOT cap the number of overrides — observability over enforcement; the cumulative-frequency surface is the feedback mechanism. (Project policy may add a ceiling separately; framework keeps the channel open by default.)

Fast-path inline form (use ONLY when fast-path qualified):

```
**Verdict (fast-path)**: trivial · radius=<N>f · reversibility=high · <one-sentence rationale>
```

Only when the Verdict is "proceed" continue to execution and validation gate. "reject"/"alternative" go directly to Reject-Only Close-Out (skip validation and delivery ceremony).

**Reversibility verb mapping** (ADR-23 — required dispatch from Verdict to downstream gates): the Verdict's `Reversibility` value is not just a descriptor; it dispatches mandatory verbs at later gates. Auditors and reviewers verify the dispatch was honored.

| Reversibility | Mandatory Verbs |
|---------------|-----------------|
| `low` | MUST add a characterization test (or other behavior-locking guard) BEFORE applying the change · MUST run the manifest validation command to green · MUST dispatch an independent auditor (Blink Dispatch `skip:*` is prohibited; treat any low-reversibility delivery as high-risk slice) |
| `medium` | MUST run validation to green · auditor recommended (Blink Dispatch `skip:*` allowed only with explicit one-line reason citing slice low risk) |
| `high` | MUST run validation per the project's fast-path or full rules · auditor optional |

If the Verdict declares `low` Reversibility, every Close-Out row that conflicts with the table above (e.g., `closeout.auditor_ran=skip:*` for a low-reversibility delivery) is a soul-enforced violation — not a smart-skip candidate — and the run-state commit gate stays closed until corrected.

**Plan-mode binding** (platform-enforced capability gate): The Verdict statement MUST be produced BEFORE any write-side tool invocation (Edit / Write / StrReplace / Shell with side effects / Delete). Cursor's native **Plan mode** (read-only + write tools denied by the platform) is the platform realization of this rule — whenever feasible, invoke `/archon-demand` from Plan mode so the gate is machine-enforced rather than self-disciplined. After Verdict=proceed, switch to Agent mode to execute. This promotes the "decide before acting" rule from L3 prose convention to L2 platform capability — tool calls attempted before the Verdict is output are denied by Cursor, not by main-agent discipline.

**Convergence gate** (ADR-12, milestone-scoped demand filter): When `manifest §Current State` declares a non-empty `Convergence scope`, the Verdict MUST first classify whether the demand advances one of the listed debt IDs (in-scope) or not (out-of-scope). Out-of-scope demands receive `Verdict=reject` with rationale `"out of convergence scope — declared scope=[<IDs>]; demand advances=<none|other-ID>"`, unless one of the declared exemptions applies (emergency-review remediation · L0/L1 gate regression fixes · tooling fixes unblocking the declared scope) OR the user explicitly overrides in the demand text (the override phrase — e.g., "override convergence", "framework priority" — MUST be quoted verbatim in the Verdict rationale and logged in `drift.md` as an override record, one drift unit minimum). This promotes forced-convergence from L3 manifest prose to an L2 mechanical filter at the Verdict step — see `governance.test.ts §Convergence gate` for the anchor check.

**Run-state activation/status after Decision Gate**: activate Run-State now if needed, then set `boot.*`, pre-scan rows, `decision.fastpath_assessed`, `decision.convergence_classified` (or `skip:no-scope` when manifest declares no Convergence scope), `decision.plan_mode_declared` (use `skip:fallback` when session entered in Agent mode per ADR-11 fallback clause), and `decision.verdict_output` in one batched update. Also update state metadata: `mode` = `rejected` if `Verdict=reject`, `convergence` = `in-scope` / `out-of-scope-override` / `n/a`.

## Self-Directed Execution Interior

After `Verdict=proceed`, use **Boundary-hard, process-soft** execution: the agent owns the execution plan, tool order, helper creation, and backtracking loop. Domain Lens tools focus the work; they are not scripts. The command does not prescribe an internal step sequence between Verdict and Validation Gate.

The hard boundaries still apply: do not write before Verdict, do not skip manifest-declared validation when files changed, do not bypass Run-State/commit proof, do not self-review where Blink Dispatch requires an independent subagent, and do not promote one-off observations past the evolution filter. Within those boundaries, prefer direct project evidence, small helper code, focused tests, and self-repair over adding orchestration layers.

## Validation Gate

After delivering code, execute the validation command declared in the manifest.

- All green → proceed to close-out
- Red → fix until green, then close-out
- Skipping validation = delivery not completed

**Run-state updates after execution + validation**: `execute.changes_applied` · `validate.validation_green`. For `Verdict=reject` deliveries, both rows become `skip:rejected` (no code changes, no validation run).

## Close-Out

After delivery:

**Reject-Only Close-Out** (`Verdict=reject|alternative`): do not run validation, Blink Dispatch, auditor/reviewer subagents, execution hygiene processing, milestone gate, or broad manifest sync. Preserve only the decision-bearing artifacts: Negative ADR when §Post-rejection crystallization applies, stakeholder memo when the conclusion has future decision value, trigger-gated `demand.close-out` extension capture, drift log, Close-Out statement, and git only when those knowledge artifacts changed and the manifest git strategy requires it. Run-state rows become: `execute.changes_applied=skip:rejected`, `validate.validation_green=skip:rejected`, `closeout.subagent_dispatched=skip:rejected`, `closeout.auditor_ran=skip:rejected`, `closeout.auditor_processed=skip:rejected`, `closeout.milestone_gate=skip:rejected`, while `closeout.memos_appended`, `closeout.extensions_hooked`, and `closeout.drift_updated` still record their actual outcomes.

1. Check whether this delivery changed the tech stack, directory structure, architecture decisions, user-language aliases, or project state. If so, update the corresponding manifest.md sections. Keep `manifest.md` hot for current state and latest validation; if Latest review detail grows beyond a compact summary, move the full detail to `.archon/manifest/archive/<current-quarter>.md` and leave an archive pointer in the hot row. Also check: did this delivery introduce or surface product-specific terms that could be misinterpreted? If so, add or update entries in the manifest's Concept Glossary (term + project meaning + ≠ common meaning). Did the stakeholder use a recurring phrase, nickname, or indirect description for a project artifact? If so, add or update the manifest's User Language Index. If Pre-Scan recorded a `uli_candidate: <phrase> → <target>`, resolve it here: confirm the mapping against the delivered changes and promote it into the User Language Index (or discard with reason if the candidate was a one-off misread).

   **Acceptance criteria delta check**: For every non-fast-path delivery, explicitly decide whether the delivery changes what "done" means for the active milestone or project validation. This check is required when the delivery introduces a new technology, new architecture layer, new module, new pattern, or optimization that changes validation needs. If yes, update manifest.md §Milestones & Acceptance Criteria, §Validation Command, or the relevant guardrail asset in the same delivery; if no, record `Acceptance criteria delta: no-change` in Close-Out or drift. Acceptance criteria are dynamic contracts, but a changed contract must land as a manifest/test/rule/validation update rather than prose-only intent.

   **Numeric-claim cross-check** (DEBT-058 countermeasure, rule-of-three 3/3 2026-04-23; F2 broadening adds build-time backstop for manifest claims via `governance.test.ts` §Manifest numeric ground-truth): For every new or substantially rewritten governance / skill / ADR document produced in this delivery, grep each numeric claim of the form `\d+\s*(个|tests?|files?|routes?|handlers?|imports?|lines?|测试文件|条|sections?|items?)` against the asserted source (the grep command itself must be run; no eyeballing). Each mismatch MUST either be fixed pre-auditor OR logged in the drift entry as `numeric-claim drift: <file>:<claim> vs <verified>=<delta>`. The cross-check applies even when the number was provided in the user's demand text — user-input numbers are inputs, not facts (DEBT-026 "16 handlers" samples this failure mode). `manifest.md` numeric claims for `N migrations` / `N RLS` / `N files / M tests` now have a CI-enforced live-repo count check (failure points to the stale line), which closes F2 for manifest — but the clause still applies to skill docs, ADRs, and prose claims outside that narrow anchor set. See `.archon/debt.md` DEBT-058 for the three-sample basis.

   **Governance-docs mirror check** (DEBT-063 countermeasure, rule-of-three 3/3 2026-04-30 Full review): Whenever this delivery's changed-files list includes any path matching `.archon/soul*` · `.archon/contracts/` · `.archon/domain-lenses/` · `.cursor/commands/archon-*` · `.cursor/agents/archon-*` · `.cursor/rules/archon-*` · `.cursor/skills/archon-*` · `scripts/archon-*` · `scripts/export-archon-*` · `.husky/pre-*` · `.cursor/hooks*`, at least one `docs/archon/` file MUST also appear in the changed-files list — OR the Close-Out output MUST record `docs_sync: skip:<bounded-reason>` with one of these allowed reasons: `skip:no-narrative-change` (mechanical-only edit, prose unchanged) · `skip:already-mirrored` (docs were synced in a prior commit on this branch and verified by grep) · `skip:fast-path` · `skip:rejected`. Manifest/state file changes (`.archon/manifest.md` / `drift.md` / `memos.md` / `debt.md` / records folders) do NOT trigger this check — they are state, not framework. The pre-commit hook + governance test (`web/src/test/archon/governance-docs-mirror.test.ts`) enforce the rule mechanically; missing mirror without skip reason fails commit. See `.archon/debt.md` DEBT-063 for the three-sample basis.
2. [skipped on fast-path] **Blink Dispatch Gate**: before launching any subagent, load `blink-dispatch` skill and thin-slice the delivery using changed paths, boundary risk, validation repair, state closure, drift pressure, and agent uncertainty. Output exactly one line: `subagent_dispatch: skip:<reason> | use:<subagent>:<reason>`. High-risk slices MUST NOT skip: manifest-declared product/source paths, Archon core (`.archon/soul*`, `.archon/domain-lenses`, `.archon/contracts`, `.archon/templates`, `docs/archon`, `scripts`, `.husky/pre-commit`, `.cursor/commands`, `.cursor/agents`, `.cursor/rules`, `.cursor/skills`, governance tests), auth/secret/deploy/DB/CI permission boundary, debt/milestone closure, validation repair, full-review threshold, or uncertainty. Low-risk slices MAY skip: copy-only docs, drift-budget maintenance, validation-only CI trigger/cache/concurrency changes without secret/deploy expansion, or verified manifest sync.
3. [conditional] Launch the subagent chosen by Blink Dispatch. For `use:archon-capture-auditor:*`, pass the delivery summary, changed file list, and Close-Out output; await its structured assessment (knowledge capture + blindspot reflection + delivery hygiene + lifecycle compliance). For `use:archon-reviewer:*`, route to the review workflow. For `skip:*`, do not launch a subagent, but record the skip reason in `run.md` and drift.
4. [conditional] Process subagent output:
   - **Knowledge crystallization**: If recommendations exist → create/update assets at the recommended level and vehicle, sync the manifest knowledge asset index. If none → skip.
   - **Hygiene response**: If auditor flags ✗ items → fix what can be fixed immediately (return to validation gate to confirm green), register unfixable items as new files under `.archon/debt/items/DEBT-<NNN>-<slug>.md` via `node scripts/archon-records.mjs new debt --id DEBT-NNN --severity ... --status pending --deadline ... --source "..." --summary "..." --details ".archon/debt/archive/<period>.md"` and put full rationale in `.archon/debt/archive/<current-quarter>.md`. Do NOT hand-edit `.archon/debt.md` between sentinels — the active index is auto-generated. All ✓ → skip.
5. **Delivery log + post-delivery review** (per ADR-22 records-folder): For every completed demand, **create one new record file** under `.archon/drift/records/<ISO8601>-<slug>.md` via `node scripts/archon-records.mjs new drift --type delivery --delta +N --summary "..." --crystallized "..."` (or `--type review-release --delta -N` for review releases). Do NOT hand-edit `.archon/drift.md` between sentinels — the hot summary is auto-generated. Pre-commit hook regen + restages it. The record body must include a short post-delivery review: (a) what, if anything, could be improved in the delivered code/docs/tests; (b) whether the delivery process itself had avoidable friction, repetition, missed checks, or unnecessary ceremony; (c) whether the finding should stay as a one-off note or be promoted to debt/rule/test/skill/ADR; (d) **Preservation pass** (per soul.md §Preservation Axis): name what worked in this delivery and is now worth pinning — a rule / gate / output token / convergent shape that prevented an incident, stabilized across this and prior deliveries, or expresses a load-bearing decision the stakeholder already relies on. Either pin it now (critical-rule anchor + body-shape test + portable contract entry) OR record `preservation: none-this-cycle` with one-line evidence the scan ran (e.g., "scanned latest 3 drift records and resolved-debt items, nothing newly stable enough to pin"). "I was extra careful" is not preservation; an anchor is. Promotion requires a real signal: repeated failure, auditor/reviewer finding, unstable manual step, or a constraint that can be mechanically enforced. Do not add process machinery for a one-off inconvenience.

   **Evolution signal triage**: Every post-delivery review MUST label the learning signal as `evolution_triage=stats-pass`, `evolution_triage=first-principles-pass`, or `evolution_triage=stay-in-drift`. Use `stats-pass` only when there are at least 2-3 related samples and the signal is repeated, reproducible, costly, cross-context, and mechanically enforceable; there is no one-sample exception. Use `first-principles-pass` only for a one-off signal that falsifies a core assumption or exposes a constraint-pyramid gap, and name the smallest validation experiment. Use `stay-in-drift` for preferences, hunches, local inconvenience, or weakly evidenced process noise. The label MUST be paired with matching compact evidence: `stats-pass` uses `evolution_evidence=stats(samples=<n>, source=<drift|auditor|validation>, action=<test|rule|skill|debt>)`, `first-principles-pass` uses `evolution_evidence=first-principles(assumption=<broken assumption>, experiment=<smallest validation>)`, and `stay-in-drift` uses `evolution_evidence=drift(reason=<why not promoted yet>)`.

   **Architecture forecast**: Every non-fast-path delivery log MUST include `architecture_forecast=risk:<one likely next architecture pressure>|next:<smallest useful optimization or "none">|confidence:<low|medium|high>`. This is not a backlog, roadmap, or permission to skip the next Verdict; it is a prediction to inspect during the next demand's pre-scan.

   **Drift scoring applies mechanical floors**: self-assessed score is `max(self_assessment, mechanical_floor)` using these floors:
   - ≥3 files changed → floor = small (+2)
   - ≥6 files changed → floor = medium (+3)
   - ≥10 files changed OR any new module/pattern/dependency → floor = large (+5)

   When the floor raises the score by ≥2 above the self-assessment, append a note to the log entry: `drift adjusted: self=<N>, floor=<M>, applied=<M>`. Fast-path deliveries score +1 fixed and bypass the floor but their count is tracked (see Close-Out).

   If the hot drift file exceeds its declared line cap, **do NOT manually move rows** — `archon-records.mjs regen drift` already keeps only the most-recent N rows (currently 12) in the hot summary. To compress the records folder itself (when it grows past ~40 entries per kind, or per quarter rollover), run the eventual `archon-records.mjs fold drift` companion (currently planned per ADR-22 architecture forecast; manual quarterly fold to `.archon/drift/archive/<year>-Q<N>.md` + `git rm` the folded record files until the tooling lands).

   If drift crosses the light threshold, proceed to light review before next demand; if it crosses the full or emergency threshold, immediately execute the matching review tier (see archon-review.md) without waiting for user instruction.
6. **Milestone gate**: If this delivery completes a milestone's last feature acceptance item, before checking it off in the manifest, verify `debt.md` hot rows — all items with `milestone-close` deadline must be `resolved`. Not cleared = milestone not complete. Clear debt first, then check off.
7. [skipped on fast-path] **Stakeholder memos** (per ADR-22 records-folder): Did this interaction produce conclusions the user shouldn't be asked to repeat? Including: rejected proposals, deferred features, confirmed directions, changed priorities. If so — **create one new record file** under `.archon/memos/records/<ISO8601>-<slug>.md` via `node scripts/archon-records.mjs new memos --topic "..." --conclusion "..." --source ".archon/memos-archive/<period>.md ? keyword: <keyword>"` and append the full rationale to `.archon/memos-archive/<current-quarter>.md` with `Archived On` (NOT delete). Do NOT hand-edit `.archon/memos.md` between sentinels — the hot index is auto-generated as the most-recent 5 by date. Record only conclusions with decision value, not routine deliveries (that's drift's job). Create the archive file with a keyword header if it doesn't exist; update the keyword header when adding entries. See soul.md §Memory Vehicles & Cold Archive.
8. [skipped on fast-path] **Extensions**: Check the manifest's `Extensions` index for active extensions with a `demand.close-out` hook and close-out trigger hint (see soul.md §Extension Points). If no hook is listed, set `skip:no-extensions`. If hooks are listed but the delivery context does not match any trigger hint, do not read extension bodies; set `skip:no-extension-trigger` and append `Extensions: none` to the Close-Out statement. If a trigger hint matches or the manifest index is missing/ambiguous, inspect only extension IDs and hook headings first, then read only matching `extension.md` bodies and execute their declared behavior. Append extension outputs to the Close-Out statement.
9. Check whether the manifest declares a git strategy. If so: run `git status`, execute version control per the declared mode and branch model (commit / prompt / skip). Use the project's declared commit convention (if a corresponding skill exists). Prefer the `archon-git-commit` skill when v2 or legacy run-state is present — it reads run-state and enforces the same gate the pre-commit hook checks. A single commit includes all delivery changes (code + manifest + knowledge assets + drift + debt); run-state remains gitignored and is cleaned after success. If the manifest declares no git strategy, skip.

**Run-state updates during Close-Out** (per step completion):
- Step 1 → `closeout.manifest_synced` (use `skip:no-change` if the delivery touched nothing the manifest tracks)
- Step 2 → `closeout.subagent_dispatched` (`1` when Blink Dispatch chooses `use:*`; `skip:<reason>` when it chooses `skip:*`)
- Step 3 → `closeout.auditor_ran` (use `1` for capture-auditor, `skip:<reason>` when Blink Dispatch chooses another subagent or skip)
- Step 4 → `closeout.auditor_processed` (same completion/skip reason as Step 3)
- Step 5 → `closeout.drift_updated`
- Step 6 → `closeout.milestone_gate` (use `skip:no-milestone` when this delivery doesn't close a milestone's last item)
- Step 7 → `closeout.memos_appended` (use `skip:fast-path` or `skip:no-decision-value` when the delivery produces no stakeholder-level conclusion)
- Step 8 → `closeout.extensions_hooked` (use `skip:fast-path`, `skip:no-extensions`, or `skip:no-extension-trigger`)
- Close-Out statement output → `closeout.statement_output`

**Final run-state commit gate**: after the Close-Out statement is produced AND every row above is `1`, `2`, or `skip:*`, v2 `permitCommit` becomes `true` automatically when the last pending row is set. Legacy fallback sets the bottom line to `permit_commit: 1`. This is the ONLY place the commit permit becomes true. The pre-commit hook rejects any active delivery where the permit is not set. After the commit succeeds, the `archon-git-commit` skill removes the active `.archon/runs/<run_id>/` directory or legacy `.archon/run.md`.

**Close-Out** (compliance checklist) — after all close-out steps, you must output this self-check. Not skippable:

```
**Close-Out**:
- [ ] Manifest sync: yes|no(no changes)
- [ ] Acceptance criteria delta: updated(<manifest|test|rule|validation>)|no-change
- [ ] Numeric-claim cross-check: yes(N claims verified)|N/A(no governance/skill doc produced)
- [ ] Governance-docs mirror: yes(docs/archon/<files>)|skip:no-narrative-change|skip:already-mirrored|skip:fast-path|skip:rejected|N/A(no governance-surface change)
- [ ] Subagent dispatch: use:<subagent>:<reason>|skip:<reason>
- [ ] Auditor launched: yes|skipped(<reason>)
- [ ] Auditor recommendations processed: yes|N/A|skipped(<reason>)
- [ ] Drift updated: +N (total=M) · adjusted: self=<s>→applied=<a>|N/A
- [ ] Post-delivery review: improvement=none|noted(summary) · process=stable|improve(summary) · promoted=none|debt|rule|test|skill|ADR · evolution_triage=stats-pass|first-principles-pass|stay-in-drift · evolution_evidence=stats(samples=<n>, source=<drift|auditor|validation>, action=<test|rule|skill|debt>)|first-principles(assumption=<broken assumption>, experiment=<smallest validation>)|drift(reason=<why not promoted yet>)
- [ ] Preservation pass: pinned(<anchor>+<test>+<contract>)|none-this-cycle(<one-line evidence scan ran>)
- [ ] Architecture forecast: risk=<summary>|none · next=<smallest useful optimization|none> · confidence=low|medium|high
- [ ] Milestone gate: N/A|passed|blocked(reason)
- [ ] Stakeholder memos: none|indexed(topic)|skipped(fast-path) · archived: N/A|full-rationale(<archive>)
- [ ] Extensions: {extension-id}:{output}|none|skipped(fast-path)
- [ ] Git: committed|prompted|skipped(reason)
```

Fast-path inline form (use ONLY when fast-path qualified):

```
**Close-Out (fast-path)**: manifest-sync=N · drift=+1(total=M) · git=<status>
```

Reject-only inline form (use ONLY when `Verdict=reject|alternative`):

```
**Close-Out (reject-only)**: decision-record=NegativeADR|memo|none · demand-pool=captured(DP-N)|none|skipped(no-trigger) · drift=+N(total=M) · git=<status>
```

**Final Imperative** (ADR-25 / G5 — required tail block on every non-fast-path delivery, required after Close-Out, before any TL;DR): the full Close-Out checklist is dense; this 3-line tail catches the failure mode where ≥10 rows are skimmed. Each line is a yes/explicit-delta answer to one collapse-prevention question. Refusing to write any of the three lines is itself a violation — it is not a smart-skip candidate.

```
**Final Imperative**:
1. Verdict emitted AND final Radius differs from probe by ≤ 1 module / ≤ 30% files? (yes|delta-explained:<one-line reason>)
2. If files changed ≥ 1 → manifest validation green AND every close-out row is 1 / 2 / skip:*? (yes|n/a-no-files)
3. Any stats-pass signal that MUST be handled in the next demand? (yes:<one phrase>|none)
```

The Close-Out statement is the structured summary of the closeout phase — enforcing item-by-item confirmation to prevent omissions and providing auditable structured output for the auditor. Fast-path collapses ceremony without collapsing accountability: drift and git are always recorded.

> **Naming note** (2026-04-19): these structured outputs were previously labeled `GATE-1` / `GATE-2`. Renamed to **Verdict** / **Close-Out** for tone alignment with Archon's notarial vocabulary (soul · manifest · memos · drift · sovereignty). Historical drift log / memo / ADR entries retain the old labels. See resolved DEBT-035.
