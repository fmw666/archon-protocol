# User Journeys: Problems You've Already Hit

> Every journey below is something that actually happens when AI writes your code.
> If you've worked with AI for more than a week, you've lived at least three of these.

---

## Journey 1: The File That Never Stops Growing

**You**: "Add user settings to the dashboard."

AI adds 80 lines. The file is now 280 lines. Fine.

**You**: "Now add notification preferences."

AI adds 120 lines to the same file. 400 lines. Still manageable.

**You**: "Add data export options."

AI adds another 150 lines. 550 lines. Then activity logs. Then API key management. **The file is now 900 lines.** No human developer would let a file grow this large — they'd instinctively refactor at ~300 lines. But AI has no instinct. It has no memory of what "too big" means. It optimizes for "complete the current request," not "maintain the codebase."

### What Archon Does

The [Reviewer daemon](/daemons/self-auditor) actively detects file bloat during its structural audit (Dimension 2). When a file crosses the threshold:

1. **Flags the bloat** — "this file has 5 responsibilities; split by concern"
2. **Proposes concrete splits** — `UserSettings.tsx`, `NotificationPrefs.tsx`, `DataExport.tsx`
3. **Enforces going forward** — the [Code Quality driver](/drivers/code-quality) contains `❌ File exceeds 300 lines — split by responsibility boundary`

The file doesn't silently balloon. The system catches it and acts.

---

## Journey 2: Same Concept, Five Implementations

Week 1: AI writes data fetching with `useState` + `useEffect`.
Week 2: AI uses `useSWR` — it "learned" a better pattern.
Week 3: AI picks `RTK Query` — the project already had Redux.
Week 4: Back to raw `fetch` in a utility function.
Week 5: A custom hook that wraps `axios`.

All five work. None are wrong individually. **But at 60,000 lines, you have five data-fetching paradigms, and every new developer (human or AI) has to guess which one is "the right one."**

### What Archon Does

Archon's [constraint system](/drivers/) locks in patterns once they're established. The first time a data-fetching approach is chosen and proven, it becomes a constraint:

```
❌ Using raw fetch/axios for API calls — use the established useSWR hook pattern
```

Every subsequent session, this constraint is **injected into the AI's context window at generation time** — not as advice to read later, but as an active rule shaping code output. The AI literally cannot drift to a different pattern because the prohibition is part of its instruction set.

[Drift detection](/architecture/drift) also monitors for pattern inconsistency across sessions, triggering a review when the codebase diverges from its declared patterns.

---

## Journey 3: The Cross-Session Amnesia

Monday afternoon: You and AI spend 2 hours refactoring the authentication module. You extract a shared `useAuth` hook, consolidate token refresh logic, remove three redundant auth checks.

Tuesday morning: New chat session. You say "add role-based access to the settings page." AI writes a brand new auth check inline — the exact pattern you spent yesterday eliminating. **It has zero memory of yesterday's refactoring.**

### What Archon Does

The [Manifest](/kernel/) captures project-wide decisions persistently. After Monday's refactoring, the manifest records:

- Auth is centralized in `useAuth` hook
- Token refresh handled in `authProvider`
- No inline auth checks allowed

Tuesday's session loads the manifest into context. The AI sees the established pattern and follows it — not because it remembers yesterday, but because the constraint system carries the memory forward.

[Drift detection](/architecture/drift) compares the manifest's "cognitive map" against actual code state. If the AI's understanding falls behind reality, the system forces a synchronization before the next task begins.

---

## Journey 4: Copy-Paste-Driven Development

**You**: "Add a data table to the Users page."

AI writes 120 lines: table component, sorting, pagination, search filter.

**You**: "Now add a similar table to the Orders page."

AI copies the Users table, changes column names. 120 more lines, 90% identical.

**You**: "And one for Products."

Three copies now exist. They're almost identical — but each has slight differences in how sorting works, how pagination resets, how the search debounce is timed. When you fix a bug in one table, **the other two still have it.**

### What Archon Does

The [Soul](/kernel/) codifies the **Rule of Three**: "Two repetitions are not yet grounds for abstraction — premature generalization is more dangerous than duplication." But at the third occurrence, the system triggers:

1. **Pattern recognition** — the reviewer identifies the repeated table pattern
2. **Abstraction proposal** — extract a shared `DataTable` component with configurable columns, sort, and pagination
3. **Constraint creation** — `❌ Duplicating table/list UI patterns — use the shared DataTable component`

Going forward, AI uses the shared component instead of copying. Bug fixes propagate automatically.

---

## Journey 5: Error Handling Anarchy

Page A: API error → shows a toast notification.
Page B: API error → renders a red banner at the top.
Page C: API error → **entire page crashes with a white screen.**

Each page was built in a different session. Each time, AI "handled the error" in whatever way seemed locally reasonable. The user experience is fragmented: sometimes errors are graceful, sometimes the app dies.

### What Archon Does

This is the [Feedback Loop](/architecture/feedback-loop) in action. The first time a page crashes from an API failure, Stage 3.6 (Knowledge Evolution) captures the lesson:

```
❌ Single API failure crashes the entire page — wrap each section with isError/refetch
❌ Inconsistent error display patterns — use the project's ErrorBoundary component
```

These become permanent constraints. Every subsequent page built under Archon automatically gets:
- Independent error boundaries per API section
- Consistent error UI via the established pattern
- Skeleton screens during loading states

The second feature doesn't repeat the first feature's mistakes. The tenth feature is nearly bulletproof.

---

## Journey 6: The Config Scattering Problem

Your project has:
- API base URL hardcoded in 12 files
- Environment variables defined in `.env`, `.env.local`, and two config files
- Theme colors in a CSS file, a Tailwind config, AND three inline style objects
- Feature flags checked with three different mechanisms

AI doesn't consolidate. It looks at nearby code, copies whatever pattern it sees locally, and moves on. **The project slowly becomes a maze of duplicated configuration with no single source of truth.**

### What Archon Does

The reviewer's structural audit (Dimension 2) specifically detects config scattering:

- **Scattered configuration detection** — finds the same magic string/URL/color in multiple files
- **Centralization proposal** — extract to a single config module with typed exports
- **Import boundary enforcement** — the [Handoff driver](/drivers/handoff) ensures config values are imported from one canonical location

The constraint system prevents regression:

```
❌ Hardcoded API URLs, theme colors, or feature flags — import from config/
```

---

## Journey 7: The "Works on My Screen" Blindspot

AI builds a beautiful dashboard. Every component loads its data on mount. Five API calls fire simultaneously. On your dev machine with fast internet, it loads in 800ms. Looks great.

On production, with real users on mobile networks: **the page takes 8 seconds to load, the layout jumps around as data arrives, and users on slow connections see a blank screen for 3 seconds before anything renders.**

AI never considers the user outside the happy path. It doesn't think about slow networks, large datasets, off-screen content, or viewport-based loading.

### What Archon Does

The [Async Loading driver](/drivers/async-loading) contains architectural constraints that AI cannot skip:

```
❌ Firing all API calls on mount regardless of scroll — use skip: !inView
❌ No skeleton/loading state for async sections — add Skeleton before data
❌ No error recovery UI — add retry mechanism for failed requests
```

These aren't suggestions. They're part of the AI's active instruction set during code generation. The AI writes viewport-aware, progressively-loading, error-resilient code **by default** — not because it's smart enough to think of it, but because the constraint system won't let it skip it.

---

## Journey 8: Code Without a Manual

You ask AI to build a permission system. It delivers: role definitions, middleware guards, route protection, a `usePermission` hook. It works. You merge it.

Two weeks later, a new team member asks: "How does the permission system work? Which roles exist? How do I add a new one?" You look for documentation. **There is none.** The AI wrote 600 lines of code and zero lines of explanation.

You go back to AI: "Document the permission system." It writes a README. But by now the code has changed — the README is already partially wrong. You ask AI to update it. It overwrites with a fresh description that misses the edge cases the previous version covered.

This repeats for every feature. The codebase grows, but its documentation is either missing, stale, or contradictory. **You built a product nobody can understand without reading every line of source code.**

### What Archon Does

Archon treats documentation as a **deliverable, not an afterthought**. The demand pipeline enforces this at multiple stages:

1. **Manifest update (Stage 5)** — Every completed feature is recorded in the project manifest: what it does, where it lives, what patterns it uses. This is the project's living table of contents.

2. **Knowledge evolution (Stage 3.6)** — When the agent discovers new patterns or makes architectural decisions, they're captured in `proposed-rules.md` and architecture docs — not left as tribal knowledge in someone's chat history.

3. **Drift detection** — The [drift mechanism](/architecture/drift) tracks whether documentation reflects reality. When code changes outpace doc updates, the drift counter increments. At threshold, the system forces a reconciliation: "the manifest says auth uses JWT, but the code switched to session tokens — update the manifest."

4. **Refactor reports** — Every significant change produces a structured record: what changed, why, what was considered and rejected. This is the project's institutional memory — the "why" behind every "what."

The result: your project always has a current, accurate map of itself. New team members (human or AI) can read the manifest and understand the system without archaeology.

---

## The Pattern

Every journey shares the same root cause:

> **AI optimizes for the current request, not the long-term health of the codebase.**

This isn't a flaw — it's the nature of a stateless, memoryless system. The solution isn't to make AI "think harder." The solution is to give it an environment that makes the right choice the default choice.

That's what Archon Protocol is: **an operating system that turns locally-optimal AI decisions into globally-consistent engineering outcomes.**

| Without Archon | With Archon |
|----------------|-------------|
| Files grow until someone notices | Bloat detected and split proactively |
| Patterns drift across sessions | Constraints lock in proven patterns |
| Yesterday's decisions are forgotten | Manifest carries decisions forward |
| Copy-paste until bugs multiply | Rule of Three triggers abstraction |
| Error handling is per-page lottery | Feedback loop enforces consistency |
| Config scatters across the project | Structural audit centralizes config |
| Happy-path-only development | Drivers enforce real-world resilience |
| Code ships without documentation | Manifest + drift detection keep docs current |

---

## Ready to Start?

- [Getting Started](/guide/getting-started) — Install and run your first command
- [Design Philosophy](/guide/design-philosophy) — Understand why Archon works this way
- [Feedback Loop](/architecture/feedback-loop) — See how the system learns from every task
