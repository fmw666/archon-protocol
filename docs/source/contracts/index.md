# Contracts

Portable governance contract — the machine-readable schema that defines what a valid Archon project looks like. Adopters can validate their `.archon/` tree against this contract to catch drift, missing files, and malformed records.

| File | Role |
|------|------|
| [`governance-contract.yaml`](/source/contracts/governance-contract) | YAML schema for files, records, invariants, and contract version |

The contract is consumed by `scripts/archon-check.*` and `archon doctor`.
