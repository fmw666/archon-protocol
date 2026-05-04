# Tool: adoption-plan

Domain: capability
Purpose: Turn a selected reusable capability practice into a project-specific adoption boundary and proof.

Inputs:
- Selected practice or skill
- Current project facts, constraints, and validation command
- First proof needed to trust the capability in this project

Outputs:
- Adoption boundary
- Minimal project-specific plan
- Validation proof or blocker

Retrieval Cues:
- apply best practice
- adoption path
- project-specific plan
- first proof
- validation evidence
- rollout boundary
- fallback

Output Format:
```text
capability_adoption_plan:
- capability: <category>
- loaded_asset: <skill, tool, rule, test, design plan, ADR, or manifest fact>
- project_boundary: <what must be adapted here>
- first_proof: <smallest validation or inspection that proves fit>
- fallback: <what to do if the proof fails>
```

Use When:
- A reusable practice has been selected and needs to become a concrete project action
- The same capability may have different adoption paths across projects
- Archon must separate universal guidance from local constraints before implementation

Do Not:
- Copy generic best-practice text into project code without a proof
- Treat documentation as sufficient when a test, rule, type, or validation command can prove the adoption
- Hide blockers such as missing credentials, unavailable runtime access, or unverified provider facts
- Use this tool outside the selected capability lens
- Use this tool to justify unrelated work
- This tool cannot call other tools
- This tool cannot create lifecycle gates
- This tool cannot override soul

Verification:
- The first proof is smaller than a full migration or full feature build
- The plan states what is universal guidance and what is project-specific adaptation
- The fallback is executable if the proof fails or the selected practice does not fit
