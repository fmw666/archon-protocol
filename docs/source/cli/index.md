# Archon CLI

Human-facing wrapper over the export pipeline. Apache-2.0, zero runtime dependencies, Node ≥ 18.

| File | Role |
|------|------|
| [`package.json`](/source/cli/package) | npm package manifest; `bin.archon` exposes the CLI on PATH |
| [`bin/archon.mjs`](/source/cli/bin-archon) | Entry point; subcommand router; help / version / error handling |
| [`lib/common.mjs`](/source/cli/lib-common) | Shared: flag parsing, source-repo auto-discovery, version read |
| [`lib/init.mjs`](/source/cli/lib-init) | `archon init &lt;target-dir&gt;` — scaffold + post-init banner |
| [`lib/doctor.mjs`](/source/cli/lib-doctor) | `archon doctor [project-dir]` — three-layer audit (structural / contract / hints) |
| [`lib/export.mjs`](/source/cli/lib-export) | `archon export &lt;output-dir&gt;` — standalone kit export |

See the [CLI README](/setup/cli) for the full user-facing command reference.
