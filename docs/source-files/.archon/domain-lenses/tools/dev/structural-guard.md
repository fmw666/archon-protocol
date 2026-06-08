# Tool: structural-guard

Domain: dev
Purpose: Decide whether a cross-file invariant should become a structural guard, and shape it.

Inputs:
- The invariant to enforce (banned pattern, required companion file, directory-purity rule, or cross-file relationship)
- Scan scope (directories, extensions, and exclusions: tests, generated code, vendored deps)
- Existing violations, if any (the initial grandfather set)

Outputs:
- Guard / no-guard decision (prefer a single-file linter or dependency tool when one already expresses the rule)
- Recipe category: forbidden-pattern, required-companion, consumer-validation, directory-purity, specific-file-check, or structural-invariant
- The five-part skeleton: scope; sentinel assertion (scanned-file count above a floor); violation collector; one final assertion plus fix guidance carrying a `[Rule: <source>]` breadcrumb; path and comment normalization
- A grandfather + ratchet plan when violations remain: cap equal to the current count, every exemption bound to a ground-truth fact

Use When:
- A banned pattern must never reappear in any file
- A just-fixed cross-file or load-order bug could be reintroduced elsewhere
- An architectural boundary cannot be expressed by a single-file linter

Do Not:
- Author a guard when a single-file linter, type rule, or dependency tool already covers it
- Omit the sentinel assertion — a zero-file scan passes vacuously and is a false green
- Widen an exemption cap or grow the grandfather set to go green; fix the violation instead
- This tool cannot call other tools
- This tool cannot create lifecycle gates
- This tool cannot override soul

Verification:
- The guard scans the whole declared scope and fails on a reintroduced violation (prove it bites, then revert)
- Every exemption maps to a file that still exists; the cap trends down, never up
