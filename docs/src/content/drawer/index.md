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

This is a panel at an edge of the viewport. It behaves like a modal dialog: the focus stays in the panel, the page does not scroll, and the `Escape` key and a press outside it close it. It also has what a sheet needs on a telephone: a drag that follows the finger, snap points, a stack, and knowledge of the software keyboard.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

All of the parts are in `Drawer.Root`. The backdrop and the panel are in `Drawer.Portal`.

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

`Drawer.Viewport` is an optional layer for the position, between the portal and the panel. Without it, the panel goes to its own edge, and the examples on this page use that behavior. Add a viewport when you must align the panel on the other axis.

## Styles for the movement

The drawer never writes a transform of its own. It publishes the numbers, and your CSS decides what to do with them. Each other component in this library also leaves the appearance to the page.

| Property                             | Meaning                                                                     |
| ------------------------------------ | --------------------------------------------------------------------------- |
| `--drawer-swipe-movement-x` / `-y`   | The drag distance in px, with a sign. Use it directly in a translation.      |
| `--drawer-swipe-progress`            | From `0` to `1`, toward **dismissal**. Also on `Drawer.Overlay`.             |
| `--drawer-swipe-strength`            | `1` for a release without speed, down to `0.1` for a fast flick.             |
| `--drawer-overdrag`                  | The pull past the open position, in px, with resistance. At other times, 0.  |
| `--drawer-snap-point-offset`         | The translation of the current snap point, in px.                            |
| `--drawer-width` / `--drawer-height` | The measured size of the panel.                                              |
| `--drawer-frontmost-height`          | The extent of the drawer at the front of the stack.                          |
| `--nested-drawers`                   | The distance from the front of the stack. `0` is the front.                  |
| `--drawer-keyboard-inset`            | The height that the software keyboard covers. Set only while the keyboard is up. |

The rest position is the snap point plus the live drag. Keep the closed offset in a third variable. Thus one rule covers the open state, the closed state, and the drag:

```svelte
<Drawer.Content
	class="transition-[translate] duration-300
	       data-[state=closed]:[--drawer-closed:100%]
	       data-[starting-style]:[--drawer-closed:100%]
	       data-[swiping]:transition-none"
	style="translate: 0 calc(var(--drawer-snap-point-offset) + var(--drawer-swipe-movement-y) + var(--drawer-closed, 0px));"
/>
```

The panel has `data-starting-style` for the first painted frame after it goes into the DOM, and for no other frame. A transition needs a start value, and a node that goes directly to its final position has none. Without this rule, the drawer has an exit animation but no entrance animation. Give it the same value as the closed state.

The `data-swiping` rule removes the transition. This is what makes the panel follow the finger, and not stay one frame behind it.

### Dismissal, not movement

`--drawer-swipe-progress` stays at `0` while the panel moves between the snap points. It becomes larger only when the panel goes past the last snap point and is truly on its way out. A backdrop that faded for each drag looked incorrect in the exact case that it must help: a drag from one snap point to a different snap point made the page brighter, and then made it dark again at the release, for a drawer that did not go away.

### What can start a drag

The user can drag all of the panel, with two exceptions:

- **`Drawer.Body`, with a mouse.** With a pointer that can select text, a drag and a text selection are the same gesture. Thus, in the content region, the mouse selects the text and the drawer does not move. The drawer does not move and come back — it ignores the drag. A finger still drags the panel: on a touch screen there is no drag to select text, and on a telephone the user must not lose the gesture on most of the sheet.

  Put your content in `Drawer.Body`, and keep the grab bar outside it. Thus a mouse still has an obvious surface to drag the panel by, and the drawer does what that surface promises.
- **An element with `data-hk-swipe-ignore`.** Put this attribute on a slider, a carousel, or a color picker — on any control with a drag of its own. With no value, the attribute stops the drag for each input type. With `data-hk-swipe-ignore="mouse"`, it stops the drag for a mouse only, and this is what `Drawer.Body` uses.

A drag that starts in a region that scrolls belongs to that region until the region gets to its limit. Thus a bottom sheet with a body that scrolls starts to move only when the body is at the top.

### Pull past the open position

If the user drags a drawer more open than its limit, the panel becomes longer. It follows the finger with much resistance, and it stops at 40 px, whatever the distance of the finger. The component publishes this distance in `--drawer-overdrag`, in px.

A panel that moves off its edge would usually show the page in the strip behind it. Thus, during the pull, the drawer paints that strip with its own background. You get this with no other code, but the panel must have a background of its own.

## Sides

The `side` prop sets the edge of the panel. With it, the prop also sets the axis of the movement and the direction that dismisses the panel.

<Demo source={sidesSource}><Sides /></Demo>

## Snap points

The `snapPoints` prop gives the panel rest positions between the open position and the closed position. A value from `0` to `1` is a fraction of the viewport. A number more than `1` is a number of pixels. A string is any CSS length or percentage.

At the release, the panel goes to the point that the flick moved toward, and not to the nearest point at the moment of the release. A short fast drag means "go further". The `snapToSequentialPoints` prop holds the panel to one step at a time, for the cases where a jump would confuse the user.

<Demo source={snapPointsSource}><SnapPoints /></Demo>

Make the panel as large as the largest snap point. The smaller snap points then move it down from there.

## Nested drawers

Put a `Drawer.Root` in the content of a different drawer. The drawer behind gets `data-nested-drawer-open` and `--nested-drawers`, thus it can move back. The `Escape` key removes one layer of the stack at a time.

<Demo source={nestedSource}><Nested /></Demo>

Only the drawer at the back of the stack paints a backdrop. The overlay of each drawer above it gets `data-nested` and paints nothing. Each root has its own overlay, and one backdrop for each layer made the page darker one time for each layer — and made the drawer below dark with the rest of the page.

`Drawer.Indent` contains the UI of your application, and it publishes `--drawer-indent-progress`. That number goes back toward `0` while the user drags the front drawer away. Thus the page comes forward with the gesture, and it does not move suddenly when the drawer closes. `Drawer.IndentBackground` paints the surface behind it.

## Non-modal mode

With `modal={false}`, the focus does not stay in the panel, the page scrolls, and assistive technology reads the rest of the page. The user can scroll the page behind, click it, and go through it with the `Tab` key while the panel stays open. Use this mode for a music player, a rail of filters, or an inspector.

<Demo source={nonModalSource}><NonModal /></Demo>

In this mode, do not use `Drawer.Overlay`. A backdrop says "obey me first", and this is the opposite of the function of a non-modal panel. Use `shouldCloseOnInteractOutside={false}` with it. Thus the page that the user operates does not close the panel that the user opened for that work.

`modal="trap-focus"` is between the two modes. The focus stays in the panel, but the page scrolls and assistive technology reads it.

## Swipe to open

`Drawer.SwipeArea` is a strip at the edge of the viewport. A drag from the edge to the center opens the drawer, and the panel follows the finger. Put this part outside `Drawer.Portal`, because the part must exist while the drawer is closed.

<Demo source={swipeToOpenSource}><SwipeToOpen /></Demo>

Use a `Drawer.Trigger` with it. A swipe has no keyboard equivalent and no screen reader equivalent. Thus some people cannot open a drawer that only a swipe opens.

## Forms and the software keyboard

Put `Drawer.Root` in a `Drawer.VirtualKeyboardProvider` when the panel contains fields. The keyboard makes the *visual* viewport smaller, but it does not change the layout viewport. Thus CSS does not know about the keyboard, and a bottom sheet goes below the keys.

<Demo source={formSource}><Form /></Demo>

Keep the header and the footer outside `Drawer.Body`, and move the footer by `var(--drawer-keyboard-inset, 0px)`. The default value is necessary: the variable exists only while the keyboard is up.

## Triggers in other positions

Sometimes the buttons that open the drawer are in many positions — for example one button in each row of a table, and each button opens the same drawer with a different record. Then `createDrawerHandle()` makes the object between them. Each trigger writes into the object, one root reads from it, and the value of the trigger arrives as the `payload` of the root.

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

At the close, the focus goes back to the trigger that opened the drawer, and not to the trigger that went into the DOM last.

## Controlled state

Bind `open` to control the drawer from your own code. Then a trigger is optional. Use `defaultOpen` when the component controls the state. The `onOpenChange` prop reports each change. Set `controlledOpen` to stop the component from writing the value back. Thus the parent can refuse a change: the parent does not send the new value down. The `snapPoint` prop has the same behavior.

## Usage guidelines

- Always give the drawer a `Drawer.Title`. A `role="dialog"` element gets its name from `aria-labelledby`, and not from the text in it.
- Always give a dismissible drawer a `Drawer.Close`. Thus the user can close it without a gesture.
- Put the region that scrolls in `Drawer.Body`. Thus a scroll that gets to its end does not continue on the page behind.
- `modal="trap-focus"` keeps the focus in the panel, but the page still scrolls. `modal={false}` stops the two behaviors, for a panel that the user operates with the rest of the page.
- Set `dismissible={false}` for a drawer that the user must close deliberately. The panel still moves with the finger, and then it comes back. A gesture that does nothing looks like a fault.

## Accessibility

- `Drawer.Content` has `role="dialog"`. While the drawer is open and `modal` is `true`, it also has `aria-modal="true"`.
- `Drawer.Title` and `Drawer.Description` set `aria-labelledby` and `aria-describedby` automatically.
- The focus stays in the open drawer. Assistive technology does not read the content outside the drawer.
- The `Escape` key closes the top layer that is dismissible. Thus a popover that opened in the drawer closes first, and the next press closes the drawer.
- While a modal drawer is open, the page does not scroll. The component pins the body, which also stops the touch scroll in iOS Safari.
- With `prefers-reduced-motion`, the entrance and the exit become one frame, because the component measures the presence from your CSS and not from a fixed time.

## API reference

<ApiReference api={api} />
