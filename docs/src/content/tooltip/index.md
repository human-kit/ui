---
title: Tooltip
description: A short description of a control that appears on hover or on keyboard focus, in a panel that a screen reader reads after the name of the control.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Toolbar from './demos/toolbar.svelte';
	import toolbarSource from './demos/toolbar.svelte?highlight';
	import api from './api.json';
</script>

# Tooltip

`Tooltip` shows a short description of a control. It opens when the pointer rests on the control, or when the keyboard puts the focus on it. It holds text and nothing else: no link, no button, no field. A screen reader reads the text after the name of the control.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`Tooltip.Root` holds the open state and the delays. `Tooltip.Trigger` is the button that the tooltip describes. `Tooltip.Content` is the panel, in a portal, positioned against the trigger. `Tooltip.Arrow` in the content points at the trigger.

`Tooltip.Provider` around a group of tooltips gives them the same delays.

```svelte
<script>
	import { Tooltip } from '@human-kit/ui';
</script>

<Tooltip.Root>
	<Tooltip.Trigger aria-label="Bold">B</Tooltip.Trigger>
	<Tooltip.Content>
		Bold
		<Tooltip.Arrow />
	</Tooltip.Content>
</Tooltip.Root>
```

## When to use it

A tooltip is for a description the user can do without. Examples: the name of an icon button, a keyboard shortcut, the full text of a cut label. It is not for a message the user must read. A touch screen has no hover, and a screen reader reads it only as a description. Put an important message in the page, or in a `Popover`.

The trigger must have a name of its own, in its text or in `aria-label`. The tooltip is the description, not the name.

## Open and close

The tooltip opens when the pointer rests on the trigger for `delay` milliseconds. A keyboard focus opens it at once. A focus that a script gives does not open it, and a touch does not open it: a finger lands and presses.

It closes when the pointer leaves the trigger and the content, when the focus leaves, on `Escape`, and on a press on the trigger. A press does something, and the tooltip gets out of the way.

The pointer can move from the trigger to the content: `closeDelay` is the time it gets to cross. The content then keeps the tooltip open while the pointer rests on it. Thus the user can read a long text to the end, and select it.

## A group of tooltips

One tooltip at most is open. When a second one opens, the first one closes.

The first tooltip of a row waits `delay`; the next ones open at once while the user moves along the row. That window after a close is `skipDelay`. Put a `Tooltip.Provider` around a toolbar to give the same delays to each tooltip in it.

<Demo source={toolbarSource}><Toolbar /></Demo>

## Any trigger

`Tooltip.Trigger` renders a button. For another element, give the element to `triggerRef` on the root. The root then listens to that element, and it writes `aria-describedby` and `data-state` on it.

## Styles

`Tooltip.Content` is `position: fixed` in a portal, above the topmost dialog. It shows `data-state`, `data-placement`, `data-entering` and `data-exiting`. Animate the enter and the exit with a CSS transition on `data-entering` and `data-exiting`: the panel stays in the DOM until the exit transition ends.

`Tooltip.Arrow` is `position: absolute`. The panel moves it along the edge that faces the trigger, and it writes the side in `data-placement`. Give the arrow a size and a shape, and put it at the edge with CSS. For `data-placement="top"` the arrow sits at the bottom edge of the panel.

## Keyboard

- `Tab` to the trigger opens the tooltip. `Tab` away closes it.
- `Escape` closes it. That `Escape` closes nothing else.

## Accessibility

- `Tooltip.Content` has `role="tooltip"`, and the trigger points at it with `aria-describedby` while the content is in the DOM. A screen reader reads the description after the name of the trigger.
- The tooltip takes no focus, and a screen reader does not enter it. Put only text in it.
- A keyboard focus opens it at once, without the delay of the pointer. A focus that a script gives, for example after a menu closes, opens it only when the user got there with the keyboard.
- The content stays open while the pointer rests on it, and `Escape` closes it without a move of the pointer.
- The tooltip does not open on a touch. Give the control a visible name when a touch user needs it.

## API reference

<ApiReference api={api} />
