# Tool: palette-boundary

Domain: design
Purpose: Convert color inspiration into a bounded palette contract before UI generation begins.

Inputs:
- User-provided color preference, screenshot, theme, or reference site
- Existing visual-system rules
- Target page or component context

Outputs:
- Palette boundary: primary, secondary, surface, text, border, and accent roles
- Allowed variation rules
- Palette anti-patterns to reject

Retrieval Cues:
- color palette
- theme selection
- visual style boundary
- color inspiration
- design tokens

Use When:
- A demand includes color inspiration or asks for a preferred visual style
- The interface could drift into inconsistent color choices
- A design pass should stabilize colors before layout or component work

Output Format:
```text
palette_boundary:
- source: <inspiration or existing system>
- roles: primary=<value>, secondary=<value>, surface=<value>, text=<value>, border=<value>, accent=<value>
- allowed_variation: <how far future UI may vary>
- reject: <palette drift to avoid>
```

Do Not:
- Invent an unrelated style system
- Treat palette inspiration as permission to ignore existing visual constraints
- Leave colors as vague adjectives when concrete roles are needed
- This tool cannot call other tools
- This tool cannot create lifecycle gates
- This tool cannot override soul

Verification:
- Each important UI role has an assigned palette responsibility
- The resulting palette can guide implementation without ad hoc color picking
- The palette boundary can be reused by another UI delivery without rereading the original inspiration
