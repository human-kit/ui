---
title: CheckboxGroup
description: A group of checkboxes with one array value, a shared name for the form, group-wide disabled and read-only state, and the counts for a parent select-all checkbox.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import api from './api.json';
</script>

# CheckboxGroup

`CheckboxGroup` makes one field from a set of `Checkbox.Root` boxes. The value of the group is an array of the checked values. The group also gives each box the same `name` for the form, and it can disable all of the boxes together.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`CheckboxGroup.Root` contains `CheckboxGroup.Item` boxes. That part is `Checkbox.Root` under the namespace of the group, and the two names are the same component. Each box must have a unique `value`. The group holds the checked state of each box.

```svelte
<script>
	import { CheckboxGroup } from '@human-kit/ui';
</script>

<CheckboxGroup.Root name="colors" defaultValue={['red']} aria-label="Colors">
	<CheckboxGroup.Item value="red">
		<CheckboxGroup.Indicator>x</CheckboxGroup.Indicator>
	</CheckboxGroup.Item>
	<CheckboxGroup.Item value="green">
		<CheckboxGroup.Indicator>x</CheckboxGroup.Indicator>
	</CheckboxGroup.Item>
</CheckboxGroup.Root>
```

## Value

Use `bind:value` to give the group your state. Use `value` with `onChange` to hold the state yourself. There is no prop to declare which of the two you use: `value` is the source of truth in both, and `onChange` always reports the change.

A parent that holds `value` and refuses a change still sees the group move. The group goes back to the value of the parent at the next render. Thus you refuse a change with a render, and not with silence.

Use `defaultValue` when the group holds its own state.

## Forms

Give the group a `name`. Each box then puts its own `value` on a hidden input with that name. The form sends one entry for each checked box, which is the behavior of a native group of checkboxes.

The group also sends `disabled` and `readonly` down to each box. It keeps `required` for itself,
because native `required` on a box demands that one box. The group gives `data-required` for
your styles, and it does not enforce a minimum count yet.

## Select all

Read `allSelected` and `someSelected` from the context of the group. They give a parent checkbox its checked state and its indeterminate state. Call `selectAll` or `clearAll` from that parent checkbox.

Keep the parent checkbox out of the group. In the group, it becomes one more value of the group.

```svelte
<script>
	let group = $state();
</script>

<Checkbox.Root
	checked={Boolean(group?.allSelected)}
	indeterminate={Boolean(group?.someSelected)}
	controlledChecked
	controlledIndeterminate
	onCheckedChange={(checked) => (checked ? group.selectAll() : group.clearAll())}
/>

<CheckboxGroup.Root bind:context={group} aria-label="Colors">
	<!-- boxes -->
</CheckboxGroup.Root>
```

## Usage guidelines

- Each box in the group must have a unique `value`. The default value of a box is `on`, thus two boxes without a `value` collide.
- A box in a group ignores its own `checked` and `defaultChecked` props. The group holds that state.
- A box that becomes disabled keeps its place in the value. A checked box that is disabled is a correct state, and the group does not remove it.
- A box that leaves a mounted group leaves the value, and the group reports the shorter value.
- The values are strings. Each box puts its value on a native input, which keeps it as text.

## Accessibility

- `CheckboxGroup.Root` has `role="group"`.
- Give the group an accessible name with `aria-label` or `aria-labelledby`.
- Each box keeps its own tab stop. The `Space` key changes the box that has the focus.
- `required` marks no element with `aria-required`: `role="group"` does not support that
  property. Put the word in the group label, and give the reason with `aria-describedby`.
- The group adds no arrow keys. React Aria and Base UI do the same, and the APG agrees. Arrow keys and one tab stop for a full set are the behavior of a group of radio buttons.

## API reference

<ApiReference api={api} />
