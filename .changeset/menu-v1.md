---
'@human-kit/ui': minor
---

Add `Menu`, an accessible dropdown / action menu following the WAI-ARIA menu button pattern.

- Compose `Menu.Root`, `Menu.Trigger`, and `Menu.Content` (portal + floating + `role="menu"` panel), built on the same positioning/presence primitives as `Popover`.
- `Menu.Item` with `onSelect`, `disabled`, `closeOnSelect`, and `textValue`; arrow-key navigation, typeahead, Home/End, and hover highlighting via roving focus.
- `Menu.Separator`, plus `Menu.Group` + `Menu.GroupLabel` with `aria-labelledby` wiring.
- `Menu.SubmenuRoot` + `Menu.SubmenuTrigger` for nested submenus, with a layer stack so only the topmost menu handles Escape / outside-press, `ArrowRight`/`ArrowLeft` open/close, and sibling submenus collapse on hover.
- `Menu.Root` exposes `open`/`defaultOpen`/`onOpenChange` (with cancelable `details`), `loop`, `typeahead`, and `closeOnSelect`. Escape and selection return focus to the trigger; Tab and outside interaction close the whole chain.
