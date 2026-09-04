---
title: Accordion
description: A headless disclosure primitive with roving focus, single or multiple expansion, disabled items, and controlled or uncontrolled open state.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Multiple from './demos/multiple.svelte';
	import multipleSource from './demos/multiple.svelte?highlight';
	import api from './api.json';
</script>

# Accordion

This is a headless disclosure component: a vertical or horizontal stack of sections that open and close. It has roving focus and disabled items. One section can be open, or more than one section can be open. You can control the open state, or you can let the component control it.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

Give each `Accordion.Item` a unique `value`. The `Header`, the `Trigger`, and the `Panel` of that item read the `value` from the context of the item. Thus you write it one time only.

```svelte
<script>
	import { Accordion } from '@human-kit/ui';
</script>

<Accordion.Root defaultValue={['overview']}>
	<Accordion.Item value="overview">
		<Accordion.Header>
			<Accordion.Trigger>Overview</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Panel>Overview content</Accordion.Panel>
	</Accordion.Item>
</Accordion.Root>
```

## Many open panels, and disabled items

Set `selectionMode="multiple"` to let more than one panel stay open. The default is `"single"`. Use `disabled` on an `Accordion.Item` to stop one item, or on `Accordion.Root` to stop the full accordion.

<Demo source={multipleSource}><Multiple /></Demo>

## Usage guidelines

- Use `value` and `onChange` when your own code controls the state. Use `defaultValue` when the component controls the state. Both props are arrays of the values of the open items.
- Use `disallowEmptySelection` to keep one panel open.
- Use `orientation="horizontal"` to change the axis of the arrow keys.
- Use `loop={false}` to stop the focus at the first trigger and at the last trigger.
- Use `forceMount` on `Accordion.Panel` when the content must stay in the DOM while the panel is closed.
- Set `level` on `Accordion.Header` (from 1 to 6, the default is `3`) to agree with the headings around the accordion.

## Accessibility

- `Accordion.Header` makes a true heading element. The default is `<h3>`. The heading contains the trigger button. This obeys the WAI-ARIA accordion pattern.
- `Accordion.Trigger` has button semantics with `aria-expanded` and `aria-controls`.
- `Accordion.Panel` has `role="region"`, and its `aria-labelledby` attribute points at its trigger. While the panel is closed, the panel is `hidden` and `inert`.
- The arrow keys move the focus between the triggers. The `Home` key and the `End` key move the focus to the first enabled trigger and to the last enabled trigger. At the ends, the focus goes to the opposite end, but not with `loop={false}`.
- The `Enter` key and the `Space` key open and close the panel with the focus, like a native button.

## API reference

<ApiReference api={api} />
