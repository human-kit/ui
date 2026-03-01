# TimePicker TODO

## Goal

Track TimePicker work with a single mandatory TODO format.

## Backlog

- [x] [M][P0][Area: Parsing][Owner: Unassigned][Target: TBD] Make time parsing strict so invalid strings like "1.5:30" or ":30" are rejected. *(Already implemented via `isValidTimePickerValue` regex. `parseTimePickerValue` now returns `null` for invalid input.)*
- [x] [S][P0][Area: Validation][Owner: Unassigned][Target: TBD] Guard 12h draft conversion against invalid hour values outside 1-12. *(Already implemented in `buildTimePartsFromDraft`.)*
- [x] [M][P0][Area: Input][Owner: Unassigned][Target: TBD] Apply step clamping on typed values when segment edit is confirmed. *(Already implemented in `setSegmentValue` via `clampToStep`.)*
- [x] [S][P0][Area: Formatting][Owner: Unassigned][Target: TBD] Force "HH:00" output for hour granularity regardless of leftover minutes. *(Already implemented in `formatTimePickerValue`.)*
- [x] [S][P0][Area: Validation][Owner: Unassigned][Target: TBD] Treat missing dayPeriod as invalid in 12h draft-to-24h conversion. *(Already implemented in `buildTimePartsFromDraft`.)*
- [x] [M][P1][Area: Locale][Owner: Unassigned][Target: TBD] Build segment order and literals from Intl formatToParts instead of hardcoded templates. *(Already implemented in `buildTimePickerSegments`.)*
- [x] [S][P1][Area: Validation][Owner: Unassigned][Target: TBD] Compare min/max using the active granularity to avoid false out-of-range states. *(Fixed: `isTimeOutOfRange` now accepts `granularity` and truncates before comparison.)*
- [x] [S][P1][Area: Accessibility][Owner: Unassigned][Target: TBD] Ensure time picker columns and options expose complete listbox/option ARIA contract. *(Already implemented in column/column-cell components.)*
- [x] [S][P1][Area: Composition][Owner: Unassigned][Target: TBD] Wire selection-close behavior so `shouldCloseOnSelect` controls whether column selection closes popover when draft is complete. *(Implemented in `selectColumnOption`; default is `false`.)*
- [x] [S][P2][Area: Accessibility][Owner: Unassigned][Target: TBD] Verify dayPeriod segment uses 0-1 ARIA bounds and localized value text. *(Fixed: segment now uses `timePicker.hourCycle` for correct `aria-valuemin`/`aria-valuemax`.)*
- [x] [S][P2][Area: Testing][Owner: Unassigned][Target: TBD] Ensure segment data attributes are consistent for styling and test selectors. *(Already implemented: `data-time-picker-segment="true"`.)*
- [x] [M][P2][Area: Testing][Owner: Unassigned][Target: TBD] Expand unit coverage for parsing, format output, 12h conversion, clamping, and draft evaluation pipeline. *(Added 47 unit tests in `time-utils.test.ts`.)*
- [x] [S][P2][Area: Documentation][Owner: Unassigned][Target: TBD] Add TimePicker references to focus contract documentation. *(Added component coverage section to `FOCUS_STATE_CONTRACT.md`.)*

## Notes

TimePicker locale is sourced from LocaleProvider, not from a root locale prop.
