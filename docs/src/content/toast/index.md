---
title: Toast
description: A short message about an event, for a time, in a landmark the keyboard reaches with F6, announced by a live region, with timers that stop while the user reads, a limit, a swipe to dismiss, and a promise that turns loading into success or error.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import PromiseDemo from './demos/promise.svelte';
	import promiseSource from './demos/promise.svelte?highlight';
	import Action from './demos/action.svelte';
	import actionSource from './demos/action.svelte?highlight';
	import Anchored from './demos/anchored.svelte';
	import anchoredSource from './demos/anchored.svelte?highlight';
	import api from './api.json';
</script>

# Toast

`Toast` shows a short message about an event, for a time, without a stop of the work. The provider holds the list, and the viewport is the landmark where the toasts land. A screen reader hears each message from a live region beside them.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`Toast.Provider` holds the list of toasts and the timers. Put one around the app. `Toast.Viewport` is the region where the toasts land. Put one in the provider, and give it a snippet that renders a `Toast.Root` for each item.

`Toast.Content` holds `Toast.Title` and `Toast.Description`. `Toast.Action` and `Toast.Close` are the buttons, outside the content. `Toast.Positioner` is optional: it puts a toast with an `anchor` against that element.

```svelte
<script>
	import { Toast } from '@human-kit/ui';
</script>

<Toast.Provider>
	<App />
	<Toast.Viewport>
		{#snippet children(toast)}
			<Toast.Root {toast}>
				<Toast.Content>
					<Toast.Title />
					<Toast.Description />
				</Toast.Content>
				<Toast.Close aria-label="Close">x</Toast.Close>
			</Toast.Root>
		{/snippet}
	</Toast.Viewport>
</Toast.Provider>
```

## The manager

Call `useToastManager()` in a component under the provider, or use `bind:manager` on the provider. The manager has `add`, `update`, `close` and `promise`.

`add` takes `title`, `description`, `type`, `timeout`, `priority` and `data`, and it answers the id of the toast. With the id of a toast that is on the screen, `add` updates it. `update` replaces the fields it names, and it gives the toast its full time again. `close` closes one toast, or all of them without an id.

```svelte
<script>
	import { useToastManager } from '@human-kit/ui';

	const toasts = useToastManager();
</script>

<button onclick={() => toasts.add({ title: 'Saved', description: 'The copy is on the server.' })}>
	Save
</button>
```

The title and the description are text. That text is what the screen reader hears. `Toast.Title` and `Toast.Description` show it without children, and your own children replace it on the screen.

## A promise

`promise` adds a `loading` toast, which stays until the promise settles. It then turns into `success` or `error`, with the text for each state, and the timer starts.

<Demo source={promiseSource}><PromiseDemo /></Demo>

## An action

`Toast.Action` is the one thing the toast offers, such as `Undo`. The press closes the toast, because the offer is taken. `keepOpen` holds it for an action that changes the toast instead.

<Demo source={actionSource}><Action /></Demo>

## Timers

A toast stays `timeout` milliseconds: 5000 by default, on the provider or on the toast. `0` keeps it until a close.

The timers stop while the pointer rests on the viewport, and while the keyboard focus is in it. They also stop while the tab is hidden. They start again with the time each toast had left. A toast that closes while the user reads it is a toast the user did not read.

## The stack

The viewport shows the newest toasts up to `limit`: 3 by default. The older ones wait behind, hidden and inert, with their timers stopped, and they come forward as the newer ones close.

Each toast gets `--toast-index`, `--toast-offset-y` and `--toast-height`, and the viewport gets `--toast-frontmost-height`. `data-front` marks the toast in front. `data-expanded` is on the viewport and on each toast while the pointer rests on the viewport, or while the focus is in it. The viewport of the first demo stacks the toasts in the corner with them, and spreads them out on `data-expanded`. Its source is in `viewport.svelte`, under the demo.

```css
.toast {
	position: absolute;
	inset-block-end: 0;
	transform: translateY(calc(var(--toast-index) * -12px)) scale(calc(1 - var(--toast-index) * 0.05));
}

.toast[data-expanded] {
	transform: translateY(calc(-1 * var(--toast-offset-y) - var(--toast-index) * 8px));
}
```

## A swipe

A swipe pushes the toast out through one of `swipeDirection`: `bottom` and `right` by default. The toast follows the finger with `--toast-swipe-movement-x` and `--toast-swipe-movement-y`, and it comes back when the swipe is short. `data-swipe-dismissed` and `data-swipe-direction` are on the toast for the exit.

A swipe never starts on `Toast.Close` or `Toast.Action`. Put `data-hk-swipe-ignore` on other content of your own that must not start one, such as a slider in the toast.

## Against an element

Give `anchor` to `add`, with an optional `placement` and `offset`, for a toast that sits against an element in place of the corner. Put `Toast.Positioner` around `Toast.Root` in the viewport snippet. For a toast without an anchor, the positioner is out of the layout, thus one snippet serves both kinds. A toast with an anchor is out of the stack: `--toast-index` reads 0, and `data-anchored` is on the root.

<Demo source={anchoredSource}><Anchored /></Demo>

## Usage guidelines

- Keep the default `timeout` at 5 seconds or more. A user who reads slowly needs the time, and a user with a screen magnifier can miss a short toast.
- Use `priority: 'high'` only for a message that cannot wait. It interrupts the screen reader.
- Put a message the user must act on in a `Dialog`, not in a toast. A toast goes away.
- Keep the buttons out of `Toast.Content`. The announcement reads the content, not the buttons.
- Give the app one viewport. Two providers can share one `manager`, for example an app and a dialog in it.

## Accessibility

- `Toast.Viewport` is a `role="region"` landmark, named with the count of toasts. `F6` moves the focus into it from anywhere on the page, and back. A `Tab` past the last button goes back to where the focus was.
- Two live regions beside the viewport announce each toast: `role="status"` for the normal priority, and `role="alert"` for the high priority. They are on the page before the first toast, thus the first toast is announced too. Two toasts in the same tick are two messages.
- `Toast.Root` is a `role="dialog"` that is not modal, or an `alertdialog` for the high priority. It has `aria-labelledby` from the title and `aria-describedby` from the description, and it is a tab stop. A toast without a title takes its name from the description: a dialog without a name is a fault.
- `Escape` closes the focused toast. The focus moves to the next toast, or back to where it was.
- The viewport stays reachable behind a modal `Dialog`: `F6` moves the focus into it, `Tab` moves in it, and a `Tab` past its last button goes back to the dialog.

## API reference

<ApiReference api={api} />
