---
title: ListBox
description: A headless selectable list primitive with keyboard navigation, single and multiple selection, and controlled or uncontrolled state.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Multiple from './demos/multiple.svelte';
	import multipleSource from './demos/multiple.svelte?highlight';
	import Disabled from './demos/disabled.svelte';
	import disabledSource from './demos/disabled.svelte?highlight';
	import api from './api.json';
</script>

# ListBox

A headless selectable list primitive with keyboard navigation, single and multiple selection, and controlled or uncontrolled state.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`ListBox.Root` is the container that owns selection state and keyboard interactions; each option is a `ListBox.Item` with a unique `id`.

```svelte
<script>
	import { ListBox } from '@human-kit/svelte-components';
</script>

<ListBox.Root aria-label="Options">
	<ListBox.Item id="1">Option 1</ListBox.Item>
</ListBox.Root>
```

## Multiple selection

Set `selectionMode="multiple"` to allow more than one selected item. `selectionBehavior` controls what happens on repeat selection: `"toggle"` (default) deselects, `"replace"` always replaces the selection. Press `Ctrl+A` to select everything.

<Demo source={multipleSource}><Multiple /></Demo>

## Disabled items

Use `disabled` on `ListBox.Item` (or `disabledKeys` on the root) to make individual options non-interactive. Disabled items are skipped by keyboard navigation and styled through `data-disabled`.

<Demo source={disabledSource}><Disabled /></Demo>

## Usage guidelines

- Use `ListBox.Root` as the container for selection state and keyboard interactions, and render each option with `ListBox.Item`.
- Use `value` / `onChange` for controlled selection and `defaultValue` for uncontrolled initial selection. Values are sets of item ids.
- Use `selectionBehavior="replace"` when picking an option should always replace the current selection instead of toggling it.
- Use `disabled` on individual items or `disabledKeys` on the root to make options non-selectable.
- Provide `aria-label` on the root when there is no visible label.

## Accessibility

- `ListBox.Root` renders `role="listbox"` with `aria-multiselectable` in multiple mode; each `ListBox.Item` renders `role="option"` with `aria-selected`.
- Arrow keys move focus between items; `Home` / `End` jump to the first or last item.
- `Space` / `Enter` select the focused item; `Ctrl+A` selects all items in multiple mode.
- Every visual state (`data-selected`, `data-focused`, `data-focus-visible`, `data-hovered`, `data-pressed`, `data-disabled`) is exposed as a data attribute for styling.

## API reference

<ApiReference api={api} />
