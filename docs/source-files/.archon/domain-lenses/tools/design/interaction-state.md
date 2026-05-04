# Tool: interaction-state

Domain: design
Purpose: Define the visible states and feedback behavior for an interactive UI element.

Inputs:
- Component pattern
- User action
- Loading, empty, success, and error conditions

Outputs:
- State list
- Trigger and transition expectations
- Required disabled or pending behavior

Use When:
- A UI element is clickable, editable, async, or stateful
- The demand mentions hover, press, loading, confirmation, or feedback

Do Not:
- Add decorative animation without functional state meaning
- Hide destructive or pending states
- Override accessibility requirements
- This tool cannot call other tools
- This tool cannot create lifecycle gates
- This tool cannot override soul

Verification:
- Every async path has a visible pending and error state
- Interactive feedback follows the active design system's timing and motion constraints
