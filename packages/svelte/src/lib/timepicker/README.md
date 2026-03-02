# TimePicker

## Description

`TimePicker` composes a segmented time input with a popover containing wheel-based spinbutton columns.

## Anatomy

- `TimePicker.Root`
- `TimePicker.Input`
- `TimePicker.Segment`
- `TimePicker.Trigger`
- `TimePicker.Popover`
- `TimePicker.TimePanel`
- `TimePicker.WheelColumn`
- `TimePicker.WheelItem`

```svelte
<TimePicker.Root>
 <TimePicker.Input aria-label="Time input">
  {#snippet children(segment)}
   <TimePicker.Segment {segment} />
  {/snippet}
 </TimePicker.Input>
 <TimePicker.Trigger />

 <TimePicker.Popover>
  <TimePicker.TimePanel />
 </TimePicker.Popover>
</TimePicker.Root>
```

```svelte
<TimePicker.Popover>
 <TimePicker.TimePanel class="flex gap-2">
  {#snippet column(col)}
   <TimePicker.WheelColumn type={col.type} class="h-44 rounded-md">
    {#snippet children(option)}
     <TimePicker.WheelItem type={col.type} {option} class="..." />
    {/snippet}
   </TimePicker.WheelColumn>
  {/snippet}
 </TimePicker.TimePanel>
</TimePicker.Popover>
```

## Root API

- `value?: string | null` (`HH:mm` or `HH:mm:ss`)
- `defaultValue?: string | null` (`HH:mm` or `HH:mm:ss`)
- `onChange?: (value: string | null) => void`
- `minValue?: string`
- `maxValue?: string`
- `hourCycle?: 12 | 24`
- `granularity?: 'hour' | 'minute' | 'second'`
- `hourStep?: number`
- `minuteStep?: number`
- `secondStep?: number`
- `isDisabled?: boolean`
- `isReadOnly?: boolean`
- `open?: boolean`
- `defaultOpen?: boolean`
- `onOpenChange?: (open: boolean, details: { reason, event?, cancel(), isCanceled }) => void`
- Null-first empty contract: when `value` and `defaultValue` are omitted, the empty state is `null`.
- `TimePicker.Input` exposes `aria-invalid` and `data-invalid` when the current segment draft is not committeable.

## Popover API

- `TimePicker.Popover` forwards `Popover.Content` props (for example `placement`, `offset`, `shouldFlip`, `boundaryElement`, `isNonModal`, and close behavior props).
- The following are controlled internally by `TimePicker` and are not accepted on `TimePicker.Popover`: `open`, `triggerRef`, `onOpenChange`, `id`.
- Defaults:
  - `placement` defaults to `bottom`.
  - `aria-label` defaults to `Time picker`.
  - `initialFocus` defaults to the first wheel column (`role="spinbutton"`).

## Wheel API

- `TimePicker.WheelColumn` renders one wheel (`role="spinbutton"`) for one editable segment (`hour`, `minute`, `second`, or `dayPeriod`).
- `TimePicker.WheelItem` renders one snap-aligned item (`data-wheel-item`) and is handled by the wheel container focus/selection model.

## TimePanel API

- `TimePicker.TimePanel` resolves visible wheel columns from root state (`granularity`, `hourCycle`) in stable order: `hour → minute? → second? → dayPeriod?`.
- `class?: string` uses default layout (`flex gap-2`) when omitted.
- `column?: Snippet<[TimePanelColumnInfo]>` allows custom per-column rendering.
- `TimePanelColumnInfo` shape:
  - `type: 'hour' | 'minute' | 'second' | 'dayPeriod'`
  - `label?: string`

## Notes

- Locale is read from `LocaleProvider` when available.
- Internally, values are normalized to 24-hour representation; 12-hour rendering only affects UI segments.
- `granularity='hour'` emits `HH:00` values.
- Min/max comparisons do not support midnight-wrapping ranges (`minValue > maxValue` is treated as out-of-range).
- Wheel selection commits immediately on snap; popover close is controlled by standard popover interactions (escape, outside press, programmatic close).
