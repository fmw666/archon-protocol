# Tool: component-pattern

Domain: design
Purpose: Select a UI component pattern that fits the user's interface need and the existing design system.

Inputs:
- User-facing intent
- Page or component context
- Existing component vocabulary

Outputs:
- Recommended component pattern
- Required layout constraints
- Anti-patterns to avoid

Use When:
- A demand describes an interface element imprecisely
- A page needs a new visible structure or interaction container
- Multiple component shapes could solve the same UI need

Do Not:
- Introduce a new visual style
- Choose a third-party component when the local design system already covers the need
- Ignore accessibility or overflow constraints
- This tool cannot call other tools
- This tool cannot create lifecycle gates
- This tool cannot override soul

Verification:
- The selected component has clear states and content boundaries
- The pattern is consistent with the active design system
