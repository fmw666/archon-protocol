# Tool: practice-selector

Domain: capability
Purpose: Select the strongest fitting reusable knowledge vehicle for a capability request.

Inputs:
- Capability need-map result
- Existing project or platform skill inventory
- Whether the practice is enforceable, reusable, architectural, or project-specific

Outputs:
- Selected knowledge vehicle
- Reuse boundary
- Reason not to use weaker or broader vehicles

Retrieval Cues:
- skill selection
- best-practice pack
- reusable practice
- design plan
- guardrail
- adoption skill
- project-specific adaptation

Output Format:
```text
capability_practice_selector:
- selected_vehicle: <existing-skill|new-skill|domain-tool|rule|test|design-plan|ADR|manifest>
- selected_asset: <asset id or proposed slug>
- reuse_boundary: <what is universal vs project-specific>
- rejected_vehicle: <weaker or broader vehicle and why>
```

Use When:
- A capability could be represented as a skill, domain tool, rule, test, ADR, manifest fact, or design plan
- Archon needs to load only the assets relevant to the current request
- A repeated practice is ready to be promoted from one-off advice into a reusable asset

Do Not:
- Create a new skill when an existing skill or project fact already carries the practice
- Use a domain tool for provider-specific API instructions that belong in a skill
- Promote a one-off preference into a permanent asset without evolution evidence
- Use this tool outside the selected capability lens
- Use this tool to justify unrelated work
- This tool cannot call other tools
- This tool cannot create lifecycle gates
- This tool cannot override soul

Verification:
- The selected vehicle is the strongest fitting layer available under the constraint pyramid
- The reuse boundary prevents universal files from absorbing project stack facts
- The rejected vehicle rationale is specific, not a generic preference
