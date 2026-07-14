---
title: Clock
description: A standalone wheel-based time picker with spinbutton columns for hour, minute, second, and day-period selection.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Bounds from './demos/bounds.svelte';
	import boundsSource from './demos/bounds.svelte?highlight';
	import TwelveHour from './demos/twelve-hour.svelte';
	import twelveHourSource from './demos/twelve-hour.svelte?highlight';
	import api from './api.json';
</script>

# Clock

A standalone wheel-based time picker with spinbutton columns for hour, minute, second, and day-period selection. It can be used independently or composed inside `TimePicker` via `TimePicker.Clock`.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`Clock.Root` resolves the visible columns from `granularity` and `hourCycle` in stable order (`hour → minute? → second? → dayPeriod?`). The `column` snippet customizes each wheel; `Clock.Axis` draws a root-level overlay (such as a central selection band) across all columns. When no `column` snippet is provided, default columns are rendered automatically.

```svelte
<script>
	import { Clock } from '@human-kit/ui';
</script>

<Clock.Root value="14:30" granularity="minute" hourCycle={24} class="flex gap-2">
	{#snippet column(col)}
		<Clock.WheelColumn type={col.type} class="h-44 w-16">
			{#snippet children(option)}
				<Clock.WheelItem type={col.type} {option} />
			{/snippet}
		</Clock.WheelColumn>
	{/snippet}
	<Clock.Axis />
</Clock.Root>
```

## Min and max bounds

`minValue` and `maxValue` constrain the selectable time. Out-of-range items are rendered with `data-disabled` so they stay visible but cannot be committed. Midnight-wrapping ranges are not supported.

<Demo source={boundsSource}><Bounds /></Demo>

## 12-hour cycle

Set `hourCycle={12}` to render a day-period column. Values are always normalized to 24-hour `HH:mm` strings internally — the 12-hour rendering only affects the UI segments.

<Demo source={twelveHourSource}><TwelveHour /></Demo>

## Usage guidelines

- Use `value` with `onChange` for controlled state and `defaultValue` for uncontrolled state; values are `HH:mm` or `HH:mm:ss` strings.
- `granularity` controls which columns render: `'hour'`, `'minute'` (default), or `'second'`. `granularity="hour"` emits `HH:00` values.
- `hourCycle` defaults to the active locale; set `12` or `24` to force a cycle.
- Use `hourStep`, `minuteStep`, and `secondStep` to restrict selectable values to increments.
- Wrap in a `LocaleProvider` to localize day-period labels and the default hour cycle.
- Wheel selection commits immediately on snap.

## Accessibility

- Each wheel column exposes `role="spinbutton"` with `aria-valuenow`, `aria-valuetext`, `aria-valuemin`, and `aria-valuemax`.
- `ArrowUp`/`ArrowDown` change the focused column's value by one step.
- `ArrowLeft`/`ArrowRight` move focus between columns.
- `Home`/`End` jump to the first/last value in the column.

## API reference

<ApiReference api={api} />
