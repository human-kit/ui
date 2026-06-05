# Collapsible TODO

## Accessibility and Logic Audit

- [x] Wire `aria-expanded` / `aria-controls` between trigger and panel.
- [x] Support controlled (`open`/`onOpenChange`) and uncontrolled (`defaultOpen`) state.
- [x] Respect `isDisabled` on the trigger.
- [x] Keep collapsed content mounted with `forceMount` when needed.
- [x] Render the default open panel during SSR before hydration.
- [ ] Optional: expose measured panel height as a CSS variable for height transitions.
