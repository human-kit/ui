---
title: Accessibility
description: How @human-kit/ui builds accessibility into every primitive — ARIA patterns, keyboard support, and focus management by default.
---

# Accessibility

Accessibility is not a feature you opt into here — it's the reason these primitives exist. Every component implements an established interaction pattern so you don't have to wire up ARIA, keyboard handling, and focus management yourself.

## WAI-ARIA patterns

Components follow the [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) for their role: menus use the menu button pattern, tabs use the tabs pattern, listboxes and comboboxes follow the combobox pattern, and so on. Roles, states, and relationships (`aria-expanded`, `aria-selected`, `aria-controls`, `aria-labelledby`, …) are wired for you and kept in sync with the component's state.

## Keyboard support

Full keyboard operation is built in:

- **Roving focus** for composite widgets (tabs, toggle groups, menus, trees, grids) — arrow keys move between items, `Home`/`End` jump to the ends.
- **Typeahead** in list-style components, so typing focuses the matching option.
- **Activation semantics** that match the platform: `Enter`/`Space` where expected, `Escape` to dismiss overlays, `Tab` to move on.
- **Directional open/close** for nested structures like submenus (`ArrowRight`/`ArrowLeft`).

## Focus management

- Overlays (dialog, popover, menu) manage focus on open and **return focus to the trigger** on close.
- A layer stack ensures only the topmost overlay responds to `Escape` and outside interaction, so nested overlays close in the right order.
- Focus is **modality-aware**: components expose `data-focus-visible` so you can show focus rings for keyboard users without lighting them up on mouse clicks.

## SSR-safe by default

Default selection, expansion, and open states are resolved on the server, so the first paint is correct and there's no flash or focus jump during hydration.

## Verify it yourself

Every component ships with tests that exercise its accessibility contract in a real browser. Each component page also documents the exact roles and data attributes it emits, so you can audit the output against your own requirements.
