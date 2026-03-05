# Clock

## Description

`Clock` provides a standalone wheel-based time picker with spinbutton columns for hour, minute, second, and day-period selection. It can be used independently or composed inside `TimePicker` via `TimePicker.Clock`.

## Anatomy

- `Clock.Root`
- `Clock.Axis`
- `Clock.WheelColumn`
- `Clock.WheelItem`

```svelte
<Clock.Root value="14:30" granularity="minute" hourCycle={24} class="flex gap-2">
	{#snippet column(col)}
		<Clock.WheelColumn type={col.type} class="h-44 w-16">
			{#snippet children(option)}
				<Clock.WheelItem type={col.type} {option} class="..." />
			{/snippet}
		</Clock.WheelColumn>
	{/snippet}
	<Clock.Axis class="rounded-md ring-1 ring-inset" />
</Clock.Root>
```

Default columns are rendered automatically when no `column` snippet is provided:

```svelte
<Clock.Root value="09:00" granularity="minute" hourCycle={24} />
```

## Root API

- `value?: string | null` (`HH:mm` or `HH:mm:ss`)
- `defaultValue?: string | null` (`HH:mm` or `HH:mm:ss`)
- `onChange?: (value: string | null) => void`
- `minValue?: string`
- `maxValue?: string`
- `hourCycle?: 12 | 24` (defaults to locale)
- `granularity?: 'hour' | 'minute' | 'second'` (defaults to `'minute'`)
- `hourStep?: number`
- `minuteStep?: number`
- `secondStep?: number`
- `isDisabled?: boolean`
- `column?: Snippet<[ClockColumnInfo]>` — custom per-column rendering
- `children?: Snippet` — arbitrary children. When `column` is used, children render after columns (useful for overlays like `Clock.Axis`).
- `class?: string`
- `aria-label?: string`

Visible columns are resolved automatically in stable order: `hour → minute? → second? → dayPeriod?`.

## Wheel API

- `Clock.Axis` renders a root-level visual overlay (for example, a central selection band) across all columns.
- `Clock.WheelColumn` renders one wheel (`role="spinbutton"`) for one editable segment (`hour`, `minute`, `second`, or `dayPeriod`).
- `Clock.WheelItem` is headless: it renders one item (`data-wheel-item`) with state attributes (`data-selected`, `data-disabled`, `data-centered`) and leaves all visual styling to consumers.
- `ClockColumnInfo` shape:
  - `type: 'hour' | 'minute' | 'second' | 'dayPeriod'`
  - `label?: string`

## Accessibility

- Each wheel column exposes `role="spinbutton"` with `aria-valuenow`, `aria-valuetext`, `aria-valuemin`, and `aria-valuemax`.
- `ArrowUp/ArrowDown`: change value by one step.
- `ArrowLeft/ArrowRight`: move focus between columns.
- `Home/End`: jump to first/last value in the column.

## Notes

- Locale is read from `LocaleProvider` when available.
- Internally, values are normalized to 24-hour representation; 12-hour rendering only affects UI segments.
- `granularity='hour'` emits `HH:00` values.
- Min/max comparisons do not support midnight-wrapping ranges.
- Wheel selection commits immediately on snap.
