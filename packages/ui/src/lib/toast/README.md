# Toast

## Description

`Toast` shows a short message about an event, for a time, without a stop of the work. The provider holds the list, and the viewport is the landmark where the toasts land. A screen reader hears each message from a live region beside them.

## Anatomy

- `Toast.Provider`
- `Toast.Viewport`
- `Toast.Positioner`
- `Toast.Root`
- `Toast.Content`
- `Toast.Title`
- `Toast.Description`
- `Toast.Action`
- `Toast.Close`

```svelte
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

## Usage guidelines

- Put one `Toast.Provider` around the app, and one `Toast.Viewport` in it.
- Call `useToastManager()` in a component under the provider, or `bind:manager` on the provider, to `add`, `update`, `close` and `promise`.
- Give `title` and `description` as text: that text is the announcement. The parts show it without children.
- Keep the buttons out of `Toast.Content`, thus the announcement does not read them.
- Use `priority: 'high'` only for a message that cannot wait. It interrupts the screen reader.
- Keep the default `timeout` at 5 seconds or more. A user who reads slowly needs the time.
- Give `anchor` to `add`, and put `Toast.Positioner` around the root, for a toast against an element.
- Style the stack with `--toast-index`, `--toast-offset-y`, `--toast-height`, `--toast-frontmost-height`, `data-front` and `data-expanded`. Move the toast with `--toast-swipe-movement-x` and `--toast-swipe-movement-y`.
- A toast that closes is out of the stack at once, and it keeps the place it had for its exit. Cover the gap between two spread toasts with a pseudo-element, or the pointer leaves the viewport between them.

## API reference

- `Toast.Provider`
  - `timeout?: number` (5000), `limit?: number` (3)
  - `manager?: ToastManager` (bindable)
- `Toast.Viewport`
  - `children: Snippet<[ToastItem]>`, `portal?: boolean` (true)
- `Toast.Positioner`
  - `toast: ToastItem`
- `Toast.Root`
  - `toast: ToastItem`, `swipeDirection?: SwipeSide[]` (`['bottom', 'right']`)
- `Toast.Action`
  - `keepOpen?: boolean`
- `ToastManager`
  - `add({ title, description, type, timeout, priority, data, anchor, placement, offset }) => id`, `update(id, options | (toast) => options)`, `close(id?)`, `promise(promise, { loading, success, error })`
  - `pauseTimers()`, `resumeTimers()`, `toasts`, `visibleToasts`

## Accessibility

- `Toast.Viewport` is a `role="region"` landmark, named with the count of toasts. `F6` moves the focus into it from anywhere on the page, and back.
- Two live regions beside the viewport announce each toast: `role="status"` for the normal priority, and `role="alert"` for the high priority. The message is the title and the description.
- `Toast.Root` is a `role="dialog"` that is not modal, or an `alertdialog` for the high priority. It has `aria-labelledby` from the title and `aria-describedby` from the description, and it is a tab stop.
- `Escape` closes the focused toast, and the focus moves to the next toast, or back to where it was.
- The timers stop while the pointer rests on the viewport, and while the focus is in it. A tap on a toast holds the stack open, and the timers with it, until a touch outside the viewport. They also stop while the tab is hidden.
- The viewport stays reachable behind a modal dialog, with `F6` and `Tab`.
