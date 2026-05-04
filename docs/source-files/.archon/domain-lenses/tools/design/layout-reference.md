# Tool: layout-reference

Domain: design
Purpose: Extract reusable layout, diagram, or comic explainer structure from reference images or examples, and from architecture/system explanations, without copying unsupported assumptions.

Inputs:
- Reference image, screenshot, or external layout example
- Target user task and content hierarchy
- Existing page or component constraints
- Architecture, workflow, system, topology, or abstract concept when a visual explanation is requested
- Target document, audience, and adjacent prose when a comic explainer is requested

Outputs:
- Reusable layout skeleton
- Content hierarchy and section order
- Adaptation notes for the target interface
- Diagram type, node groups, edges, emphasis, and omissions when the output is a visual explanation
- Comic explainer fit, core message, metaphor, composition, and acceptance checks when the output is a friendly visual metaphor

Retrieval Cues:
- reference image
- screenshot layout
- layout inspiration
- visual reference
- page scaffold
- architecture diagram
- system map
- flow diagram
- topology
- visual explanation
- comic explainer
- 漫画图解
- 卡通图解
- visual metaphor
- explanatory image

Use When:
- A demand provides a screenshot or asks to use a visual reference
- A demand asks for an architecture diagram, system map, flow diagram, topology brief, comic explainer, or visual-metaphor image
- The page structure is unclear but a comparable layout exists
- The design needs a repeatable scaffold or image brief before implementation or visual generation

Output Format:
```text
layout_reference:
- source_shape: <what the reference structurally shows>
- skeleton: <sections in order>
- hierarchy: <primary, secondary, supporting content>
- diagram_brief: <type, nodes, edges, reading direction, emphasis, omissions when applicable>
- comic_explainer_brief: <fit, core message, metaphor, composition, labels, must-show, must-avoid, load asset, acceptance checks when applicable>
- adapt: <changes required for the target interface>
- reject: <what must not be copied>
```

Do Not:
- Copy proprietary branding, exact content, or unrelated product semantics
- Treat a reference image as a requirement without adapting it to the current demand
- Preserve visual decoration that conflicts with the active design system
- Put provider-specific model names, API calls, proxy settings, pricing, credentials, or script commands in this universal card
- Generate images before the core message and metaphor are explicit
- This tool cannot call other tools
- This tool cannot create lifecycle gates
- This tool cannot override soul

Verification:
- The extracted layout maps to the target content and user task
- The reference is used as structure, not as unexamined imitation
- The output remains useful after the original reference image or explanation is no longer in context
- Diagram nodes and edges each have a reason to appear
- Comic briefs have one core message, one metaphor, one composition, and checks for semantic accuracy, style consistency, and documentation link/update proof
- Provider-specific execution stays in the selected skill, not in the tool card
