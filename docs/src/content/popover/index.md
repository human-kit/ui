---
title: Popover
description: Floating content anchored to a trigger, with modal and non-modal interaction patterns and configurable positioning.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Placement from './demos/placement.svelte';
	import placementSource from './demos/placement.svelte?highlight';
	import NonModal from './demos/nonmodal.svelte';
	import nonmodalSource from './demos/nonmodal.svelte?highlight';
	import api from './api.json';
</script>

# Popover

Floating content anchored to a trigger element. It supports modal and non-modal interaction patterns, outside interaction handling, and configurable positioning.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`Popover.Root` shares open state and the trigger reference between `Popover.Trigger` and `Popover.Content`. The content renders in a portal and positions itself against the trigger.

```svelte
<script>
	import { Popover } from '@human-kit/ui';
</script>

<Popover.Root>
	<Popover.Trigger>Open</Popover.Trigger>
	<Popover.Content>
		<div>Content</div>
	</Popover.Content>
</Popover.Root>
```

## Placement

Use `placement` on `Popover.Content` to pick the preferred side and alignment (12 options, e.g. `top`, `bottom-start`, `right-end`; default `bottom`), and `offset` to control the gap from the trigger. With `shouldFlip` (default `true`), the panel falls back to the opposite side when space runs out; the resolved side is exposed as `data-placement`.

<Demo source={placementSource}><Placement /></Demo>

## Modal and non-modal

By default the popover is modal: focus is trapped, scroll is locked, and outside content is aria-hidden. Set `nonModal` to allow interaction with the rest of the page — non-modal popovers close when focus leaves them (`shouldCloseOnBlur` defaults to `true` in that mode).

<Demo source={nonmodalSource}><NonModal /></Demo>

## Usage guidelines

- Use `Popover.Root` to share open state and trigger reference.
- Use `Popover.Trigger` as the opener button.
- Use `Popover.Content` inside `Popover.Root`, or in standalone mode with `open`, `triggerRef`, and `onOpenChange`.
- Configure `nonModal`, `shouldCloseOnInteractOutside`, and `shouldCloseOnBlur` to match your interaction model.
- `onOpenChange(open, details)` reports why the state changed (`details.reason`) and supports `details.cancel()` to prevent the transition.
- Style enter/exit motion via the `data-state` / `data-entering` / `data-exiting` attributes; exit animations keep the panel mounted until its CSS transition or animation finishes.

## Accessibility

- `Popover.Content` renders `role="dialog"`; `Popover.Trigger` renders a button with `aria-haspopup="dialog"` and `aria-expanded`.
- Modal popovers trap focus, lock body scroll, and hide outside content from assistive technology; use `initialFocus` to pick the first focused element.
- Escape closes the popover and returns focus to the trigger; outside interaction closes it unless `shouldCloseOnInteractOutside={false}`.
- Non-modal popovers keep the page interactive and close when focus moves outside the trigger and panel.

## API reference

<ApiReference api={api} />
