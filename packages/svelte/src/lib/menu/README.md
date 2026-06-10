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
- Use `Menu.Content` inside `Menu.Root`. It renders the `role="menu"` panel in a portal and
  positions it against the trigger (default placement `bottom-start`).
- Use `Menu.Item` for actions. Provide `onSelect`, and optionally `disabled`, `closeOnSelect`, or
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

## onOpenChange details

`Menu.Root` and `Menu.SubmenuRoot` use:

- `onOpenChange(open, details)`
- `details.reason`: `trigger-press | imperative-action | none | escape-key | outside-press | focus-out | item-select`
- `details.event?`: native event that triggered the change when available
- `details.cancel()`: prevents the open-state transition
- `details.isCanceled`: reflects cancellation state inside the callback

## Anatomy

Import the component and compose its parts:

```svelte
<Menu.Root>
	<Menu.Trigger>Options</Menu.Trigger>
	<Menu.Content>
		<Menu.Item onSelect={edit}>Edit</Menu.Item>
		<Menu.Item disabled>Duplicate</Menu.Item>
		<Menu.Separator />

		<Menu.Group>
			<Menu.GroupLabel>Share</Menu.GroupLabel>
			<Menu.Item onSelect={copyLink}>Copy link</Menu.Item>
		</Menu.Group>

		<Menu.SubmenuRoot>
			<Menu.SubmenuTrigger>More actions</Menu.SubmenuTrigger>
			<Menu.Content>
				<Menu.Item onSelect={archive}>Archive</Menu.Item>
			</Menu.Content>
		</Menu.SubmenuRoot>

		<Menu.Item onSelect={remove}>Delete</Menu.Item>
	</Menu.Content>
</Menu.Root>
```

- `Menu.Root`
- `Menu.Trigger`
- `Menu.Content`
- `Menu.Item`
- `Menu.Separator`
- `Menu.Group`
- `Menu.GroupLabel`
- `Menu.SubmenuRoot`
- `Menu.SubmenuTrigger`
