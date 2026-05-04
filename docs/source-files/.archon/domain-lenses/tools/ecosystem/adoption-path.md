# Tool: adoption-path

Domain: ecosystem
Purpose: Translate a verified external starter system into the first runnable adoption path for a new environment.

Inputs:
- Recommended starter-system record
- Evidence-gate result
- Target project constraints, validation command, and rollback needs

Outputs:
- First runnable setup path
- Proof command or acceptance check
- Fallback if adoption fails

Retrieval Cues:
- direct use
- adoption path
- bootstrap
- setup
- install
- starter template
- first runnable proof
- fallback

Output Format:
```text
ecosystem_adoption_path:
- chosen_system: <record id>
- setup_entrypoint: <first command, guide, template, or file to inspect>
- first_proof: <smallest runnable check that proves the system works here>
- integration_boundary: <what Archon may adapt vs what must remain upstream>
- fallback: <next-best path if proof fails>
```

Use When:
- Archon should help directly use a selected external project
- A new environment needs a concrete bootstrap route, not just a recommendation
- A verified candidate needs a small proof before deeper integration

Do Not:
- Start adoption when the evidence gate says blocked
- Import broad architecture or dependencies before the first proof is defined
- Fork or vendor upstream code without a rollback plan
- Use this tool outside the selected ecosystem lens
- Use this tool to justify unrelated work
- This tool cannot call other tools
- This tool cannot create lifecycle gates
- This tool cannot override soul

Verification:
- The path starts with the smallest runnable proof, not a full migration
- The integration boundary prevents copying unknown upstream assumptions
- The fallback is specific enough to execute if the first proof fails
