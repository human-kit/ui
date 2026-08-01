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

ComboBox combines text input, popover, and listbox behavior into a single accessible selection pattern. It supports single and multiple selection, controlled and uncontrolled state, keyboard-first interaction, and async pending states.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`ComboBox.Root` owns the open state, input value, selection logic, and filtering; the remaining parts compose freely inside it. `ComboBox.Clear` and `ComboBox.Trigger` are optional affordances that never steal focus from the input.

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

## Multiple selection with tags

Set `selectionMode="multiple"` and render the selected values with `ComboBox.Tags`, `ComboBox.Tag`, and `ComboBox.TagRemove`. The popover stays open after each selection, and `Backspace` in an empty input removes the last tag.

<Demo source={tagsSource}><Tags /></Demo>

## Opening modes

`trigger` controls when the popover opens: `"focus"` opens as soon as the input is focused, `"input"` opens once the user starts typing, and `"press"` opens only when `ComboBox.Trigger` is pressed. Switch the mode below and reopen the field to feel the difference.

<Demo source={modesSource}><Modes /></Demo>

## Pending state

Set `pending` on `ComboBox.Root` to expose async loading state: the root gets `data-pending`, while the trigger and clear buttons become non-interactive. The input stays editable so the user can keep refining the query.

## Usage guidelines

- Wrap all parts in `ComboBox.Root`.
- Use controlled props (`value`, `inputValue`, `open`) only when external state management is needed.
- Use `pending` on `ComboBox.Root` to expose async loading state on the root while keeping the rest of the composition under your control.
- Prefer `ComboBox.Trigger` in new code. `ComboBox.Button` remains available as a compatibility alias.
- Use `ComboBox.Clear` when you want a built-in clear affordance that resets both the input and selected value.
- Render `ComboBox.Tags`, `ComboBox.Tag`, and `ComboBox.TagRemove` in multiple mode to expose selected values.
- Choose `trigger="focus"`, `trigger="input"`, or `trigger="press"` based on your opening behavior requirements.
- Provide a stable `id` in SSR environments to keep ARIA ids deterministic.

## Accessibility

- `ComboBox.Input` renders `role="combobox"` with `aria-autocomplete="list"`, `aria-haspopup="listbox"`, `aria-expanded`, and `aria-controls` pointing at the list.
- DOM focus stays in the input while arrow keys move a virtual focus through the options via `aria-activedescendant`.
- The list renders `role="listbox"`; options render `role="option"` with `aria-selected`.
- `Enter` selects the highlighted option, `Escape` closes the popover, and typing filters the list.
- Provide `aria-label` or `aria-labelledby` on `ComboBox.Root` or `ComboBox.Input` when there is no visible label.

## API reference

<ApiReference api={api} />
