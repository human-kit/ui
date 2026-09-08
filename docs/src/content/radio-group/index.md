---
title: RadioGroup
description: A group of radio buttons with one value, a shared name for the form, roving focus, and selection that follows the focus.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import api from './api.json';
</script>

# RadioGroup

`RadioGroup` makes one field from a set of `RadioGroup.Item` buttons. The group holds one value, it gives each button the same `name` for the form, and it controls the keyboard.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`RadioGroup.Root` contains `RadioGroup.Item` buttons. Each button must have a unique `value`, and it must be in a group. A radio on its own has no state, and no way to unselect itself.

`RadioGroup.Label` names the group. It is optional: `aria-label` on the root does the same for a name that the user does not see.

```svelte
<script>
	import { RadioGroup } from '@human-kit/ui';
</script>

<RadioGroup.Root name="size" defaultValue="medium">
	<RadioGroup.Label>Size</RadioGroup.Label>
	<RadioGroup.Item value="small">
		<RadioGroup.Indicator>x</RadioGroup.Indicator>
	</RadioGroup.Item>
	<RadioGroup.Item value="medium">
		<RadioGroup.Indicator>x</RadioGroup.Indicator>
	</RadioGroup.Item>
</RadioGroup.Root>
```

## Value

Use `bind:value` to give the group your state. Use `value` with `onChange` to hold the state yourself. There is no prop to declare which of the two you use: `value` is the source of truth in both, and `onChange` always reports the change.

Use `defaultValue` when the group holds its own state.

There is no unselecting. The platform gives the user no way to take a radio answer back, thus a second press on the selected radio reports nothing.

## Keyboard

The group is one stop in the tab sequence, and not one stop for each button. `Tab` moves the focus to the checked button, or to the first button while none is checked. Thus the user goes into the group, answers, and leaves with one more `Tab`.

The arrow keys move the focus **and** the selection, and they turn around at both ends. `Home` and `End` move to the first button and to the last button. `Space` selects the button that has the focus.

This is the behavior of a group of radio buttons. A group of checkboxes does the opposite: each box is its own tab stop, and the arrows do nothing.

## Forms

Give the group a `name`. Each button then puts its own `value` on a hidden input with that name, and the form sends one entry.

The group also sends `disabled`, `readonly` and `required` down to each button.

## Usage guidelines

- Each `RadioGroup.Item` in the group must have a unique `value`.
- A `RadioGroup.Item` outside a `RadioGroup.Root` reports an error. It has nothing to answer.
- A button that leaves a mounted group keeps its value in the group. The hidden input goes with it, thus the form stops sending that answer, and the tab stop moves to the first button.
- The values are strings. Each button puts its value on a native input, which keeps it as text.

## Accessibility

- `RadioGroup.Root` has `role="radiogroup"`, with `aria-orientation`, `aria-required`, `aria-disabled` and `aria-readonly`. That role supports all four. The `group` role of a checkbox group supports none of them.
- Give the group an accessible name with `RadioGroup.Label`, or with `aria-label` on the root. The label writes `aria-labelledby` on the group. An `aria-labelledby` that you give stands, thus your own element wins.
- `RadioGroup.Label` renders a `<span>`, and not a `<label>`. A `<label>` names one control, thus it cannot name a set.
- Each `RadioGroup.Item` has `role="radio"` with `aria-checked`, and it takes its tab stop from the group.
- `Enter` does not select. It submits the form, which is the behavior of a native radio button.

## API reference

<ApiReference api={api} />
