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

This is a time picker with wheels. Each wheel is a spinbutton column for the hour, the minute, the second, or the day period. Use the Clock alone, or put it in a `TimePicker` with `TimePicker.Clock`.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`Clock.Root` calculates the columns from `granularity` and `hourCycle`. The sequence is always the same: the hour, then the minute, then the second, then the day period. The `column` snippet changes each wheel. `Clock.Axis` draws an overlay across all of the columns, for example a band on the selected values. If you give no `column` snippet, the component makes the default columns.

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

## Minimum and maximum

The `minValue` and `maxValue` props set the limits of the time. The component shows an item that is out of the limits with `data-disabled`. The user sees the item, but the user cannot select it. A range that goes through midnight is not possible.

<Demo source={boundsSource}><Bounds /></Demo>

## 12-hour cycle

Set `hourCycle={12}` to add a day-period column. In the code, the value is always a 24-hour `HH:mm` string. The 12-hour cycle changes only the parts that the user sees.

<Demo source={twelveHourSource}><TwelveHour /></Demo>

## Usage guidelines

- When your own code controls the state, use `value` with `onChange`. When the component controls the state, use `defaultValue`. Each value is an `HH:mm` string or an `HH:mm:ss` string.
- The `granularity` prop sets the columns: `'hour'`, `'minute'` (the default), or `'second'`. With `granularity="hour"`, the value is `HH:00`.
- The default `hourCycle` comes from the locale. Set `12` or `24` for a specified cycle.
- Use `hourStep`, `minuteStep`, and `secondStep` to limit the values to given increments.
- Put the Clock in a `LocaleProvider` to localize the day-period names and the default hour cycle.
- When a wheel stops on a value, the component immediately makes that value the new value.

## Accessibility

- Each wheel column has `role="spinbutton"` with `aria-valuenow`, `aria-valuetext`, `aria-valuemin`, and `aria-valuemax`.
- The `ArrowUp` key and the `ArrowDown` key change the value of the column with the focus by one step.
- The `ArrowLeft` key and the `ArrowRight` key move the focus between the columns.
- The `Home` key and the `End` key move to the first value and to the last value of the column.

## API reference

<ApiReference api={api} />
