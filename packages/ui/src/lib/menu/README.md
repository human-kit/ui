# Menu

## Description

`Menu` renders an accessible dropdown / action menu anchored to a trigger. It follows the
WAI-ARIA menu button pattern: `role="menu"` content with `role="menuitem"` children, arrow-key
navigation, typeahead, and submenu support. It is built on the same floating / portal / presence
primitives as `Popover`.

## Usage guidelines

- Use `Menu.Root` to share open state and the trigger reference.
- Use `Menu.Trigger` as the opener button. `ArrowDown`/`Enter`/`Space` open the menu and focus the
  first item; `ArrowUp` opens and focuses the last item.
- Use `Menu.ContextTrigger` instead of `Menu.Trigger` to open the menu from a surface rather than
  a button: right click, long press on touch, or `Shift+F10` / the `ContextMenu` key.
- Use `Menu.Content` inside `Menu.Root`. It renders the `role="menu"` panel in a portal and
  positions it against the trigger (default placement `bottom-start`).
- Use `Menu.Item` for actions. Provide `onAction`, and optionally `disabled`, `closeOnSelect`, or
  `textValue` (for typeahead).
- Group related items with `Menu.Group` + `Menu.GroupLabel`, and divide sections with
  `Menu.Separator`.
- Nest a `Menu.SubmenuRoot` containing a `Menu.SubmenuTrigger` and its own `Menu.Content` to build
  submenus (default placement `right-start`).

## Behaviour

- `closeOnSelect` (on `Menu.Root`, overridable per `Menu.Item`) controls whether activating an item
  closes the menu. Default `true`.
- `loop` (default `true`) wraps arrow navigation; `typeahead` (default `true`) focuses items by
  typed text.
- Escape closes the current (topmost) menu and returns focus to its trigger. `Tab` and outside
  interaction close the whole menu chain. Within a submenu, `ArrowLeft` closes just that level.
- Submenus use a "safe triangle" pointer intent: while the pointer is moving diagonally toward an
  open submenu, hovering the sibling items it passes over does not close the submenu for a short
  grace period, so the user can reach it without the submenu collapsing mid-path.

## Context menus

`Menu.ContextTrigger` is a surface, not a button: it renders a plain element so it can wrap
arbitrary — sometimes interactive — content. It opens the menu three ways, and each anchors the
panel differently:

- **Right click** — anchored at the pointer, flush against it (`Menu.Content` drops its default
  `offset` to `0` for a context menu), unfolding down and to the right like a native one. Right
  clicking again re-anchors the open menu instead of closing and reopening it.
- **Long press** on touch or pen — anchored at the finger. It is what makes the menu reachable at
  all on a phone, where `contextmenu` is unreliable. The action suppresses the `click` and
  `contextmenu` the platform emits for the same gesture, and the surface sets
  `-webkit-touch-callout: none; user-select: none` inline so iOS raises the menu instead of the
  text callout. Turn either off with `longPress={false}` / `preventTouchCallout={false}`.
- **`Shift+F10` or the `ContextMenu` key** — anchored to the surface itself, with the first item
  focused. There is no pointer involved, so reusing the last cursor position would put the panel
  somewhere the keyboard user never pointed at.

A left press anywhere — including on the surface itself — dismisses it, like a native menu.

### Accessibility

The surface is a tab stop by default (`tabindex={0}`) so a keyboard user can reach it; pass
`tabindex={-1}` when it lives inside a composite that already manages focus with a roving
tabindex, such as a table or a tree.

It carries `aria-keyshortcuts="Shift+F10"` and nothing else. `aria-haspopup` and `aria-expanded`
are **not** global ARIA properties: on a generic element they would be invalid, so the component
does not claim them. That is a real limit, not an oversight — **a context menu must never be the
only route to an action.** Give the same `Menu.Root` a visible `Menu.Trigger`, or expose the same
actions elsewhere in the UI.

## onOpenChange details

`Menu.Root` and `Menu.SubmenuRoot` use:

- `onOpenChange(open, details)`
- `details.reason`: `trigger-press | imperative-action | none | escape-key | outside-press | focus-out | item-select`
- `details.event?`: native event that triggered the change when available
- `details.cancel()`: prevents the open-state transition
- `details.isCanceled`: reflects cancellation state inside the callback

## Anatomy

Import the component and compose its parts:

A context menu swaps the trigger and keeps everything else:

```svelte
<Menu.Root>
	<Menu.ContextTrigger>Right click anywhere in this card</Menu.ContextTrigger>
	<Menu.Content>
		<Menu.Item onAction={edit}>Edit</Menu.Item>
	</Menu.Content>
</Menu.Root>
```

```svelte
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

		<Menu.SubmenuRoot>
			<Menu.SubmenuTrigger>More actions</Menu.SubmenuTrigger>
			<Menu.Content>
				<Menu.Item onAction={archive}>Archive</Menu.Item>
			</Menu.Content>
		</Menu.SubmenuRoot>

		<Menu.Item onAction={remove}>Delete</Menu.Item>
	</Menu.Content>
</Menu.Root>
```

- `Menu.Root`
- `Menu.Trigger`
- `Menu.ContextTrigger`
- `Menu.Content`
- `Menu.Item`
- `Menu.Separator`
- `Menu.Group`
- `Menu.GroupLabel`
- `Menu.SubmenuRoot`
- `Menu.SubmenuTrigger`
