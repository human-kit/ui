# Select

## Description

`Select` is a form field with one value from a list of options. The user opens the list from a
button, and the list is a `ListBox` in a popover. It has the keyboard of the WAI-ARIA select-only
combobox and a native control for the form. The field and its value have one name in the
accessibility tree.

## Anatomy

- `Select.Root`
- `Select.Label`
- `Select.Trigger`
- `Select.Value`
- `Select.Popover`
- `Select.List`
- `Select.Item`
- `Select.ItemIndicator`

```svelte
<Select.Root name="fruit" defaultValue="apple">
	<Select.Label>Fruit</Select.Label>
	<Select.Trigger>
		<Select.Value />
	</Select.Trigger>
	<Select.Popover>
		<Select.List>
			<Select.Item id="apple">Apple <Select.ItemIndicator /></Select.Item>
			<Select.Item id="banana">Banana <Select.ItemIndicator /></Select.Item>
		</Select.List>
	</Select.Popover>
</Select.Root>
```

## Usage guidelines

- Use `bind:value` to hand the root your state. Use `value` with `onChange` and `controlledValue`
  to hold the state yourself and refuse a change.
- Give `items` to `Select.Root` when the field starts with a value. The options are not in the DOM
  while the popover is closed, thus the trigger reads the text of the value from `items`. Without
  it, the trigger shows the key until the popover opens one time.
- Give the root a `name` to send the value with a form. The root makes a native `<select>` that
  the form reads, and that the browser autofill writes to.
- Set `selectionMode="multiple"` for more than one value. The popover then stays open after a
  selection, and `value` is an array.
- Put `Select.Value` inside `Select.Trigger`. The trigger then shows the selection, and the value
  is part of the accessible name of the field.

## API reference

`Select.Root` supports:

- `value?: SelectKey | null | SelectKey[]`
- `defaultValue?: SelectKey | null | SelectKey[]`
- `controlledValue?: boolean`
- `onChange?: (value) => void`
- `open?: boolean`, `defaultOpen?: boolean`, `controlledOpen?: boolean`
- `onOpenChange?: (open, details) => void`
- `selectionMode?: 'single' | 'multiple'`
- `closeOnSelect?: boolean`
- `disabledKeys?: Iterable<SelectKey>`
- `loop?: boolean`
- `disabled?`, `readonly?`, `required?`, `invalid?: boolean`
- `name?`, `form?`, `autocomplete?: string`
- `items?: T[]`
- `placeholder?: string`
- `aria-label?`, `aria-labelledby?`, `aria-describedby?: string`
- `context?: SelectContext`, `element?: HTMLDivElement`
- `...restProps: HTMLAttributes<HTMLDivElement>`

`Select.Trigger` is a `Button.Root` with `role="combobox"`. Its `children` snippet receives
`{ open, placeholder, disabled }`.

`Select.Value` shows the text of the selection, or the placeholder. Its `children` snippet
receives `{ value, label, placeholder }`.

`Select.Popover` takes the props of `Popover.Content`. `Select.List` takes the props of
`ListBox.Root`, and `Select.Item` the props of `ListBox.Item`. `Select.ItemIndicator` supports
`forceMount`.

## Accessibility

- `Select.Trigger` is a native `<button>` with `role="combobox"`, `aria-haspopup="listbox"`,
  `aria-expanded`, and `aria-controls` while the list is open. This is what a native select is in
  the accessibility tree.
- The name of the trigger is `Select.Label` and `Select.Value`, in that order: a screen reader
  announces "Fruit, Apple, combo box". An `aria-labelledby` on the root replaces the label, and an
  `aria-label` on the root is read in its place.
- `Select.Label` is a native `<label for>` the trigger. A click on it moves the focus to the
  trigger. It does not open the list, the same as the label of a native select.
- `Select.List` has `role="listbox"` with `aria-labelledby` the trigger, and each option has
  `aria-selected`. The list gets the DOM focus when the popover opens, on the selected option.
- `aria-required`, `aria-readonly` and `aria-invalid` are on the combobox, which supports all
  three.
- The popover is not a dialog: it has `role="presentation"`, and the listbox is what assistive
  technology lands on.
- On the closed trigger: `ArrowDown`, `Enter`, `Space` and `Alt+ArrowDown` open the list on the
  selection. `ArrowUp` opens it on the selection, or on the last option. `Home` and `End` open
  it on the first and on the last option. A printable character opens it on the first option
  that starts with that character.
- In the open list: the arrows move the focus, `Home` and `End` jump to the bounds, `PageUp` and
  `PageDown` move ten options, typed characters search. `Enter`, `Space` and `Alt+ArrowUp` select the
  option and close the list. `Escape` closes it without a change. `Tab` closes it and moves the
  focus past the trigger.
- The focus returns to the trigger after `Escape`, after a selection, and after a close by code.
  After an outside press, a scroll or a `Tab`, it stays where the user put it. An outside press
  on nothing focusable is the exception: the focus goes back to the trigger, thus the keyboard
  can open the list again.
- The native control is out of the tab order and hidden from assistive technology. A form that
  reports the validity of a `required` select focuses that control, and the root moves the focus
  to the trigger.

## Notes

- The focus state follows `FOCUS_STATE_CONTRACT.md`. The root shows `data-focus-within` and
  `data-focus-visible` for the trigger and the list together, and the trigger shows `data-focused`
  and `data-focus-visible` from `Button.Root`.
- A second press on the selected option changes nothing, and the popover closes, the same as a
  native select. In the multiple mode a press toggles.
- `onOpenChange` receives the reason of each change: `trigger-press`, `item-select`, `escape-key`,
  `outside-press`, `focus-out`, `scroll` or `imperative-action`. A press on the trigger reports
  `trigger-press` for the open and for the close. `details.cancel()` refuses it.
- The ids of `Select.Label` and `Select.Value` reach the trigger through the context, and the
  server cannot do that: `aria-labelledby` appears at hydration. Give `aria-label` on the root as
  well when the name must be there on the first paint.
- `Select.Trigger` shows `data-state`, `data-placeholder`, `data-readonly`, `data-required` and
  `data-invalid`. `Select.Value` shows `data-placeholder`. `Select.Item` shows the attributes of
  `ListBox.Item`.
