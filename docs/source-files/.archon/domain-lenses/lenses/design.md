# Lens: design

Purpose: Focus the delivery on palette boundaries, reference layout/diagram/comic-brief extraction, interface structure, interaction behavior, visual constraints, and critique/audit loops.

## Classifier Signals

Select this lens when the demand primarily asks for UI structure, component choice, interaction feedback, palette selection, reference layout extraction, architecture/system diagram explanation, comic explainer images, visual-metaphor illustrations, review/audit optimization, or visual-system compliance.

## Looks At

- Component pattern and information hierarchy
- Palette boundary and color-system consistency
- Reference layout extraction from user-provided examples
- Diagram brief structure for architecture, system, or flow explanations
- Comic explainer fit, core message, visual metaphor, and acceptance checks
- Interaction states and feedback timing
- Visual system constraints already declared by the project
- Critique/audit feedback loops after a draft interface exists
- Accessibility and user-facing clarity

## Does Not Look At

- Backend implementation choices
- Database or API ownership decisions
- Product roadmap prioritization
- Free-form art direction that conflicts with the active design system

## Default Output

```text
domain_lens: design · tools=[selected full design tool IDs, max 5, prefer 3]
```

The output should select the smallest useful subset from the recipes below and name the palette boundary, reusable layout/diagram/comic reference, component pattern, interaction states, visual constraints, or critique/audit loop only when the demand actually needs them.

## Tool Selection Recipes

- Color or theme first: `design/palette-boundary`
- Screenshot, reference image, architecture diagram, system map, flow, topology brief, comic, cartoon, or visual metaphor: `design/layout-reference`
- New page or component shape: `design/component-pattern`
- Clickable, async, or editable UI: `design/interaction-state`
- Styling classes, responsive behavior, or overflow risk: `design/visual-constraint`
- Draft already exists and needs refinement: `design/critique-audit-loop`

## Boundary Rule

The design lens cannot invent a new style system, override project design rules, or use visual polish as a substitute for acceptance criteria and validation.
