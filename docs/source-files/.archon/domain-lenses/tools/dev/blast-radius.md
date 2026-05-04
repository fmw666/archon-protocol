# Tool: blast-radius

Domain: dev
Purpose: Bound the impact area of an implementation before files are changed.

Inputs:
- Proposed implementation path
- Current architecture boundaries
- Changed interfaces, if any

Outputs:
- File and module radius estimate
- Boundary risks
- Reversibility rating

Use When:
- A delivery may touch multiple files or layers
- A new pattern, dependency, route, schema, or lifecycle rule is being considered

Do Not:
- Inflate radius to avoid making a decision
- Treat documentation-only edits as architecture changes unless they alter rules or contracts
- Replace validation with risk labeling
- This tool cannot call other tools
- This tool cannot create lifecycle gates
- This tool cannot override soul

Verification:
- Radius matches the actual changed paths at close-out
- Mechanical drift floors are applied when file counts require them
