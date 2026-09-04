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
- During segment editing, the committed value is set to `null` only when the draft spells no date at all — empty, incomplete, or impossible (31/02). A complete date that `minValue`/`maxValue`/`isDateUnavailable` reject is still committed; see the UX decision below.
- Current MVP focuses on date-only values.

## UX Decisions

- **No Date Auto-Correction:** The user can type a date out of the limits of `minValue` and `maxValue`, or an unavailable date. The DatePicker does not correct that date, and it does not remove it. It exposes `aria-invalid="true"` and `data-invalid` on the input, so the user sees what they typed and that it is refused. Auto-correcting input without explicit user consent is an inaccessible anti-pattern.
- A refused date is still a value: the component sends the date through `onChange` and `value`, also when the limits refuse it. With `null`, the input would show a date and your code would read an empty field. That is how a form prints "required" below a control that has a value. A refusal travels as an invalid state, and not as an absent value. Thus the layer with the rule, usually a form schema, writes the error text. Typing bypasses the bounds this way; the Calendar does not — a disabled day is never selectable by pointer or keyboard.
- Disabled dates keep the focus: in the Calendar, the keyboard still goes to a disabled date. Thus the ARIA grid navigation stays complete. A screen reader announces each cell and says "disabled". Without this, the focus would go past those cells and confuse the user.

## Focus behavior decisions

- DatePicker aligns with the shared modality primitive (`primitives/input-modality.ts`) for `keyboard`, `pointer`, and `virtual` interactions.
- `data-focus-visible` is modality-driven; `data-focused` and `data-focus-within` continue to represent real DOM focus state.
- Trigger focus restore after calendar close is modality-aware:
  - keyboard close paths keep visible focus,
  - pointer outside close restores focus without visible focus.
- The component calls `trackInteractionModality(...)` in its own handlers. Thus the modality is correct before the focus-state code runs.
- Cross-component focus contract and invariants are documented in `FOCUS_STATE_CONTRACT.md`.
