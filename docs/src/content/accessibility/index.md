---
title: Accessibility
description: How @human-kit/ui builds accessibility into every primitive — ARIA patterns, keyboard support, and focus management by default.
---

# Accessibility

Accessibility is not an option that you enable. It is the reason for this library. Each component obeys a known interaction pattern, thus you do not write the ARIA attributes, the keyboard operation, and the focus control yourself.

## WAI-ARIA patterns

Each component obeys the [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) for its role. The menu components obey the menu button pattern. The tabs components obey the tabs pattern. The listbox and the combobox components obey the combobox pattern.

The components set the roles, the states, and the relations (`aria-expanded`, `aria-selected`, `aria-controls`, `aria-labelledby`). The components keep these attributes correct when the state changes.

## Keyboard support

Each component has full keyboard operation:

- **Roving focus** in the composite components (the tabs, the toggle groups, the menus, the trees, and the grids). The arrow keys move the focus between the items. The `Home` key and the `End` key move the focus to the first item and to the last item.
- **Typeahead** in the list components. When you type a character, the focus moves to the item that agrees with it.
- **Activation keys** that agree with the platform. The `Enter` key and the `Space` key activate the item. The `Escape` key closes an overlay. The `Tab` key moves the focus out.
- **Direction keys** for the nested structures. In a submenu, the `ArrowRight` key opens and the `ArrowLeft` key closes.

## Focus management

- The overlay components (the dialog, the popover, and the menu) move the focus when they open. When they close, they **move the focus back to the trigger**.
- A layer stack makes sure that only the top overlay obeys the `Escape` key and an interaction outside it. Thus the nested overlays close in the correct sequence.
- The focus is **modality-aware**. Each component shows `data-focus-visible`, thus you can show a focus ring for a keyboard user, but not for a mouse user.

## Correct on the server

The components calculate the initial selection state, expansion state, and open state on the server. Thus the first paint is correct, and there is no flash and no focus movement during the hydration.

## How to check it

Each component has tests that examine its accessibility contract in a true browser. The page for each component also gives the exact roles and data attributes that the component writes. Thus you can compare the output with your own requirements.
