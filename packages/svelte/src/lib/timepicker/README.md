# TimePicker

## Description

`TimePicker` composes a segmented time input with a popover containing selectable time columns.

## Anatomy

- `TimePicker.Root`
- `TimePicker.Input`
- `TimePicker.Segment`
- `TimePicker.Trigger`
- `TimePicker.Popover`
- `TimePicker.TimePanel`
- `TimePicker.Column`
- `TimePicker.ColumnCell`

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
   <TimePicker.Column type={col.type} class="max-h-44 overflow-auto rounded-md">
    {#snippet children(option)}
     <TimePicker.ColumnCell type={col.type} {option} class="..." />
    {/snippet}
   </TimePicker.Column>
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
- `shouldCloseOnSelect?: boolean` (default: `false`)
- `closeOnSelect?: boolean` (legacy alias)
- Null-first empty contract: when `value` and `defaultValue` are omitted, the empty state is `null`.
- `TimePicker.Input` exposes `aria-invalid` and `data-invalid` when the current segment draft is not committeable.

## Popover API

- `TimePicker.Popover` forwards `Popover.Content` props (for example `placement`, `offset`, `shouldFlip`, `boundaryElement`, `isNonModal`, and close behavior props).
- The following are controlled internally by `TimePicker` and are not accepted on `TimePicker.Popover`: `open`, `triggerRef`, `onOpenChange`, `id`.
- Defaults:
  - `placement` defaults to `bottom`.
  - `aria-label` defaults to `Time picker`.
  - `initialFocus` defaults to the selected option, or the first available option.

## Column API

- `TimePicker.Column` renders a `listbox` for one editable segment (`hour`, `minute`, `second`, or `dayPeriod`).
- `TimePicker.ColumnCell` renders an `option` and syncs selection with root draft/value state.

## TimePanel API

- `TimePicker.TimePanel` resolves visible columns from root state (`granularity`, `hourCycle`) in stable order: `hour → minute? → second? → dayPeriod?`.
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
