# Calendar TODO

## MVP v1

- [x] Controlled/uncontrolled root (`value`, `defaultValue`, `onChange`)
- [x] Paginated navigation via `visibleMonths`
- [x] Single-date selection
- [x] `isDisabled`, `isReadOnly`, `isDateUnavailable` states
- [x] Keyboard-accessible grid (baseline)
- [x] Exports + docs page + initial tests

## Future

- [x] Range selection
- [ ] Multi-select
- [ ] Non-Gregorian calendar configuration
- [ ] Advanced unavailable API (ranges/collections)

### Advanced unavailable API (details)

Goal: evolve from `isDateUnavailable?: (date) => boolean` to an expressive, composable, and performant API for blocking dates in real-world scenarios.

#### 1) Functional requirements

- [ ] Keep compatibility with the current `isDateUnavailable`.
- [ ] Support `Set` of specific dates (`YYYY-MM-DD`) with O(1) lookup.
- [ ] Support closed ranges `{ start, end }`.
- [ ] Support recurring rules (for example: weekends, weekdays, dayOfWeek, dayOfMonth).
- [ ] Support rule composition:
  - [ ] `anyOf` (OR)
  - [ ] `allOf` (AND)
  - [ ] `except` (subtract dates/ranges)
- [ ] Support combined usage (function + set + ranges + recurring rules).

#### 2) Public API proposal

- [ ] Add optional `unavailable` prop in `Calendar.Root`.
- [ ] Base type design:
  - [ ] `CalendarDateSet = Set<CalendarDateValue> | CalendarDateValue[]`
  - [ ] `CalendarDateRange = { start: CalendarDateValue; end: CalendarDateValue }`
  - [ ] `CalendarRecurringRule`
  - [ ] `CalendarUnavailableRule = CalendarDateSet | CalendarDateRange | CalendarRecurringRule | ((date) => boolean)`
  - [ ] `CalendarUnavailableConfig = CalendarUnavailableRule | { anyOf?: ...; allOf?: ...; except?: ... }`
- [ ] Document precedence rules:
  - [ ] `except` first
  - [ ] then `allOf`
  - [ ] then `anyOf`
  - [ ] fallback to `false`
- [ ] Clearly define how `unavailable` coexists with `isDateUnavailable` (for example: final OR for backward compatibility).

#### 3) Validation and normalization

- [ ] Validate invalid dates and reversed ranges in a robust way.
- [ ] Normalize ranges (`start <= end`).
- [ ] Silently ignore invalid entries or expose a dev warning (decide strategy).
- [ ] Avoid runtime throws for partial input; prefer tolerant behavior.

#### 4) Performance and caching

- [ ] Compile `unavailable` to an internal predicate once per config change.
- [ ] Cache results per visible date (`Map<CalendarDateValue, boolean>`).
- [ ] Invalidate cache only when these change:
  - [ ] locale
  - [ ] visibleMonths
  - [ ] `isDateUnavailable`
  - [ ] `unavailable`
- [ ] Avoid expensive recomputation during pending range selection.
- [ ] Keep low complexity in `isDateDisabled` (prefer amortized O(1)).

#### 5) Range mode integration

- [ ] `isRangePathSelectable` must use the same unavailable source of truth.
- [ ] If `except` exists, ensure endpoints and intermediate days follow the final composed rule.
- [ ] Keep mouse hover preview and keyboard preview consistent.

#### 6) Testing

- [ ] Unit tests for unavailable parser/normalizer.
- [ ] Compatibility tests with legacy `isDateUnavailable`.
- [ ] Tests by type:
  - [ ] date sets
  - [ ] ranges
  - [ ] recurring rules
  - [ ] `anyOf`/`allOf`/`except` composition
- [ ] Interaction tests (click/keyboard/range preview/confirm/cancel).
- [ ] Performance tests (no unnecessary recomputation during selection and focus).

#### 7) Documentation

- [ ] Calendar README section for "Advanced unavailable".
- [ ] Usage examples:
  - [ ] block weekends
  - [ ] block holidays (set)
  - [ ] blackout by range
  - [ ] composition with exceptions
- [ ] Migration notes from current `isDateUnavailable`.

#### 8) Demo

- [ ] Extend docs demo with unavailable strategy selector.
- [ ] Show derived state (active rule + visible blocked dates).
- [ ] Include composition example (`anyOf` + `except`).

#### 9) Completion criteria

- [ ] `bun typecheck` passes without errors.
- [ ] Calendar test suite is green.
- [ ] Backward compatibility is verified.
- [ ] API is documented with real examples.
