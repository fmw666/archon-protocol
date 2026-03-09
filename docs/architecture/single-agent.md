# Single-Agent Design

Archon Protocol uses a single AI agent that owns the entire delivery — not a team of agents collaborating.

## Why Not Multi-Agent?

### Problem 1: Goal consistency

Multiple agents have independent context windows. Even with the same project goal, their **understanding and prioritization** will differ. This creates architectural drift.

### Problem 2: Context loss

When Agent A summarizes its work for Agent B, 90% of context is lost. The "tech lead" agent making decisions based on summaries is making decisions on incomplete information.

### Problem 3: Coordination overhead

Communication paths grow as N×(N-1)/2. Two agents = 1 path. Five agents = 10 paths. Each path is a potential point of misunderstanding.

### Problem 4: Capability paradox

If the "manager" agent is smart enough to evaluate the work of specialist agents, it's smart enough to do the work itself. Unlike humans, AI has no physical fatigue — making it "manage" instead of "do" wastes its strongest capability.

## The Archon Model

One agent does everything. Internal skills provide focused workflows, but the agent retains full decision-making authority:

```
Multi-Agent Team          Archon Protocol
────────────────          ────────────────
4 engineers collaborate   1 engineer with IDE, terminal, debugger
Peer negotiation          Master-subordinate invocation
Each decides, then sync   Agent decides, skills execute
Context must be shared    Agent holds full context
Conflicts need arbiter    No conflicts — agent has final say
```

## Why Internal Skills Exist

If it's a single agent, why split into multiple skills?

**Cognitive focus.** The agent's context window is finite. A self-audit scanning all prohibitions across all modified files generates enormous intermediate output. Running it as a focused skill keeps the main task context clean.

Think of it as one engineer with multiple monitors — not multiple engineers collaborating.

## The Core Insight

> Documented constraints > supervision by another agent.

You don't need a second agent to "watch" the first one. You need a comprehensive constraint system that the first agent cannot violate. That's what Archon Protocol provides.
