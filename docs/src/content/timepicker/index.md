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

A composable time picker that pairs a segmented time input with a popover containing wheel-based spinbutton columns. Values are `HH:mm` or `HH:mm:ss` strings, with `null` as the empty state.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`TimePicker.Root` owns the value and open state. `TimePicker.Input` renders locale-resolved segments, `TimePicker.Trigger` opens the popover, and `TimePicker.Clock` resolves the visible wheel columns from root state (`granularity`, `hourCycle`) in stable order: `hour → minute? → second? → dayPeriod?`. The `column` snippet customizes each wheel; omit it for default rendering.

```svelte
<script>
	import { TimePicker } from '@human-kit/svelte-components/timepicker';
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

## Min and max bounds

`minValue` and `maxValue` constrain both the typed input and the wheels. Out-of-range wheel items are rendered with `data-disabled`; typed out-of-range values mark the input invalid instead of being auto-corrected. Midnight-wrapping ranges are not supported.

<Demo source={boundsSource}><Bounds /></Demo>

## 12-hour cycle

Set `hourCycle={12}` to render an AM/PM segment and a day-period wheel column. Values are always normalized to 24-hour strings internally — the 12-hour rendering only affects the UI.

<Demo source={twelveHourSource}><TwelveHour /></Demo>

## Usage guidelines

- Use `value` with `onChange` for controlled state and `defaultValue` for uncontrolled state; the empty state is `null`.
- `granularity` controls the editable units: `'hour'`, `'minute'` (default), or `'second'`. `granularity="hour"` emits `HH:00` values.
- Use `hourStep`, `minuteStep`, and `secondStep` to restrict selectable values to increments.
- Use `open` / `defaultOpen` / `onOpenChange` to control the popover; wheel selection commits immediately on snap.
- `TimePicker.Popover` forwards `Popover.Content` props such as `placement` (default `bottom`), `offset`, and `shouldFlip`.
- Wrap in a `LocaleProvider` to localize segment order, day-period labels, and the default hour cycle.

## Accessibility

- Segment accessible names are resolved automatically from the active locale.
- `TimePicker.Input` exposes `aria-invalid` and `data-invalid` when the current segment draft is not committable.
- Each wheel column exposes `role="spinbutton"` with `aria-valuenow`, `aria-valuetext`, `aria-valuemin`, and `aria-valuemax`.
- Inside the popover, `ArrowUp`/`ArrowDown` step the focused column, `ArrowLeft`/`ArrowRight` move between columns, and `Home`/`End` jump to the column edges.
- Popover focus defaults to the first wheel column; `Escape` and outside presses close it.

## API reference

<ApiReference api={api} />
