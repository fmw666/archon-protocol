# Tool: critique-audit-loop

Domain: design
Purpose: Turn a draft interface into an improvement loop that separates UX critique from technical audit before finalization.

Inputs:
- Draft interface, mockup, or implemented page
- User-facing intent and success criteria
- Quality constraints for accessibility, responsiveness, and maintainability

Outputs:
- UX critique findings
- Technical audit findings
- Prioritized revision loop with stop condition

Retrieval Cues:
- critique
- audit
- review UI
- polish
- design QA
- final pass

Use When:
- A UI draft is roughly formed and needs refinement
- The demand asks for review, polish, critique, audit, or quality checks
- A design should not be considered done until both user experience and implementation quality are checked

Output Format:
```text
critique_audit_loop:
- ux_findings: <usability, hierarchy, clarity>
- technical_findings: <accessibility, responsiveness, maintainability, compliance>
- priority_order: <fix sequence>
- stop_condition: <what proves the loop is done>
```

Do Not:
- Replace validation with taste-based opinions
- Collapse UX critique and technical audit into one vague "looks good" pass
- Continue iterating without a clear stop condition
- This tool cannot call other tools
- This tool cannot create lifecycle gates
- This tool cannot override soul

Verification:
- UX issues and technical issues are separated before prioritization
- The loop has a concrete completion condition, not endless polish
- At least one finding is tied to user-facing clarity and one to implementation quality when both surfaces exist
