# Skill: Component Base README Standard

## Intent

Ensure each component root README provides a consistent public overview for users.

## Applies to

Base component README files under `packages/svelte/src/lib/<component>/README.md` (for example `calendar`, `combobox`, `popover`, `clock`, `timepicker`, `datepicker`).

## Required sections

Use this structure (in order):

1. `# <Component>`
2. `## Description`
3. `## Anatomy`
4. `## Usage guidelines` (or `## Usage Guidelines`)
5. Optional sections as needed:
   - `## API reference`
   - `## Accessibility`
   - `## onOpenChange details`
   - `## Notes`
   - `## Internal Notes`

## Anatomy requirements

- List exported composable parts from `index.parts.ts`.
- Include at least one minimal composition snippet.
- Ensure names match exact public API (`Component.Part`).

## Content quality rules

- Keep examples aligned with current API and prop names.
- Document controlled vs uncontrolled behavior where relevant.
- Document root-controlled/forbidden forwarded props where relevant.
- Mention accessibility/keyboard behavior for interactive components.
- Avoid internal implementation detail unless it materially affects usage.

## Relationship with part READMEs

- Base README covers high-level composition and behavior.
- Per-part README files cover part-level API details.
- Keep terminology and part names consistent across both.

## Delivery checklist

- [ ] Base README exists for the component.
- [ ] Anatomy matches current `index.parts.ts` exports.
- [ ] Examples are valid for current API.
- [ ] Cross-links/wording are consistent with per-part READMEs.
- [ ] Accessibility and key behavioral constraints are documented where applicable.
