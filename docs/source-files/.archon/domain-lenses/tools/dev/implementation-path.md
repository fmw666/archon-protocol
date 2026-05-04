# Tool: implementation-path

Domain: dev
Purpose: Select the smallest coherent implementation route for the current demand.

Inputs:
- Demand summary
- Existing architecture
- Affected files or modules

Outputs:
- Preferred implementation path
- Files or modules likely touched
- Rejected heavier path, if relevant

Use When:
- The demand requires code or governance implementation
- There is a choice between patching, extending, or introducing a new module

Do Not:
- Use this tool to justify unrelated refactors
- Split work into multiple hats inside one delivery
- Override the Verdict gate
- This tool cannot call other tools
- This tool cannot create lifecycle gates
- This tool cannot override soul

Verification:
- The chosen path preserves existing ownership boundaries
- The path has a clear validation command or focused test target
