# Tool: visual-constraint

Domain: design
Purpose: Translate the active visual system into concrete constraints for a UI delivery.

Inputs:
- Component or page context
- Existing design rules
- Content density and overflow risk

Outputs:
- Required typography, color, border, and spacing constraints
- Overflow and responsive rules
- Visual anti-patterns to reject

Use When:
- A design demand could drift into generic modern UI defaults
- A component carries dynamic text or user-generated content
- The delivery modifies styling classes or CSS

Do Not:
- Replace product clarity with ornament
- Use soft shadows, weak borders, or unrelated color systems when the project forbids them
- Treat visual constraints as optional polish
- This tool cannot call other tools
- This tool cannot create lifecycle gates
- This tool cannot override soul

Verification:
- The output can be checked against the project design system
- Dynamic content has containment and truncation behavior where needed
