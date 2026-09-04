---
title: ToggleGroup
description: Grouped toggle buttons with single or multiple selection, roving focus, disabled handling, and array-based controlled or uncontrolled value.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import api from './api.json';
</script>

# ToggleGroup

`ToggleGroup` controls a set of `Toggle.Root` buttons. The group permits one selection or more than one selection. It has roving focus, it obeys the disabled state, and its value is an array.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`ToggleGroup.Root` contains usual `Toggle.Root` buttons. Each toggle in the group must have a unique `value`. The group uses the `value` to record the selection.

```svelte
<script>
	import { Toggle, ToggleGroup } from '@human-kit/ui';
</script>

<ToggleGroup.Root defaultValue={['bold']} selectionMode="multiple" aria-label="Text style">
	<Toggle.Root value="bold">Bold</Toggle.Root>
	<Toggle.Root value="italic">Italic</Toggle.Root>
</ToggleGroup.Root>
```

## Single selection

`selectionMode="single"` is the default. It keeps one value selected, or none. The value stays an array. Add `disallowEmptySelection` when one enabled toggle must stay selected.

## Vertical orientation

`orientation="vertical"` moves the roving focus to the Up arrow key and the Down arrow key. The keyboard focus does not stop on a disabled toggle.

## Usage guidelines

- Use `value` and `defaultValue` arrays for a single selection and for more than one selection.
- Use `selectionMode="single"` when only one toggle can be selected.
- Use `selectionMode="multiple"` when more than one toggle can be selected.
- Use `disallowEmptySelection` when one enabled toggle must stay selected.
- Each `Toggle.Root` in the group must have a unique `value`.
- A toggle in a group ignores its own `selected` and `defaultSelected` props.

## Accessibility

- `ToggleGroup.Root` has `role="group"`.
- Give the group an accessible name with `aria-label` or `aria-labelledby`.
- Each `Toggle.Root` stays a native toggle button with `aria-pressed`.
- The arrow keys move the focus through the enabled toggles. The `Home` key and the `End` key move the focus to the first toggle and to the last toggle.

## API reference

<ApiReference api={api} />
