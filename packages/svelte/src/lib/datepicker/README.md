# DatePicker

## Description

`DatePicker` composes a segmented date input with a calendar popover for selecting dates.

## Anatomy

- `DatePicker.Root`
- `DatePicker.Input`
- `DatePicker.Segment`
- `DatePicker.Trigger`
- `DatePicker.Popover`
- `DatePicker.Calendar`
- `DatePicker.TriggerPrevious`
- `DatePicker.Heading`
- `DatePicker.TriggerNext`
- `DatePicker.Grid`
- `DatePicker.GridHeader`
- `DatePicker.HeaderCell`
- `DatePicker.GridBody`
- `DatePicker.BodyCell`

```svelte
<DatePicker.Root>
	<DatePicker.Input aria-label="Date input">
		{#snippet children(segment)}
			<DatePicker.Segment {segment} />
		{/snippet}
	</DatePicker.Input>
	<DatePicker.Trigger />

	<DatePicker.Popover>
		<DatePicker.Calendar>
			<div>
				<DatePicker.TriggerPrevious />
				<DatePicker.Heading />
				<DatePicker.TriggerNext />
			</div>
			<DatePicker.Grid>
				<DatePicker.GridHeader />
				<DatePicker.GridBody />
			</DatePicker.Grid>
		</DatePicker.Calendar>
	</DatePicker.Popover>
</DatePicker.Root>
```

## Root API

- `value?: string | null` (`YYYY-MM-DD`)
- `defaultValue?: string | null` (`YYYY-MM-DD`)
- `onChange?: (value: string | null) => void`
- `disabled?: boolean`
- `readonly?: boolean`
- `minValue?: string` (`YYYY-MM-DD`)
- `maxValue?: string` (`YYYY-MM-DD`)
- `isDateUnavailable?: (date: string) => boolean`
- `open?: boolean`
- `defaultOpen?: boolean`
- `onOpenChange?: (open: boolean, details: { reason, event?, cancel(), isCanceled }) => void`
- `closeOnSelect?: boolean`
- Null-first empty contract: when `value` and `defaultValue` are omitted, the empty state is `null`.
- `DatePicker.Input` exposes `aria-invalid` and `data-invalid` when the current segment draft is not committeable.

## Popover API

- `DatePicker.Popover` forwards `Popover.Content` props (for example `placement`, `offset`, `shouldFlip`, `boundaryElement`, `nonModal`, and close behavior props).
- The following are controlled internally by `DatePicker` and are not accepted on `DatePicker.Popover`: `open`, `triggerRef`, `onOpenChange`, `id`.
- Defaults:
  - `placement` defaults to `bottom-start`.
  - `aria-label` defaults to `Calendar`.
  - `initialFocus` defaults to focusing the current active day cell in the calendar grid.

## Calendar API

- `DatePicker.Calendar` forwards `Calendar.Root` props except those controlled by `DatePicker.Root`.
- The following are controlled internally by `DatePicker` and are not accepted on `DatePicker.Calendar`: `selectionMode`, `value`, `defaultValue`, `onChange`, `disabled`, `readonly`, `isDateUnavailable`.

## Notes

- Locale is read from `LocaleProvider` when available.
- Segment accessible names are resolved automatically from the active locale.
- During segment editing, the committed value is set to `null` when the draft is incomplete, invalid, out-of-range, or unavailable.
- Current MVP focuses on date-only values.

## UX Decisions

- **No Date Auto-Correction:** When users manually type dates out of the configured bounds (`minValue`/`maxValue`) or dates that are unavailable, the DatePicker **does not auto-correct** the typed value. Instead, it exposes `aria-invalid="true"` and `data-invalid` on the input, allowing the user to see what they typed incorrectly. The underlying committed value is kept as `null` until a valid date is completed. Auto-correcting input without explicit user consent is an inaccessible anti-pattern.
- **Navigable Disabled Dates:** When using the Calendar, disabled dates remain focusable via keyboard navigation. This ensures ARIA Grid spatial navigation parity so that screen readers can consistently announce all calendar cells and report them as "disabled", rather than skipping over them and disorienting the user.

## Focus behavior decisions

- DatePicker aligns with the shared modality primitive (`primitives/input-modality.ts`) for `keyboard`, `pointer`, and `virtual` interactions.
- `data-focus-visible` is modality-driven; `data-focused` and `data-focus-within` continue to represent real DOM focus state.
- Trigger focus restore after calendar close is modality-aware:
  - keyboard close paths keep visible focus,
  - pointer outside close restores focus without visible focus.
- The component keeps explicit `trackInteractionModality(...)` calls in local handlers to ensure deterministic modality updates before local focus-state logic runs.
- Cross-component focus contract and invariants are documented in `FOCUS_STATE_CONTRACT.md`.
