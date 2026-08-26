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

This is content that floats against a trigger element. It has a modal mode and a non-modal mode, it obeys an interaction outside it, and you can set its position.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`Popover.Root` shares the open state and the reference to the trigger between `Popover.Trigger` and `Popover.Content`. The content goes in a portal, and it calculates its position against the trigger.

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

Use `placement` on `Popover.Content` to select the side and the alignment that you prefer. There are 12 values, for example `top`, `bottom-start`, and `right-end`. The default is `bottom`. Use `offset` to set the distance from the trigger. The default of `shouldFlip` is `true`. If there is not sufficient space, the panel moves to the opposite side. The component shows the final side in `data-placement`.

<Demo source={placementSource}><Placement /></Demo>

## Modal and non-modal

The default is the modal mode. The focus stays in the panel, the page does not scroll, and assistive technology does not read the content outside the panel. Set `nonModal` to let the user operate the rest of the page. In the non-modal mode, the popover closes when the focus goes out of it, because the default of `shouldCloseOnBlur` is `true`.

<Demo source={nonmodalSource}><NonModal /></Demo>

## Usage guidelines

- Use `Popover.Root` to share the open state and the reference to the trigger.
- Use `Popover.Trigger` as the button that opens the popover.
- Put `Popover.Content` in `Popover.Root`. As an alternative, use it alone with `open`, `triggerRef`, and `onOpenChange`.
- Set `nonModal`, `shouldCloseOnInteractOutside`, and `shouldCloseOnBlur` for the interaction model that you want.
- The `onOpenChange(open, details)` function reports the cause of the change in `details.reason`. Call `details.cancel()` to stop the change.
- Write the styles of the enter motion and the exit motion with the `data-state`, `data-entering`, and `data-exiting` attributes. During an exit animation, the panel stays in the DOM until the CSS transition or the CSS animation is complete.

## Accessibility

- `Popover.Content` has `role="dialog"`. `Popover.Trigger` is a button with `aria-haspopup="dialog"` and `aria-expanded`.
- In the modal mode, the focus stays in the panel, the body does not scroll, and assistive technology does not read the content outside the panel. Use `initialFocus` to select the first element that gets the focus.
- The `Escape` key closes the popover and moves the focus back to the trigger. An interaction outside the popover also closes it, but not with `shouldCloseOnInteractOutside={false}`.
- In the non-modal mode, the user can operate the page. The popover closes when the focus goes out of the trigger and the panel.

## API reference

<ApiReference api={api} />
