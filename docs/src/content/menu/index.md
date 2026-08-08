---
title: Menu
description: An accessible dropdown / action menu with arrow-key navigation, typeahead, groups, separators, submenus, and a context-menu trigger.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Groups from './demos/groups.svelte';
	import groupsSource from './demos/groups.svelte?highlight';
	import Submenu from './demos/submenu.svelte';
	import submenuSource from './demos/submenu.svelte?highlight';
	import Context from './demos/context.svelte';
	import contextSource from './demos/context.svelte?highlight';
	import api from './api.json';
</script>

# Menu

An accessible dropdown / action menu anchored to a trigger. It follows the WAI-ARIA menu button pattern: `role="menu"` content with `role="menuitem"` children, arrow-key navigation, typeahead, and submenu support.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`Menu.Root` shares open state and the trigger reference. `Menu.Content` renders the `role="menu"` panel in a portal, positioned against the trigger (default placement `bottom-start`). Items take an `onAction` handler and can be disabled.

```svelte
<script>
	import { Menu } from '@human-kit/ui';
</script>

<Menu.Root>
	<Menu.Trigger>Options</Menu.Trigger>
	<Menu.Content>
		<Menu.Item onAction={edit}>Edit</Menu.Item>
		<Menu.Item disabled>Duplicate</Menu.Item>
		<Menu.Separator />
		<Menu.Group>
			<Menu.GroupLabel>Share</Menu.GroupLabel>
			<Menu.Item onAction={copyLink}>Copy link</Menu.Item>
		</Menu.Group>
	</Menu.Content>
</Menu.Root>
```

## Groups and separators

Group related items with `Menu.Group` + `Menu.GroupLabel` — the group renders `role="group"` labelled by its label — and divide sections with `Menu.Separator`.

<Demo source={groupsSource}><Groups /></Demo>

## Submenus

Nest a `Menu.SubmenuRoot` containing a `Menu.SubmenuTrigger` and its own `Menu.Content` (default placement `right-start`). Submenus use a "safe triangle" pointer intent: while the pointer moves diagonally toward an open submenu, hovering the sibling items it passes over does not close it.

<Demo source={submenuSource}><Submenu /></Demo>

## Context menu

Swap `Menu.Trigger` for `Menu.ContextTrigger` to open the menu from a surface instead of a button. Everything below the trigger — items, groups, submenus, keyboard navigation — is unchanged.

<Demo source={contextSource}><Context /></Demo>

`Menu.ContextTrigger` renders a plain element, not a button, so it can wrap arbitrary content. It opens three ways, and each anchors the panel differently:

- **Right click** — at the pointer, flush against it: `Menu.Content` drops its default `offset` to `0` for a context menu, and unfolds down and to the right like a native one. Right clicking again re-anchors the open menu instead of closing and reopening it.
- **Long press** on touch or pen — at the finger. This is what makes the menu reachable on a phone, where `contextmenu` is unreliable. The surface sets `-webkit-touch-callout: none; user-select: none` inline so iOS raises the menu rather than the text callout; opt out with `preventTouchCallout={false}`, or turn the gesture off entirely with `longPress={false}`.
- **`Shift+F10` or the `ContextMenu` key** — anchored to the surface itself, with the first item focused. There is no pointer, so reusing the last cursor position would put the panel somewhere the keyboard user never pointed at.

A left press anywhere — including on the surface itself — dismisses it, like a native menu.

For a list where every row has the same menu, give each row its own `Menu.Root`: state is per-root, so the row that was right-clicked is the one the menu belongs to.

## Usage guidelines

- Use `Menu.Root` to share open state and the trigger reference, and place `Menu.Trigger` and `Menu.Content` inside it.
- Use `Menu.Item` for actions. Provide `onAction`, and optionally `disabled`, `closeOnSelect`, or `textValue` (for typeahead).
- `closeOnSelect` (on `Menu.Root`, overridable per `Menu.Item`) controls whether activating an item closes the menu. Default `true`.
- `loop` (default `true`) wraps arrow navigation; `typeahead` (default `true`) focuses items by typed text.
- Group related items with `Menu.Group` + `Menu.GroupLabel`, and divide sections with `Menu.Separator`.
- `onOpenChange(open, details)` reports why the state changed (`details.reason`) and supports `details.cancel()` to prevent the transition.

## Accessibility

- `Menu.Trigger` renders a button with `aria-haspopup="menu"` and `aria-expanded`; `ArrowDown`/`Enter`/`Space` open the menu and focus the first item, `ArrowUp` opens and focuses the last item.
- `Menu.Content` renders `role="menu"` and items render `role="menuitem"`; arrow keys move the highlight, and typeahead focuses items by typed text.
- Escape closes the current (topmost) menu and returns focus to its trigger; `Tab` and outside interaction close the whole menu chain.
- Within a submenu, `ArrowLeft` closes just that level; `ArrowRight` on a submenu trigger opens it.
- `Menu.ContextTrigger` is a tab stop by default (`tabindex={0}`) so a keyboard user can reach it and press `Shift+F10`; pass `tabindex={-1}` when it sits inside a composite that already manages focus with a roving tabindex, such as a table or a tree.
- The surface carries `aria-keyshortcuts="Shift+F10"` and nothing else: `aria-haspopup` and `aria-expanded` are not global ARIA properties, so on a generic element they would be invalid. That is a real limit — **a context menu must never be the only route to an action.** Give the same `Menu.Root` a visible `Menu.Trigger`, or expose the same actions elsewhere.

## API reference

<ApiReference api={api} />
