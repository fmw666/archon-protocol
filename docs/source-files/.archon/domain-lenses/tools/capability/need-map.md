# Tool: need-map

Domain: capability
Purpose: Map a user request to the reusable capability category and knowledge asset lane it needs.

Inputs:
- Demand summary
- Current project constraints and manifest facts when available
- Existing knowledge asset index, including skills, rules, tests, domain tools, and ADRs

Outputs:
- Capability category
- Recommended knowledge asset lane
- Missing evidence or asset gap

Retrieval Cues:
- toolset
- capability
- best practice
- adoption guidance
- deployment strategy
- data platform
- state management
- responsive behavior
- loading strategy
- skeleton screen

Output Format:
```text
capability_need_map:
- capability_category: <deployment|data-platform|state-management|responsive-ui|loading-feedback|other>
- reusable_asset_lane: <skill|domain-tool|rule|test|design-plan|manifest-fact|ADR>
- existing_asset: <asset id or none>
- gap: <missing practice, evidence, or project fact>
```

Use When:
- The user asks for reusable best-practice tools rather than a single code change
- The demand names a capability area but not the knowledge vehicle that should carry it
- Archon must decide whether to load an existing skill or create a project-specific plan

Do Not:
- Treat a named provider or framework as automatically fit for the project
- Store provider-specific commands, APIs, versions, pricing, or credentials in this universal card
- Use this tool outside the selected capability lens
- Use this tool to justify unrelated work
- This tool cannot call other tools
- This tool cannot create lifecycle gates
- This tool cannot override soul

Verification:
- The category is stated as a capability, not a vendor or library preference
- The asset lane follows the constraint pyramid and does not invent a parallel memory vehicle
- Any missing evidence is explicit enough to drive the next proof or skill lookup
