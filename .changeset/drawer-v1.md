---
'@human-kit/ui': minor
---

Add `Drawer`, an edge-anchored panel dismissed by swiping it away.

- Compose `Drawer.Root`, `Drawer.Trigger`, `Drawer.Portal`, `Drawer.Overlay` and `Drawer.Content`, plus `Drawer.Body` (the scrolling region), `Drawer.Title`, `Drawer.Description` and `Drawer.Close`. `Drawer.Viewport` is an optional positioning layer; without it the panel pins itself to its edge.
- `side` anchors the panel to any of the four edges. `modal` accepts `true`, `'trap-focus'` (keyboard captured, page still scrollable) or `false`. Drawers register in the same layer stack as `Dialog`, so Escape and outside presses only ever dismiss the topmost layer and z-indexes interleave correctly.
- Swipe-to-dismiss with velocity-aware release and deference to any scrollable region between the finger and the panel — a sheet with a scrolling body no longer drags itself off screen when you try to scroll it. The panel publishes `--drawer-swipe-movement-x/y`, `--drawer-swipe-progress` and `--drawer-swipe-strength`; appearance stays with the consumer's CSS.
- `--drawer-swipe-progress` measures progress toward **dismissal**, staying at `0` for the whole trip between snap points. A backdrop tied to raw movement brightened the page while a sheet travelled from one snap point to another and snapped dark again on release, for a drawer that never left.
- Pulling a drawer further open than it can go stretches it against heavy resistance, capped at 40px and published as `--drawer-overdrag`. The strip of page the panel moves off is covered in the panel's own background, so the drawer never looks like it is coming apart from its edge.
- Only the drawer at the back of the stack paints a backdrop. Each root brings its own overlay, so stacking two dimmed the page twice — darkening the drawer underneath along with everything else. The ones above get `data-nested` on their overlay and stand down.
- `data-starting-style` marks the first painted frame after the panel mounts, giving a CSS transition a value to animate from. Without it a drawer built on `transition` has an exit animation and no entrance.
- `snapPoints` / `snapPoint` / `defaultSnapPoint` / `onSnapPointChange` / `snapToSequentialPoints`, resolved from fractions, pixels or CSS lengths, with releases settling on the point the flick was heading for. Exposed through `--drawer-snap-point-offset` and `data-expanded`.
- Nested drawers expose `data-nested-drawer-open`, `data-nested-drawer-swiping`, `--nested-drawers` and `--drawer-frontmost-height`; `Drawer.Indent` and `Drawer.IndentBackground` let the app behind pull back with the gesture.
- `Drawer.SwipeArea` opens the drawer from a viewport edge with the panel following the finger, and `Drawer.VirtualKeyboardProvider` publishes `--drawer-keyboard-inset` so a bottom sheet's footer clears the software keyboard.
- `createDrawerHandle()` drives a drawer from triggers anywhere in the tree, passing a `payload` to the root's `children` snippet and returning focus to the trigger that actually opened it.

Add `Dialog.Title`, `Dialog.Description` and `Dialog.Close`.

`Dialog.Title` and `Dialog.Description` register their ids and wire `aria-labelledby` / `aria-describedby` on `Dialog.Content`. A `role="dialog"` takes its name from `aria-labelledby`, never from the text inside it, so a dialog built with a bare heading had no accessible name. The new parts are additive — existing dialogs are unchanged.

Move the layer z-index math from `dialog/root/dialog-stack.ts` into `primitives/layer-stack.ts`, so `Menu` and `Popover` no longer import from `Dialog` to place themselves. The public helpers keep their names and values.
