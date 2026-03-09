# The OS Model

Archon Protocol is an **operating system for AI agents**. Every file maps to an OS concept with precise loading semantics: what is always resident, what is loaded on demand, what persists across sessions.

## The Complete Map

```
┌──────────────────────────────────────────────────────────────────┐
│  ARCHON PROTOCOL = AI Agent Operating System                     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  KERNEL (always resident in context)                      │    │
│  │                                                           │    │
│  │  AGENTS.md / CLAUDE.md        Prime directive, workflow   │    │
│  │  archon.config.yaml           System configuration        │    │
│  │  ai-index.md                  Page table (address map)    │    │
│  └──────────────────────────────────────────────────────────┘    │
│                          ↕ syscall interface                     │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  DRIVERS (loaded into kernel via `skills:` field)         │    │
│  │                                                           │    │
│  │  archon-code-quality          Type safety, file limits    │    │
│  │  archon-test-sync             Test follows code           │    │
│  │  archon-async-loading         Skeleton, retry, lazy load  │    │
│  │  archon-error-handling        Structured errors           │    │
│  │  archon-handoff               Interface contracts         │    │
│  │  archon-nextjs-ssr  ⟵ conditional, detected by init     │    │
│  │  archon-react-hydration  ⟵ conditional                   │    │
│  └──────────────────────────────────────────────────────────┘    │
│                          ↕ process management                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  SYSTEM CALLS (user-invoked commands)                     │    │
│  │                                                           │    │
│  │  /archon-init      = boot()    Bootstrap + hardware scan  │    │
│  │  /archon-demand    = exec()    Full delivery pipeline     │    │
│  │  /archon-audit     = stat()    Read-only health check     │    │
│  │  /archon-refactor  = defrag()  Progressive restructure    │    │
│  │  /archon-verifier  = fsck()    Independent integrity check│    │
│  └──────────────────────────────────────────────────────────┘    │
│                          ↕ child process spawning                │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  DAEMONS (internal, never user-invoked)                   │    │
│  │                                                           │    │
│  │  archon-self-auditor   = watchdog   6-dim code audit      │    │
│  │  archon-test-runner    = testd      Test sync + execution │    │
│  └──────────────────────────────────────────────────────────┘    │
│                          ↕ read/write                            │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  FILESYSTEM (persistent storage)                          │    │
│  │                                                           │    │
│  │  /docs/architecture/    = /usr/src/    Kernel source      │    │
│  │  /docs/guide/           = /usr/share/man/  Man pages      │    │
│  │  /docs/reference/       = /usr/share/info/ Reference      │    │
│  │  /docs/decisions/       = /var/log/    System journal      │    │
│  │  /proposed-rules.md     = /tmp/staging Package staging    │    │
│  │  /todo/debt_radar.md    = /var/spool/  Job queue          │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  INSTALLER & PACKAGE MANAGER                              │    │
│  │                                                           │    │
│  │  templates/install.sh           = OS installer            │    │
│  │  templates/archon.config.yaml   = Default /etc/           │    │
│  │  templates/constraints/         = Driver packages         │    │
│  │  tests/                         = POST (power-on self-test)│   │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

## Layer-by-Layer Breakdown

### 1. Kernel — Always Resident

The kernel is **always loaded into the AI's context window**. It never gets paged out. It defines who the agent is, what rules it follows, and where to find everything else.

| File | OS Equivalent | Loading | Purpose |
|------|--------------|---------|---------|
| `AGENTS.md` | Kernel image | `alwaysApply: true` | Identity, prime directive, core workflow loop |
| `archon.config.yaml` | `/etc/` | Read at every command | Project config: language, framework, environment |
| `ai-index.md` | Page table | Read by AI to locate files | Maps every document to its purpose and path |

**Why always resident**: Without the kernel, the agent has no identity, no workflow, no constraint awareness. Every other component depends on the kernel being present.

**Linux analogy**: `AGENTS.md` is `/boot/vmlinuz` — the first thing loaded, the last thing unloaded, the authority that everything else obeys.

### 2. Drivers — Loaded into Kernel Space

Drivers are **constraint skills**. They define hard boundaries (❌ prohibitions) and are injected into the agent's context alongside the kernel via the `skills:` field in agent frontmatter.

| File | OS Equivalent | Loading | When Active |
|------|--------------|---------|-------------|
| `archon-code-quality` | Storage driver | Preloaded via `skills:` | Every code change |
| `archon-test-sync` | FS integrity driver | Preloaded via `skills:` | Every code change |
| `archon-async-loading` | Display driver | Preloaded via `skills:` | UI component edits |
| `archon-error-handling` | Network driver | Preloaded via `skills:` | API/component edits |
| `archon-handoff` | IPC driver | Preloaded via `skills:` | Cross-boundary changes |
| `archon-nextjs-ssr` | GPU driver (optional) | Deployed if framework detected | Next.js projects only |
| `archon-react-hydration` | Audio driver (optional) | Deployed if framework detected | React projects only |

**Why "drivers"**: Like hardware drivers, constraint skills translate high-level intent ("write good code") into low-level enforcement ("no `any` type, no empty `catch`"). They run in kernel space — the agent cannot ignore them.

**Loading mechanism**: The `skills:` field in agent YAML frontmatter is the equivalent of `modprobe` — it loads drivers into kernel context before the agent starts processing.

```yaml
# archon-demand.md frontmatter = kernel module loading
skills:
  - archon-code-quality      # LD_PRELOAD equivalent
  - archon-test-sync
  - archon-async-loading
  - archon-error-handling
  - archon-handoff
```

### 3. System Calls — User-Invoked Commands

System calls are the **command agents/skills** that users invoke directly. Each syscall triggers a well-defined kernel-level operation.

| Command | Syscall Analogy | What It Does |
|---------|----------------|-------------|
| `/archon-init` | `boot()` | Detect hardware (environment), load drivers (constraints), mount filesystem (config), run POST |
| `/archon-demand` | `exec()` | Fork a delivery process: implement → audit → fix → evolve → commit |
| `/archon-audit` | `stat()` | Read-only inspection of project health, scored 0-100 |
| `/archon-refactor` | `defrag()` | Analyze fragmentation (tech debt), plan progressive restructure |
| `/archon-verifier` | `fsck()` | Independent integrity check — verify claimed work was actually done |

**Process lifecycle of `/archon-demand`** (the primary syscall):

```
User: /archon-demand "add dark mode"
  │
  ├── Stage 0: Read refactor plan         (check process environment)
  ├── Stage 1: Implement                  (exec: write code)
  ├── Stage 1.5: Linter verification      (syscall: lint)
  ├── Stage 2: (reserved)
  ├── Stage 3: Self-audit                 (fork: spawn watchdog daemon)
  │   ├── 3.1 Rule scan                   (driver: code-quality)
  │   ├── 3.2 Structure check             (driver: code-quality)
  │   ├── 3.3 Edge cases                  (driver: error-handling)
  │   ├── 3.4 Test sync                   (fork: spawn test daemon)
  │   ├── 3.5 i18n check                  (driver: code-quality)
  │   └── 3.6 Knowledge evolution         (write: proposed-rules.md)
  ├── Stage 4: Fix issues found           (self-heal)
  ├── Stage 5: Final verify               (fork: spawn fsck)
  └── Stage 6: Commit                     (sync: persist to disk)
```

### 4. Daemons — Internal Services

Daemons are **never invoked by the user**. They are spawned by system calls (primarily `/archon-demand`) as child processes with isolated context.

| Daemon | OS Equivalent | Spawned By | Capability |
|--------|--------------|-----------|------------|
| `archon-self-auditor` | `watchdogd` | demand Stage 3 | Read-only 6-dimension code audit |
| `archon-test-runner` | `testd` | demand Stage 3.4 | Test discovery, assertion sync, execution |

**Why isolated context matters**: Like OS daemons that run in their own address space, these agents get their own context window. The audit daemon's internal reasoning (scanning 200 prohibitions across 50 files) doesn't pollute the main process's working memory.

### 5. Filesystem — Persistent Storage

The filesystem is the **documentation hierarchy**. It persists across sessions and provides the agent's long-term memory.

| Path | FS Equivalent | Persistence | Purpose |
|------|--------------|-------------|---------|
| `docs/architecture/` | `/usr/src/` | Permanent | Kernel source: how the system works |
| `docs/guide/` | `/usr/share/man/` | Permanent | User manuals: how to use the system |
| `docs/reference/` | `/usr/share/info/` | Permanent | Reference docs: complete command/skill specs |
| `docs/decisions/` | `/var/log/journal/` | Append-only | System journal: why decisions were made (ADRs) |
| `proposed-rules.md` | `/tmp/staging/` | Transient | Package staging: proposed rules awaiting approval |
| `todo/debt_radar.md` | `/var/spool/` | Transient | Job queue: work items awaiting execution |

**Mount semantics**:
- `docs/architecture/` is **read-only** for regular tasks — only modified during explicit architecture work
- `docs/decisions/` is **append-only** — ADRs are never deleted, only superseded
- `proposed-rules.md` is **read-write** — rules flow in from Stage 3.6, flow out to constraint skills after approval
- `todo/debt_radar.md` is **read-write** — items added during EVOLVE step, removed when completed

### 6. Installer & Package Manager

| File | OS Equivalent | Purpose |
|------|--------------|---------|
| `templates/install.sh` | OS installer (Debian installer) | Initial deployment of all files to correct paths |
| `templates/archon.config.yaml` | Default `/etc/` | Config template, filled during boot |
| `templates/constraints/` | Driver packages (`.deb`, `.rpm`) | Framework-specific constraints, installed if needed |
| `tests/` | POST (Power-On Self-Test) | Verify system integrity after install or changes |

## Memory Model

The AI's context window is RAM. Not everything fits at once. The OS model dictates what stays resident and what gets paged.

```
┌────────────────────────────────────────────┐
│  ALWAYS RESIDENT (kernel space)            │  ~2% of context
│  AGENTS.md + archon.config.yaml            │
├────────────────────────────────────────────┤
│  PRELOADED (driver space)                  │  ~5% of context
│  Constraint skills via `skills:` field     │
├────────────────────────────────────────────┤
│  ON DEMAND (user space)                    │  ~93% of context
│  Source code, test output, docs lookups,   │
│  git diff, terminal output, etc.           │
└────────────────────────────────────────────┘
```

**Key insight**: The kernel + drivers consume ~7% of context. This is the "tax" for governance. The remaining 93% is free for actual work. This is why Archon uses constraint skills (compact prohibitions) instead of verbose guides — every token in kernel space is prime real estate.

## Boot Sequence

When `/archon-init` runs, it follows a boot sequence analogous to a real OS:

```
1. BIOS/UEFI    → Detect execution environment (Cursor? Claude Code? Codex?)
2. Bootloader   → Read archon.config.yaml (or create if first boot)
3. Kernel load  → AGENTS.md already resident (alwaysApply: true)
4. Hardware scan→ Detect project: language, framework, i18n, state, tests
5. Driver load  → Deploy constraint skills to skills_dir
6. Mount FS     → Verify docs/ structure exists and is consistent
7. Init system  → Start first process (await user's /archon-demand)
8. POST         → Run integrity tests (vitest)
```

## Why This Model Matters

Without the OS metaphor, the protocol is "a bunch of markdown files." With it:

1. **Loading priority is unambiguous** — kernel files are non-negotiable, driver files are critical, filesystem is reference
2. **New contributors instantly understand hierarchy** — "is this a kernel change or a filesystem change?"
3. **Context budget is explicit** — kernel = always loaded, drivers = preloaded per command, filesystem = on-demand
4. **Evolution path is clear** — new constraints are drivers, not kernel patches; new docs are filesystem writes, not kernel recompiles
