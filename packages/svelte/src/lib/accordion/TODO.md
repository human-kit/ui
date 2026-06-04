# Accordion TODO

## Accessibility and Logic Audit

- [x] Render each trigger inside a heading element (`Accordion.Header`).
- [x] Wire `aria-expanded` / `aria-controls` / `aria-labelledby` between trigger and panel.
- [x] Support single and multiple expansion via `selectionMode`.
- [x] Keep `number` and `string` item values distinct.
- [x] Roving focus across triggers with arrow keys, Home/End, and optional `loop`.
- [x] Respect `disallowEmptySelection` in single and multiple modes.
- [x] Avoid uncontrolled fallback side effects in controlled mode.
- [x] Render default open panels during SSR before hydration.
- [x] Keep collapsed panels mounted with `forceMount` when needed.
- [ ] Optional: expose measured panel height as a CSS variable for height transitions.
