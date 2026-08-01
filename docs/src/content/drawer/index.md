---
title: Drawer
description: A panel anchored to an edge of the viewport, dismissed by swiping it away, with snap points, stacking and software-keyboard handling.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Sides from './demos/sides.svelte';
	import sidesSource from './demos/sides.svelte?highlight';
	import SnapPoints from './demos/snap-points.svelte';
	import snapPointsSource from './demos/snap-points.svelte?highlight';
	import Nested from './demos/nested.svelte';
	import nestedSource from './demos/nested.svelte?highlight';
	import SwipeToOpen from './demos/swipe-to-open.svelte';
	import swipeToOpenSource from './demos/swipe-to-open.svelte?highlight';
	import Form from './demos/form.svelte';
	import formSource from './demos/form.svelte?highlight';
	import NonModal from './demos/non-modal.svelte';
	import nonModalSource from './demos/non-modal.svelte?highlight';
	import api from './api.json';
</script>

# Drawer

A panel anchored to an edge of the viewport. It behaves like a modal dialog — focus trap, scroll lock, Escape, outside press — and adds what a sheet needs on a phone: a drag that follows the finger, snap points, stacking, and awareness of the software keyboard.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

All parts live inside `Drawer.Root`. The backdrop and the panel render inside `Drawer.Portal`.

```svelte
<script>
	import { Drawer } from '@human-kit/ui';
</script>

<Drawer.Root side="bottom">
	<Drawer.Trigger>Open</Drawer.Trigger>
	<Drawer.Portal>
		<Drawer.Overlay />
		<Drawer.Content>
			<Drawer.Title>Title</Drawer.Title>
			<Drawer.Description>Supporting text.</Drawer.Description>
			<Drawer.Body>...</Drawer.Body>
			<Drawer.Close>Close</Drawer.Close>
		</Drawer.Content>
	</Drawer.Portal>
</Drawer.Root>
```

`Drawer.Viewport` is an optional positioning layer between the portal and the panel. Without it the panel pins itself to its edge, which is what the examples here rely on; add one when you need to align the panel on the cross axis.

## Styling the movement

The drawer never writes a transform of its own. It publishes the numbers and your CSS decides what to do with them, the same way every other component in this library leaves appearance to the page.

| Property                             | Meaning                                                                     |
| ------------------------------------ | --------------------------------------------------------------------------- |
| `--drawer-swipe-movement-x` / `-y`   | Signed drag distance in px. Apply it directly in a translation.              |
| `--drawer-swipe-progress`            | `0`–`1` toward **dismissal**. Also published on `Drawer.Overlay`.            |
| `--drawer-swipe-strength`            | `1` for a still release down to `0.1` for a hard flick.                      |
| `--drawer-overdrag`                  | Resisted pull past fully open, in px. Zero the rest of the time.             |
| `--drawer-snap-point-offset`         | Translation of the current snap point, in px.                                |
| `--drawer-width` / `--drawer-height` | The panel's measured size.                                                   |
| `--drawer-frontmost-height`          | Extent of the drawer on top of the stack.                                    |
| `--nested-drawers`                   | Distance from the front of the stack; `0` is frontmost.                      |
| `--drawer-keyboard-inset`            | Height covered by the software keyboard, and only set while it is up.        |

The resting position is the snap point plus the live drag. Keeping the closed offset in a third variable lets one rule cover open, closed and dragging:

```svelte
<Drawer.Content
	class="transition-[translate] duration-300
	       data-[state=closed]:[--drawer-closed:100%]
	       data-[starting-style]:[--drawer-closed:100%]
	       data-[swiping]:transition-none"
	style="translate: 0 calc(var(--drawer-snap-point-offset) + var(--drawer-swipe-movement-y) + var(--drawer-closed, 0px));"
/>
```

`data-starting-style` is on the panel for the first painted frame after it mounts, and only then. A transition needs a value to start from, and a node inserted straight into its final position has none — without this rule the drawer has an exit animation and no entrance. Give it the same value as the closed state.

Dropping the transition under `data-swiping` is what makes the panel track the finger instead of lagging a frame behind it.

### Progress means dismissal, not movement

`--drawer-swipe-progress` stays at `0` while the panel moves between snap points and only rises once it is past the last one and genuinely on its way out. Fading the backdrop for every drag looked wrong in exactly the case it was meant to help: dragging a sheet from one snap point to another brightened the page and then snapped it dark again on release, for a drawer that never left.

### What can start a drag

The whole panel is draggable, with two exceptions:

- **`Drawer.Body`, under a mouse.** A drag and a text selection are the same gesture on a pointer that can select, so inside the content region the mouse selects and the drawer stays put — it does not budge and spring back, it simply ignores the drag. A finger still drags it: there is no drag-to-select on touch, and losing the gesture over most of a sheet is exactly what you do not want on a phone.

  Wrap your content in `Drawer.Body` and leave the grab bar outside it. That leaves an obvious surface a mouse can still drag the panel by, and matches what the affordance is promising.
- **Anything marked `data-hk-swipe-ignore`.** Put it on a slider, a carousel, a colour picker — any control with a drag of its own. Valueless opts the subtree out for every input type; `data-hk-swipe-ignore="mouse"` opts it out for a mouse only, which is what `Drawer.Body` uses.

A drag that starts inside a scrollable region is left to that region until it reaches its bound, so a bottom sheet with a scrolling body only starts moving once the body is scrolled to the top.

### Pulling past open

Dragging a drawer further open than it can go stretches it: the panel follows with heavy resistance, capped at 40px no matter how far the finger travels. The resisted distance is also published as `--drawer-overdrag`, in px.

Moving the panel off its anchored edge would normally show the page through the strip behind it, so the drawer paints that strip in its own background while the pull is in flight. You get this for free — nothing to wire up — but it does assume the panel has a background of its own to borrow.

## Sides

`side` sets the edge the panel is anchored to and, with it, the axis it travels along and the direction that dismisses it.

<Demo source={sidesSource}><Sides /></Demo>

## Snap points

`snapPoints` gives the panel resting positions between open and closed. Values from `0` to `1` are fractions of the viewport, numbers above `1` are pixels, and strings are any CSS length or percentage.

A release settles on the point the flick was *heading for*, not the one it happened to be nearest when the finger lifted — a short fast drag means "go further". `snapToSequentialPoints` holds it to one step at a time when skipping ahead would be disorienting.

<Demo source={snapPointsSource}><SnapPoints /></Demo>

Size the panel to the largest snap point; the smaller ones translate it down from there.

## Nested drawers

Nest a `Drawer.Root` inside another drawer's content. The drawer behind gets `data-nested-drawer-open` and `--nested-drawers` so it can step back, and Escape unwinds the stack one layer at a time.

<Demo source={nestedSource}><Nested /></Demo>

Only the drawer at the back of the stack paints a backdrop; the ones above it get `data-nested` on their overlay and stand down. Every root brings its own, and stacking them dimmed the page once per layer — darkening the drawer underneath along with everything else.

`Drawer.Indent` wraps your app UI and exposes `--drawer-indent-progress`, which falls back toward `0` as the frontmost drawer is dragged away — so the page comes forward with the gesture rather than jumping when the drawer finally closes. `Drawer.IndentBackground` paints the surface revealed behind it.

## Non-modal

`modal={false}` drops the focus trap, the scroll lock and the hiding of everything else from assistive technology. The page behind keeps working — scroll it, click it, tab through it — while the panel stays up. For a persistent player, a filter rail, an inspector.

<Demo source={nonModalSource}><NonModal /></Demo>

Skip `Drawer.Overlay` entirely for these: a scrim says "deal with me first", which is the opposite of what a non-modal panel is for. Pair it with `shouldCloseOnInteractOutside={false}` so using the page does not dismiss the thing you opened to use alongside it.

`modal="trap-focus"` sits in between: the keyboard stays captured, but the page keeps scrolling and stays readable to assistive technology.

## Swipe to open

`Drawer.SwipeArea` is a strip along the viewport edge that opens the drawer when dragged inward, with the panel following the finger. Render it outside `Drawer.Portal` — it has to exist while the drawer is closed.

<Demo source={swipeToOpenSource}><SwipeToOpen /></Demo>

Pair it with a `Drawer.Trigger`. A swipe has no keyboard or screen-reader equivalent, so a drawer that can only be swiped open is unreachable for some people.

## Forms and the software keyboard

Wrap `Drawer.Root` in `Drawer.VirtualKeyboardProvider` when the panel contains fields. The keyboard shrinks the *visual* viewport and leaves the layout viewport untouched, so nothing in CSS notices it and a bottom sheet ends up underneath the keys.

<Demo source={formSource}><Form /></Demo>

Keep the header and footer outside `Drawer.Body` and offset the footer by `var(--drawer-keyboard-inset, 0px)`. The fallback matters: the variable only exists while the keyboard is up.

## Detached triggers

When the openers are scattered — a row action in every line of a table, each opening the same drawer with a different record — `createDrawerHandle()` is the shared object in between. Triggers push into it, one root reads from it, and the value the trigger carried arrives as the root's `payload`.

```svelte
<script>
	import { Drawer, createDrawerHandle } from '@human-kit/ui';

	const profile = createDrawerHandle();
</script>

{#each users as user}
	<Drawer.Trigger handle={profile} payload={user}>{user.name}</Drawer.Trigger>
{/each}

<Drawer.Root handle={profile}>
	{#snippet children({ payload })}...{/snippet}
</Drawer.Root>
```

Closing returns focus to the trigger that actually opened the drawer, not to whichever one mounted last.

## Controlled state

Bind `open` to drive the drawer from outside; a trigger is optional. `defaultOpen` covers the uncontrolled case, and `onOpenChange` reports every change. Set `controlledOpen` to stop the component writing back, so the parent can reject a change by not flowing the new value down. `snapPoint` follows the same shape.

## Usage guidelines

- Always give the drawer a `Drawer.Title`. A `role="dialog"` takes its name from `aria-labelledby`, not from the text inside it.
- Always give a dismissible drawer a `Drawer.Close`, so it can be dismissed without a gesture.
- Wrap the scrolling region in `Drawer.Body` so a scroll that reaches its end does not chain out to the page behind.
- `modal="trap-focus"` keeps the focus trap but leaves the page scrollable; `modal={false}` drops both, for a panel the rest of the page keeps working around.
- Set `dismissible={false}` for a drawer that must be closed deliberately. The panel still moves under the finger — a dead gesture reads as a broken one — it just springs back.

## Accessibility

- `Drawer.Content` renders `role="dialog"`, with `aria-modal="true"` while open and `modal` is `true`.
- `Drawer.Title` and `Drawer.Description` wire `aria-labelledby` / `aria-describedby` automatically.
- Focus is trapped inside the open drawer, and content outside it is hidden from assistive technology.
- Escape closes the topmost dismissable layer, so a popover opened inside the drawer closes first, and the drawer on the next press.
- Page scroll is locked while a modal drawer is open, using the body pin that also stops iOS Safari touch scrolling.
- Under `prefers-reduced-motion` the enter and exit collapse to a single frame, because presence is measured from your CSS rather than a fixed duration.

## API reference

<ApiReference api={api} />
