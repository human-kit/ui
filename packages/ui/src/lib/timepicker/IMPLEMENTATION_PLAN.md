# TimePicker Implementation Plan

## Scope

Implement all open items from `TODO.md` in one delivery, prioritizing correctness and stability first, then accessibility/performance, and finally coverage hardening.

## Goals

- Fix state/event correctness regressions first.
- Keep wheel interaction fluid while improving robustness.
- Add missing accessibility semantics without introducing noisy behavior.
- Apply low-risk performance improvements.
- Expand tests to protect the full wheel pipeline.

## Phase 1 — Correctness (P0/P1 behavior)

### 1a) Allow external clearing via `value = undefined`

**Files**

- `root/time-picker-root.svelte`

**Changes**

- Remove the `if (value === undefined) return;` early-return in the `$effect` that observes `value`.
- When `value` becomes `undefined`, treat it as an explicit clear: reset `segmentDraft` to empty, set `valueInternal = null`, and publish `null` via `publishCommittedValue`.

**Risk**

- Controlled/uncontrolled sync regressions — initial mount with `value={undefined}` must not trigger a spurious publish.

**Validation**

- `pnpm run test -- --run src/lib/timepicker/root/time-picker-root.test.ts`

### 1b) Publish `null` when all segments are cleared

**Files**

- `root/time-picker-root.svelte`

**Changes**

- In `commitFromDraft`, when `buildTimePartsFromDraft` returns `null` **and** `hasAnyRequiredValue` is `false` (every segment is empty), call `publishCommittedValue(null)` instead of doing a silent return.
- This ensures `bind:value` transitions from a valid time to `null` when the user backspaces every segment.

**Risk**

- Must avoid re-publishing `null` on every keystroke while segments are partially filled — the `hasAnyRequiredValue === true` path already handles that correctly.

**Validation**

- `pnpm run test -- --run src/lib/timepicker/root/time-picker-root.test.ts`

### 2) Event forwarding consistency

**Files**

- `input/time-picker-input.svelte`
- `trigger/time-picker-trigger.svelte`
  **Changes**

- Compose external/internal handlers consistently.

- User handlers accidentally suppress internal logic.

- `pnpm run test -- --run src/lib/timepicker/input/time-picker-input.test.ts src/lib/timepicker/trigger/time-picker-trigger.test.ts`

- Add safety restoration to current draft value when drift is detected.

**Policy**

- Implement guard + restore strategy aligned with TODO note.
  **Risk**

- IME/paste edge cases and cross-browser input events.
  **Validation**

- `pnpm run test -- --run src/lib/timepicker/segment/time-picker-segment.test.ts`

**Files**

- `segment/time-picker-segment.svelte`

- Use explicit 12h boundaries (`1`/`12`) instead of relying on clamping side effects.

- Segment keyboard tests in same run as above.

---

## Phase 2 — Wheel stability and interaction quality

### 5) Wheel settle behavior and anchor sync

**Files**
**Changes**

- Increase scroll debounce fallback from 64ms to 120ms. The debounce only fires in browsers without native `scrollend` support, so higher values do not affect perceived latency. 120ms is conservative enough to avoid interrupting touch momentum on iOS Safari.
  **Risk**

- Async timing loops (`scroll`, `scrollend`, debounce). The silent flag must be cleared reliably (on `scrollend` or animation completion).
  **Validation**

- `pnpm run test -- --run src/lib/clock/wheel-column/clock-wheel-column.test.ts src/lib/clock/panel/clock-panel.test.ts`

### 6) ResizeObserver loop mitigation

**Files**

- `../clock/wheel-column/clock-wheel-column.svelte`
- Batch measurement updates through `requestAnimationFrame` to reduce observer-loop warnings.

**Validation**

- Re-run wheel and root tests:
- `pnpm run test -- --run src/lib/clock/wheel-column/clock-wheel-column.test.ts src/lib/timepicker/root/time-picker-root.test.ts`

## Phase 3 — Accessibility and API surface

### 7) Wheel announcements and semantics

- `../clock/wheel-column/clock-wheel-column.svelte`

**Changes**

- Add `aria-roledescription` on wheel spinbutton.

**Risk**

- Over-announcement/noise for SR users.

### 8) `isRequired` propagation

**Files**

- `root/time-picker-root.svelte`
- `root/context.ts`
- `input/time-picker-input.svelte`
- `README.md`

- Add `isRequired` to root API and context.
- Expose `aria-required` on input group.
- Document API addition.

- Input/root tests + typecheck.

- `../clock/wheel-item/clock-wheel-item.svelte`

**Changes**

- Remove default visual inline styles (opacity, cursor, font-weight, etc.) entirely. The component becomes fully headless — consumers style via `data-selected`, `data-disabled`, `data-centered` attributes.
- This aligns WheelItem with the rest of the library where components ship zero visual opinions.
  **Risk**

- Technically breaking for anyone relying on the default inline styles. Acceptable at current maturity — the component is new and the old styles were inconsistent (all dropped when `class` was passed).

## Phase 4 — Performance and code cleanup

### 10) Formatter and locale caching

- `root/time-picker-root.svelte`
- `root/time-utils.ts`
  **Changes**

- Cache `Intl.DateTimeFormat` by `locale` + `hourCycle` + `granularity`.
- Cache system-locale fallback once per component lifetime.

**Files**

**Changes**

- Skip disabled candidate computation when no min/max is set.

### 12) Low-risk code quality cleanups

**Files**

- `root/time-utils.ts`
- `root/time-picker-root.svelte`

**Changes**

- Remove unreachable min>max branch in `isTimeOutOfRange`.
- Replace meaningless ternary `type === 'hour' ? 2 : 2` with constant.

**Validation**

## Phase 5 — Test hardening

### 13) Wheel test matrix expansion

**Add coverage for**

- Open alignment and external value sync.
- Focus contract (`data-focus-within`, `data-focus-visible`).
- Min/max disabled behavior.

### 14) End-to-end wheel integration test

**Files**

- `root/time-picker-root.test.ts` and/or `wheel-column/time-picker-wheel-column.test.ts`

**Flow to cover**

- Wheel interaction → snap → `selectWheelValue` → root commit → segment UI + bound value sync.

### 15) Segment paste/IME resilience tests

**Files**

- `segment/time-picker-segment.test.ts`

**Cases**

- Paste attempts do not corrupt draft.
- Input DOM restores to draft when mutation bypass happens.

---

## Execution Order (Single PR)

1. Phase 1
2. Phase 2
3. Phase 3
4. Phase 4
5. Phase 5

This order minimizes risk: behavior correctness first, wheel timing second, API/accessibility third, refactors fourth, broad tests last.

## Verification Checklist

### Targeted runs after each phase

- `pnpm run test -- --run src/lib/timepicker/root/time-picker-root.test.ts`
- `pnpm run test -- --run src/lib/timepicker/input/time-picker-input.test.ts src/lib/timepicker/trigger/time-picker-trigger.test.ts`
- `pnpm run test -- --run src/lib/timepicker/segment/time-picker-segment.test.ts`
- `pnpm run test -- --run src/lib/clock/wheel-column/clock-wheel-column.test.ts src/lib/clock/panel/clock-panel.test.ts`
- `pnpm run test -- --run src/lib/timepicker/root/time-utils.test.ts`

### Final gate

- `pnpm run typecheck`
- `pnpm run test -- --run`
- `pnpm run lint`
- `pnpm run build`
- `pnpm exec changeset` — generate changeset file (CI requires it for `packages/ui/src/**` changes)

## Notes

- Debounce increase (64→120ms) is safe because it only acts as a fallback for browsers without `scrollend`. Modern browsers use `scrollend` as the primary settle signal.
- Preserve existing public APIs except where TODO explicitly requests additions (`isRequired`) or removals (WheelItem default styles).
- Phase 5 tests must be written against the corrected behavior from Phases 1-4, not against the current (buggy) behavior.
- Update docs/tests together with behavior changes to keep CI stable.
