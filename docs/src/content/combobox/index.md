---
title: ComboBox
description: An accessible combination of text input, popover, and listbox with single and multiple selection, keyboard-first interaction, and async pending states.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Tags from './demos/tags.svelte';
	import tagsSource from './demos/tags.svelte?highlight';
	import Modes from './demos/modes.svelte';
	import modesSource from './demos/modes.svelte?highlight';
	import api from './api.json';
</script>

# ComboBox

A ComboBox puts a text input, a popover, and a listbox together in one accessible selection pattern. It permits one selection or more than one selection. You can control its state, or you can let the component control it. The keyboard operates all of it, and the component has a pending state for asynchronous data.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`ComboBox.Root` holds the open state, the input text, the selection, and the filter. You assemble the other parts inside it as you want. `ComboBox.Clear` and `ComboBox.Trigger` are optional, and they never take the focus from the input.

```svelte
<script>
	import { ComboBox } from '@human-kit/ui';
</script>

<ComboBox.Root>
	<ComboBox.Input />
	<ComboBox.Clear />
	<ComboBox.Trigger />
	<ComboBox.Popover>
		<ComboBox.List>
			<ComboBox.Item id="1">Option 1</ComboBox.Item>
		</ComboBox.List>
	</ComboBox.Popover>
</ComboBox.Root>
```

## Tags for more than one selection

Set `selectionMode="multiple"`, and show the selected values with `ComboBox.Tags`, `ComboBox.Tag`, and `ComboBox.TagRemove`. The popover stays open after each selection. If the input is empty, the `Backspace` key removes the last tag.

<Demo source={tagsSource}><Tags /></Demo>

## Open modes

The `trigger` prop controls when the popover opens. With `"focus"`, the popover opens when the input gets the focus. With `"input"`, the popover opens when the user starts to type. With `"press"`, the popover opens only when the user pushes `ComboBox.Trigger`. Change the mode below, then open the field again to see the difference.

<Demo source={modesSource}><Modes /></Demo>

## Pending state

Set `pending` on `ComboBox.Root` to show the state of an asynchronous request. The root gets `data-pending`, and the trigger button and the clear button stop their operation. The input stays editable, thus the user can change the query.

## Usage guidelines

- Put all of the parts in `ComboBox.Root`.
- Use the controlled props (`value`, `inputValue`, and `open`) only when your own code must hold the state.
- Use `pending` on `ComboBox.Root` to show the state of an asynchronous request on the root. The other parts stay under your control.
- In new code, use `ComboBox.Trigger`. `ComboBox.Button` is still available, but only for compatibility.
- Use `ComboBox.Clear` when you want a control that removes the input text and the selected value together.
- In the multiple mode, use `ComboBox.Tags`, `ComboBox.Tag`, and `ComboBox.TagRemove` to show the selected values.
- Select `trigger="focus"`, `trigger="input"`, or `trigger="press"` for the open behavior that you want.
- On a server, give the root a stable `id`. Thus the ARIA ids stay the same.

## Accessibility

- `ComboBox.Input` has `role="combobox"` with `aria-autocomplete="list"`, `aria-haspopup="listbox"`, and `aria-expanded`. Its `aria-controls` attribute points at the list.
- The DOM focus stays in the input. The arrow keys move a virtual focus through the options with `aria-activedescendant`.
- The list has `role="listbox"`. Each option has `role="option"` with `aria-selected`.
- The `Enter` key selects the option with the virtual focus. The `Escape` key closes the popover. When the user types, the component filters the list.
- If there is no label that the user sees, give `ComboBox.Root` or `ComboBox.Input` an `aria-label` or an `aria-labelledby` attribute.

## API reference

<ApiReference api={api} />
