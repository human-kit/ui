---
title: TimePicker
description: A composable time picker pairing a segmented time input with a popover of wheel-based spinbutton columns.
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

# TimePicker

This is a time picker that you assemble from parts. It puts a time input with segments together with a popover of wheel columns. Each value is an `HH:mm` string or an `HH:mm:ss` string. The empty state is `null`.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`TimePicker.Root` holds the value and the open state. `TimePicker.Input` makes the segments for the locale. `TimePicker.Trigger` opens the popover. `TimePicker.Clock` calculates the wheel columns from the state of the root (`granularity` and `hourCycle`). The sequence is always the same: the hour, then the minute, then the second, then the day period. The `column` snippet changes each wheel. If you give no `column` snippet, the component makes the default columns.

```svelte
<script>
	import { TimePicker } from '@human-kit/ui/timepicker';
</script>

<TimePicker.Root>
	<TimePicker.Input aria-label="Time input">
		{#snippet children(segment)}
			<TimePicker.Segment {segment} />
		{/snippet}
	</TimePicker.Input>
	<TimePicker.Trigger />

	<TimePicker.Popover>
		<TimePicker.Clock />
	</TimePicker.Popover>
</TimePicker.Root>
```

## Minimum and maximum

The `minValue` and `maxValue` props set the limits for the text that the user types and for the wheels. The component shows a wheel item that is out of the limits with `data-disabled`. If the user types a time that is out of the limits, the input becomes invalid. The component does not correct the time. A range that goes through midnight is not possible.

<Demo source={boundsSource}><Bounds /></Demo>

## 12-hour cycle

Set `hourCycle={12}` to add an AM/PM segment and a day-period wheel column. In the code, the value is always a 24-hour string. The 12-hour cycle changes only the parts that the user sees.

<Demo source={twelveHourSource}><TwelveHour /></Demo>

## Usage guidelines

- When your own code controls the state, use `value` with `onChange`. When the component controls the state, use `defaultValue`. The empty state is `null`.
- The `granularity` prop sets the units that the user can edit: `'hour'`, `'minute'` (the default), or `'second'`. With `granularity="hour"`, the value is `HH:00`.
- Use `hourStep`, `minuteStep`, and `secondStep` to limit the values to given increments.
- Use `open`, `defaultOpen`, and `onOpenChange` to control the popover. When a wheel stops on a value, the component immediately makes that value the new value.
- `TimePicker.Popover` accepts the props of `Popover.Content`, for example `placement` (the default is `bottom`), `offset`, and `shouldFlip`.
- Put the picker in a `LocaleProvider` to localize the sequence of the segments, the day-period names, and the default hour cycle.

## Accessibility

- The accessible name of each segment comes from the active locale.
- `TimePicker.Input` gets `aria-invalid` and `data-invalid` when the segments do not make a valid time.
- Each wheel column has `role="spinbutton"` with `aria-valuenow`, `aria-valuetext`, `aria-valuemin`, and `aria-valuemax`.
- In the popover, the `ArrowUp` key and the `ArrowDown` key change the column with the focus. The `ArrowLeft` key and the `ArrowRight` key move the focus between the columns. The `Home` key and the `End` key move to the first value and to the last value of the column.
- When the popover opens, the focus goes to the first wheel column. The `Escape` key and a press outside the popover close it.

## API reference

<ApiReference api={api} />
