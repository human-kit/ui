---
title: Select
description: A form field that picks one value from a list, with the keyboard of a native select, a hidden control for the form, and a name that announces the field and its value together.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Multiple from './demos/multiple.svelte';
	import multipleSource from './demos/multiple.svelte?highlight';
	import api from './api.json';
</script>

# Select

`Select` is a form field with one value from a list of options. The user opens the list from a button, and the list is a `ListBox` in a popover. It has the keyboard of a native select, a native control for the form, and one accessible name for the field and its value.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`Select.Root` holds the value and the open state. `Select.Trigger` is the button that opens the list, and `Select.Value` in it shows the selection. `Select.Popover` holds `Select.List`, and each `Select.Item` is one option.

`Select.Label` names the field. `Select.ItemIndicator` marks the selected option.

```svelte
<script>
	import { Select } from '@human-kit/ui';
</script>

<Select.Root name="fruit">
	<Select.Label>Fruit</Select.Label>
	<Select.Trigger>
		<Select.Value />
	</Select.Trigger>
	<Select.Popover>
		<Select.List>
			<Select.Item id="apple">Apple</Select.Item>
			<Select.Item id="banana">Banana</Select.Item>
		</Select.List>
	</Select.Popover>
</Select.Root>
```

## Select or Menu

A `Menu` is a list of commands: a press on an item does something, and nothing stays selected. A `Select` is a field: it holds a value, a form sends that value, and a screen reader announces the field with its value. Use `Select` when the user answers a question, and `Menu` when the user gives an order.

## Value

Use `bind:value` to give the root your state. Use `value` with `onChange` and `controlledValue` to hold the state yourself. The root then reports each change, and it does not write `value` back. Thus you can refuse a change.

Use `defaultValue` when the root holds its own state.

The options are not in the DOM while the popover is closed. Give the same array to `items` on the root, thus the trigger reads the text of the value from it. Without `items`, the trigger shows the key until the popover opens one time.

## More than one value

Set `selectionMode="multiple"`. The popover then stays open after a selection, and `value` is an array. `Select.Value` shows the texts with a comma between them, and its snippet receives the array when you want a different text.

<Demo source={multipleSource}><Multiple /></Demo>

## Keyboard

On the closed trigger:

- `ArrowDown`, `Enter`, `Space` and `Alt+ArrowDown` open the list. The focus goes to the selected option, or to the first option.
- `ArrowUp` opens the list. The focus goes to the selected option, or to the last option.
- `Home` and `End` open the list on the first option and on the last option.
- A letter or a digit opens the list on the first option that starts with it.

In the open list:

- `ArrowUp` and `ArrowDown` move the focus. They stop at the ends, unless `loop` is set.
- `Home` and `End` move the focus to the first option and to the last option.
- `PageUp` and `PageDown` move the focus ten options.
- Typed characters move the focus to the option that starts with them. The same character again moves to the next option that starts with it.
- `Enter`, `Space` and `Alt+ArrowUp` select the option and close the list.
- `Escape` closes the list without a change.
- `Tab` closes the list without a change, and the focus continues past the trigger.

## Forms

Give the root a `name`. The root makes a native `<select>` that the form reads, and that the browser autofill writes to. It is out of the tab order and hidden from assistive technology.

`required`, `disabled` and `form` go to that control. A form that reports the validity of a required select focuses the control, and the root moves the focus to the trigger.

## Usage guidelines

- Put `Select.Value` inside `Select.Trigger`. The trigger then shows the selection, and the value is part of the accessible name of the field.
- Give `items` to `Select.Root` when the field starts with a value.
- Use `disabledKeys` for options the user cannot select. The focus skips them.
- A second press on the selected option changes nothing, and the popover closes. In the multiple mode a press toggles.
- `onOpenChange` receives the reason of each change, and `details.cancel()` refuses it.

## Accessibility

- `Select.Trigger` is a native `<button>` with `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`, and `aria-controls` while the list is open. This is what a native select is in the accessibility tree.
- The name of the trigger is `Select.Label` and `Select.Value`, in that order. A screen reader announces "Fruit, Apple, combo box". An `aria-labelledby` on the root replaces the label, and an `aria-label` on the root is read in its place.
- `Select.Label` is a native `<label>` for the trigger. A click on it moves the focus to the trigger, and it does not open the list.
- `Select.List` has `role="listbox"` with the trigger as its name, and each option has `aria-selected`. The list gets the DOM focus when the popover opens, on the selected option.
- `aria-required`, `aria-readonly` and `aria-invalid` are on the combobox, which supports all three.
- The popover is not a dialog. It has `role="presentation"`, and the listbox is what assistive technology lands on.
- The focus returns to the trigger after `Escape`, after a selection, and after a close by code. After an outside press, a scroll or a `Tab`, it stays where the user put it.

## API reference

<ApiReference api={api} />
