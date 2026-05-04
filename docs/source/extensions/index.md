# Extensions

Optional runtime extensions that bolt onto the Archon core. Extensions live under `.archon/extensions/<name>/` and follow the extension contract (hook registration, side-effect budget, cleanup). Each extension is a self-contained module; adopters enable only what they need.

## demand-pool

A lightweight backlog queue for pending Demands that haven't yet entered a Run. Acts as a staging area between "someone proposed work" and "the cognitive loop picks it up".

| File | Role |
|------|------|
| [`extension.md`](/source/extensions/demand-pool/extension) | Extension contract: hooks, invariants, side-effect budget |
| [`demands.md`](/source/extensions/demand-pool/demands) | The backlog itself — one row per pending demand |

This is the reference implementation. Use it as a template when authoring other extensions.
