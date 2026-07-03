# Accordion TODO

## Accessibility and Logic Audit

- [x] [M][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Render each trigger inside a heading element (`Accordion.Header`).
- [x] [M][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Wire `aria-expanded` / `aria-controls` / `aria-labelledby` between trigger and panel.
- [x] [M][P0][Area: State][Owner: Unassigned][Target: Done] Support single and multiple expansion via `selectionMode`.
- [x] [M][P0][Area: State][Owner: Unassigned][Target: Done] Keep `number` and `string` item values distinct.
- [x] [M][P0][Area: Interaction][Owner: Unassigned][Target: Done] Roving focus across triggers with arrow keys, Home/End, and optional `loop`.
- [x] [M][P0][Area: State][Owner: Unassigned][Target: Done] Respect `disallowEmptySelection` in single and multiple modes.
- [x] [M][P0][Area: State][Owner: Unassigned][Target: Done] Avoid uncontrolled fallback side effects in controlled mode.
- [x] [M][P0][Area: SSR][Owner: Unassigned][Target: Done] Render default open panels during SSR before hydration.
- [x] [M][P0][Area: API][Owner: Unassigned][Target: Done] Keep collapsed panels mounted with `forceMount` when needed.
- [ ] [C][P2][Area: Animation][Owner: Unassigned][Target: TBD] Expose measured panel height as a CSS variable for height transitions.
