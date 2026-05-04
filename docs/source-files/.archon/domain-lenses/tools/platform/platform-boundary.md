# Tool: platform-boundary

Domain: platform
Purpose: Classify the platform boundary a demand touches and choose the proof needed before it is trusted.

Inputs:
- Demand summary
- Manifest or stack facts about data, hosting, environments, and validation
- Existing runtime, permission, migration, or launch constraints

Outputs:
- Platform boundary classification
- Main operational or permission risk
- Required proof or blocker before completion

Use When:
- The demand touches persisted data, schema, migrations, auth-coupled access, or remote state
- The demand touches deployment, hosting runtime, scheduled work, domain setup, or production readiness
- The demand involves tokens, keys, privileged credentials, environment variables, webhook secrets, or admin access

Do Not:
- Use this tool outside the selected platform lens
- Call provider APIs or treat provider convenience as proof of correctness
- Expose or request secret values in chat or committed files
- This tool cannot call other tools
- This tool cannot create lifecycle gates
- This tool cannot override soul

Verification:
- The output names exactly one dominant platform boundary, with secondary risks listed only if they affect planning
- Provider-specific commands or facts come from the project manifest or stack docs, not from this universal card
- The proof is a concrete check: migration/policy/API/integration test, build/smoke/launch check, or explicit credential blocker

Retrieval Cues:
- platform
- database
- deployment
- hosting
- environment variable
- secret
- permission
- production readiness

Output Format:

```text
platform_boundary:
- dominant_boundary:
- secondary_risks:
- main_risk:
- required_proof_or_blocker:
```
