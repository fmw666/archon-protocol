# Tool: validation-plan

Domain: dev
Purpose: Choose the validation evidence required for a delivery.

Inputs:
- Changed file categories
- Existing validation command
- Focused test targets, if known

Outputs:
- Required validation command
- Optional focused checks before full validation
- Red-to-green repair loop, if validation fails

Use When:
- Files are changed
- A new guardrail or test is added
- A delivery changes behavior or governance contracts

Do Not:
- Mark validation optional when files changed
- Substitute manual inspection for an available automated check
- Skip failed validation without registering a blocking close-out status
- This tool cannot call other tools
- This tool cannot create lifecycle gates
- This tool cannot override soul

Verification:
- The manifest-declared validation command passes before delivery is complete
- Any focused checks are followed by the full required validation when risk warrants it
