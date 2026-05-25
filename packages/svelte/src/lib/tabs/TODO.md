# Tabs TODO

## Accessibility and Logic Audit

- [x] Ensure default uncontrolled selection renders during SSR before hydration.
- [x] Keep `number` and `string` tab values distinct.
- [x] Keep `aria-controls` targets mounted even when inactive panel content is not force-mounted.
- [x] Make tab panels tabbable by default for screen reader and keyboard navigation.
- [x] Avoid uncontrolled fallback side effects in controlled mode.
- [x] Respect `event.defaultPrevented` in delegated tablist keyboard handling.
- [x] Re-measure the indicator when the tablist scrolls.
- [x] Add regression coverage for SSR, panel accessibility, value identity, and controlled disabled fallback.
