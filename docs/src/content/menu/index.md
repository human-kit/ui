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

This is an accessible menu of actions that opens against a trigger. It obeys the WAI-ARIA menu button pattern: the panel has `role="menu"` and its children have `role="menuitem"`. The arrow keys and the typeahead move the focus, and a menu can contain a submenu.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`Menu.Root` shares the open state and the reference to the trigger. `Menu.Content` makes the `role="menu"` panel in a portal, at a position against the trigger. The default placement is `bottom-start`. Each item accepts an `onAction` function, and you can disable an item.

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

Put the items that go together in a `Menu.Group` with a `Menu.GroupLabel`. The group has `role="group"`, and the label gives it its name. Use `Menu.Separator` to divide the sections.

<Demo source={groupsSource}><Groups /></Demo>

## Submenus

Put a `Menu.SubmenuRoot` in the menu. It contains a `Menu.SubmenuTrigger` and its own `Menu.Content`. The default placement is `right-start`. A submenu uses a safe triangle for the pointer: while the pointer moves at an angle to the open submenu, the items that the pointer goes over do not close it.

<Demo source={submenuSource}><Submenu /></Demo>

## Context menu

Use `Menu.ContextTrigger` in place of `Menu.Trigger` to open the menu from a surface, not from a button. All of the parts below the trigger stay the same: the items, the groups, the submenus, and the keyboard operation.

<Demo source={contextSource}><Context /></Demo>

`Menu.ContextTrigger` makes a plain element, not a button. Thus it can contain any content. It opens in three ways, and the position of the panel is different in each way:

- **A right click** — at the pointer, against it. For a context menu, `Menu.Content` makes its default `offset` `0`, and the panel opens down and to the right, like a native menu. A second right click moves the open menu to the new position. It does not close the menu and open it again.
- **A long press** with a finger or a pen — at the finger. This is how the menu opens on a telephone, where the `contextmenu` event is not dependable. The surface sets `-webkit-touch-callout: none; user-select: none` in its style attribute. Thus iOS shows the menu and not the text callout. To stop this, set `preventTouchCallout={false}`. To stop the long press, set `longPress={false}`.
- **The `Shift+F10` keys or the `ContextMenu` key** — against the surface, with the focus on the first item. There is no pointer. If the menu opened at the last position of the pointer, the panel would go to a position that the keyboard user did not select.

A left press at any position, and also on the surface, closes the menu. This is the behavior of a native menu.

In a list where each row has the same menu, give each row its own `Menu.Root`. The state belongs to the root. Thus the menu belongs to the row that the user clicked.

## Usage guidelines

- Use `Menu.Root` to share the open state and the reference to the trigger. Put `Menu.Trigger` and `Menu.Content` in it.
- Use `Menu.Item` for an action. Give it an `onAction` function. You can also give it `disabled`, `closeOnSelect`, or `textValue` for the typeahead.
- The `closeOnSelect` prop controls the menu after the user activates an item. Set it on `Menu.Root`, or on one `Menu.Item`. The default is `true`, and the menu closes.
- The `loop` prop moves the focus from the last item to the first item. The default is `true`. The `typeahead` prop moves the focus to an item by the text that the user types. The default is `true`.
- Put the items that go together in a `Menu.Group` with a `Menu.GroupLabel`. Use `Menu.Separator` to divide the sections.
- The `onOpenChange(open, details)` function reports the cause of the change in `details.reason`. Call `details.cancel()` to stop the change.

## Accessibility

- `Menu.Trigger` is a button with `aria-haspopup="menu"` and `aria-expanded`. The `ArrowDown` key, the `Enter` key, and the `Space` key open the menu and move the focus to the first item. The `ArrowUp` key opens the menu and moves the focus to the last item.
- `Menu.Content` has `role="menu"`, and each item has `role="menuitem"`. The arrow keys move the focus. The typeahead moves the focus to an item by the text that the user types.
- The `Escape` key closes the top menu and moves the focus back to its trigger. The `Tab` key and an interaction outside the menu close all of the menus.
- In a submenu, the `ArrowLeft` key closes that submenu only. On a submenu trigger, the `ArrowRight` key opens the submenu.
- By default, `Menu.ContextTrigger` is a tab stop (`tabindex={0}`). Thus a keyboard user can go to it and push `Shift+F10`. Set `tabindex={-1}` when the trigger is in a component that already controls the focus with a roving tabindex, for example a table or a tree.
- The surface has `aria-keyshortcuts="Shift+F10"` and no more. The `aria-haspopup` and `aria-expanded` properties are not global ARIA properties, thus they are not valid on a generic element. This is a true limit. **A context menu must never be the only route to an action.** Give the same `Menu.Root` a `Menu.Trigger` that the user sees, or put the same actions in a different part of the page.

## API reference

<ApiReference api={api} />
