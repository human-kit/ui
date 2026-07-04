---
title: ToggleGroup
description: Grouped toggle buttons with single or multiple selection, roving focus, disabled handling, and array-based controlled or uncontrolled value.
---

<script>
	import Demo from '$lib/docs/demo.svelte';
	import ApiReference from '$lib/docs/api-reference.svelte';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Single from './demos/single.svelte';
	import singleSource from './demos/single.svelte?highlight';
	import Vertical from './demos/vertical.svelte';
	import verticalSource from './demos/vertical.svelte?highlight';
	import api from './api.json';
</script>

# ToggleGroup

`ToggleGroup` coordinates multiple `Toggle.Root` buttons with single or multiple selection, roving focus, disabled handling, and array-based controlled or uncontrolled value.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`ToggleGroup.Root` wraps regular `Toggle.Root` buttons. Every grouped toggle must provide a unique `value`, which is how the group tracks selection.

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

`selectionMode="single"` (the default) keeps at most one value selected while preserving the array model. Add `disallowEmptySelection` when one enabled toggle must always remain selected.

<Demo source={singleSource}><Single /></Demo>

## Vertical orientation

`orientation="vertical"` switches roving focus to the Up and Down arrow keys. Disabled toggles are skipped by keyboard navigation.

<Demo source={verticalSource}><Vertical /></Demo>

## Usage guidelines

- Use `value` / `defaultValue` arrays for both single and multiple selection.
- Use `selectionMode="single"` when only one toggle can be selected.
- Use `selectionMode="multiple"` when several toggles can be selected.
- Use `disallowEmptySelection` when at least one enabled toggle must remain selected.
- Every grouped `Toggle.Root` must provide a unique `value`.
- Grouped toggles ignore their standalone `selected` and `defaultSelected` props.

## Accessibility

- `ToggleGroup.Root` renders `role="group"`.
- Provide an accessible group name with `aria-label` or `aria-labelledby`.
- Each `Toggle.Root` remains a native toggle button with `aria-pressed`.
- Arrow keys move focus through enabled toggles; `Home` and `End` jump to the bounds.

## API reference

<ApiReference {api} />
