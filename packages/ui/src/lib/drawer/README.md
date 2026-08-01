# Drawer

## Description

`Drawer` is a panel anchored to an edge of the viewport that can be dismissed by swiping it away. It is a modal dialog by behaviour — focus trap, scroll lock, Escape, outside press — with the gesture, snap points, stacking and software-keyboard handling a sheet needs on a phone.

## Usage guidelines

- Place all drawer parts inside `Drawer.Root`.
- Render `Drawer.Overlay` and the panel inside `Drawer.Portal`.
- Always give the drawer a `Drawer.Title`. A `role="dialog"` takes its name from `aria-labelledby`, not from the text inside it.
- Always give a dismissible drawer a `Drawer.Close`. A swipe has no keyboard or screen-reader equivalent, so a drawer that can only be swiped away is unreachable for some users.
- Wrap the content in `Drawer.Body` so a scroll that reaches its end does not chain out to the page behind, and so a mouse drag inside it selects text instead of throwing the panel across the screen. Leave the grab bar outside it, as the surface a mouse can still drag by.
- Mark any control with a drag of its own — a slider, a carousel — with `data-hk-swipe-ignore`. Valueless opts it out for every input type; `="mouse"` opts it out for a mouse only.
- Put `Drawer.SwipeArea` OUTSIDE `Drawer.Portal` — it has to exist while the drawer is closed.
- Wrap `Drawer.Root` in `Drawer.VirtualKeyboardProvider` when the panel contains form fields.

## Anatomy

```svelte
<Drawer.Root side="bottom">
	<Drawer.Trigger>Open</Drawer.Trigger>
	<Drawer.Portal>
		<Drawer.Overlay />
		<Drawer.Content>
			<Drawer.Title>Title</Drawer.Title>
			<Drawer.Description>Supporting text.</Drawer.Description>
			<Drawer.Body>…</Drawer.Body>
			<Drawer.Close>Close</Drawer.Close>
		</Drawer.Content>
	</Drawer.Portal>
</Drawer.Root>
```

- `Drawer.Root`
- `Drawer.Trigger`
- `Drawer.Portal`
- `Drawer.Overlay`
- `Drawer.Viewport` (optional positioning layer)
- `Drawer.Content`
- `Drawer.Body`
- `Drawer.Title`
- `Drawer.Description`
- `Drawer.Close`
- `Drawer.SwipeArea`
- `Drawer.Indent` / `Drawer.IndentBackground`
- `Drawer.VirtualKeyboardProvider`
- `createDrawerHandle()`

## Custom properties

`Drawer.Content` publishes these for the consumer's CSS to animate against:

| Property                             | Meaning                                                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `--drawer-swipe-movement-x`          | Signed horizontal drag, in px. Apply directly in a `translateX`.                                                                |
| `--drawer-swipe-movement-y`          | Signed vertical drag, in px.                                                                                                    |
| `--drawer-swipe-progress`            | `0`–`1` toward dismissal — `0` for the whole trip between snap points. Also on `Drawer.Overlay`.                                |
| `--drawer-swipe-strength`            | `1` for a still release down to `0.1` for a hard flick. Scale the release transition by it.                                     |
| `--drawer-overdrag`                  | Resisted pull past fully open, in px; `0` the rest of the time.                                                                 |
| `--drawer-snap-point-offset`         | Translation of the current snap point, in px.                                                                                   |
| `--drawer-width` / `--drawer-height` | The panel's own measured size.                                                                                                  |
| `--drawer-frontmost-height`          | Extent of the drawer on top of the stack.                                                                                       |
| `--nested-drawers`                   | Distance from the front of the stack; `0` is frontmost.                                                                         |
| `--drawer-keyboard-inset`            | Height covered by the software keyboard. Only set while it is up, so `var(--drawer-keyboard-inset, 0px)` is the right fallback. |

`Drawer.Indent` and `Drawer.IndentBackground` publish `--drawer-indent-progress`.

The resting transform is the sum of the snap point and the drag:

```css
.DrawerContent {
	transform: translateY(calc(var(--drawer-snap-point-offset) + var(--drawer-swipe-movement-y)));
	transition: transform calc(300ms * var(--drawer-swipe-strength));
}
.DrawerContent[data-swiping] {
	transition: none;
}
```

## Data attributes

| Attribute                        | On                       | When                                                                           |
| -------------------------------- | ------------------------ | ------------------------------------------------------------------------------ |
| `data-state`                     | overlay, viewport, panel | `open` / `closed`                                                              |
| `data-entering` / `data-exiting` | overlay, viewport, panel | during the enter / exit animation                                              |
| `data-starting-style`            | overlay, panel           | the first painted frame after mounting, so a transition has somewhere to start |
| `data-side`                      | panel, overlay, viewport | the anchored edge                                                              |
| `data-nested`                    | overlay                  | a drawer is already open behind this one, so this backdrop stands down         |
| `data-swiping`                   | panel, overlay           | a drag is in flight                                                            |
| `data-swipe-dismiss`             | panel                    | the drawer was dismissed by a swipe                                            |
| `data-swipe-direction`           | panel, swipe area        | direction of the gesture                                                       |
| `data-expanded`                  | panel                    | at the most open snap point                                                    |
| `data-nested-drawer-open`        | panel                    | a drawer opened after this one is open                                         |
| `data-nested-drawer-swiping`     | panel                    | that nested drawer is being dragged                                            |

## Accessibility

- `Drawer.Content` renders `role="dialog"`, with `aria-modal="true"` while open and `modal` is `true`.
- `Drawer.Title` and `Drawer.Description` wire `aria-labelledby` / `aria-describedby` automatically.
- Focus is trapped inside the open drawer, and content outside it is hidden from assistive technology.
- Escape closes the topmost dismissable layer, so a popover opened inside the drawer closes first.
- Closing returns focus to the trigger that opened it — with a detached handle, the specific trigger, not whichever registered last.
- Page scroll is locked while a modal drawer is open, using the `position: fixed` body pin that also stops iOS Safari touch scrolling.

## Notes on Base UI parity

This drawer is modelled on Base UI's, with two deliberate differences:

- The panel part is `Drawer.Content` (Base UI calls it `Popup`) and the scrolling region is `Drawer.Body` (Base UI calls that one `Content`), so the naming matches `Dialog` and `Popover` in this library.
- There is no `Drawer.Provider`. The drawer stack is module-global here, so a provider would have nothing left to coordinate; `Drawer.Indent` reads the stack directly.
