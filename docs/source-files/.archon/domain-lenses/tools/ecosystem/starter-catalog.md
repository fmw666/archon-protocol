# Tool: starter-catalog

Domain: ecosystem
Purpose: Normalize external starter systems into compact, comparable records before recommendation.

Inputs:
- Demand summary
- Candidate repository, framework, template, or starter system
- Target environment constraints and available source evidence

Outputs:
- Comparable starter-system record
- Fit notes and unknowns
- Recommendation status: recommend, candidate, blocked, or reject

Retrieval Cues:
- starter system
- open source repository
- framework recommendation
- template catalog
- new environment
- out-of-the-box project
- ecosystem record

Output Format:
```text
starter_system_record:
- id: <stable external identifier, usually host/owner/name>
- ecosystem: <language, runtime, or platform family>
- primary_use: <what this system starts>
- evidence: <links or local facts used>
- fit: <why it matches or does not match the target environment>
- unknowns: <facts that must be verified before adoption>
- status: <recommend|candidate|blocked|reject>
```

Seed Records:
- `github:vapor/vapor`: Swift backend candidate; publicly identifies as a server-side Swift HTTP web framework. Status: candidate until the current demand verifies version, license, setup path, and fit.
- `github:fmw666/fastapi-builder`: stakeholder-owned Python backend starter-system project. Status: candidate; before adoption, verify repository access, setup path, license/ownership context, and maintenance signals.

Use When:
- A demand asks what external system to use first
- A demand names a project and asks Archon to remember or compare it
- A new environment needs a shortlist before implementation begins

Do Not:
- Treat a catalog entry as verified without source evidence
- Recommend a system only because it is familiar or popular
- Use this tool outside the selected ecosystem lens
- Use this tool to justify unrelated work
- This tool cannot call other tools
- This tool cannot create lifecycle gates
- This tool cannot override soul

Verification:
- The record names a stable external identifier and separates facts from unknowns
- The status matches the evidence strength, not the user's wording
- Unverified entries remain candidates or blocked records, not recommendations
