---
title: Menu
description: An accessible dropdown / action menu with arrow-key navigation, typeahead, groups, separators, and submenus.
---

<script>
	import { Demo, ApiReference } from '@human-kit/humandocs/components';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Groups from './demos/groups.svelte';
	import groupsSource from './demos/groups.svelte?highlight';
	import Submenu from './demos/submenu.svelte';
	import submenuSource from './demos/submenu.svelte?highlight';
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

## API reference

<ApiReference api={api} />
