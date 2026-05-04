# Tool: evidence-gate

Domain: ecosystem
Purpose: Decide whether an external starter system has enough evidence to be recommended or adopted.

Inputs:
- Starter-system record
- Source evidence: repository metadata, documentation, releases, examples, or local proof
- Target environment constraints and adoption risk

Outputs:
- Evidence confidence
- Blocking gaps or acceptable risks
- Recommendation permission: yes, provisional, or no

Retrieval Cues:
- verify repository
- evidence
- confidence
- maintenance risk
- license
- documentation
- release status
- adoption blocker

Output Format:
```text
ecosystem_evidence_gate:
- confidence: <high|medium|low|blocked>
- verified_facts: <facts with evidence>
- unverified_claims: <claims that remain unsafe>
- blockers: <missing evidence that prevents recommendation>
- permission: <yes|provisional|no>
```

Use When:
- A candidate comes from memory, user input, search results, or a third-party list
- A recommendation would change the starting architecture or stack
- A project is attractive but its maintenance, license, setup path, or identity is unclear

Do Not:
- Convert search snippets into durable facts without source corroboration
- Hide uncertainty behind generic "seems good" language
- Use popularity as a substitute for fit, license, or runnable setup evidence
- Use this tool outside the selected ecosystem lens
- Use this tool to justify unrelated work
- This tool cannot call other tools
- This tool cannot create lifecycle gates
- This tool cannot override soul

Verification:
- Every recommended fact can point to a source or local proof
- "Provisional" names the exact proof needed before direct adoption
- "No" or "blocked" preserves the candidate record without presenting it as usable
