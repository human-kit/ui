# NumberField TODO

## Goal

Track NumberField work with a single mandatory TODO format.

## Backlog

- [x] [M][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Fix ARIA while the user edits partial or invalid text. When visible `inputValue` no longer represents the committed numeric `value`, avoid exposing stale `aria-valuenow` and `aria-valuetext`; track whether the draft is synced, partial, invalid, or out of range; add tests for `-`, `.`, invalid text, and partial localized numbers after a valid previous value.
- [x] [M][P0][Area: State][Owner: Unassigned][Target: Done] Define and implement the `allowOutOfRange` contract. Decide whether `allowOutOfRange={false}` clamps immediately, rejects publishing out-of-range typing, or keeps draft text without updating `bind:value`; ensure `allowOutOfRange={true}` allows direct text entry outside `min`/`max` while steppers, wheel, and scrub still clamp; add tests for both modes.
- [x] [S][P1][Area: Locale][Owner: Unassigned][Target: Done] Initialize formatted text from `LocaleProvider` instead of the runtime fallback locale to avoid first-paint or hydration mismatch. Add a test with `LocaleProvider locale="hi-IN-u-nu-deva"` or `ar-EG-u-nu-arab"` and a non-null `defaultValue`.
- [x] [M][P1][Area: Forms][Owner: Unassigned][Target: Done] Clarify and implement form validation behavior. NumberField marks ARIA/data invalid state, but native form submission is not blocked because the visible input is `type="text"` and range constraints are ARIA-only; decide whether to set custom validity on the visible input or hidden form input; add tests for required, min/max, invalid draft text, and form submission.
- [x] [S][P1][Area: Accessibility][Owner: Unassigned][Target: Done] Revisit localized default button labels. `incrementAriaLabel` and `decrementAriaLabel` are customizable, but defaults are hardcoded in English; decide whether defaults should come from a small locale map or remain documented as consumer-provided labels for non-English UIs.
- [x] [M][P1][Area: Testing][Owner: Unassigned][Target: Done] Add parser and formatter tests for non-Latin numbering systems. Cover `hi-IN-u-nu-deva` and `ar-EG-u-nu-arab`, verifying both display formatting and typed localized digits update raw `bind:value`.
- [x] [S][P1][Area: Testing][Owner: Unassigned][Target: Done] Add percent parsing edge-case tests. Document and verify that with `formatOptions={{ style: 'percent' }}`, typing `50` represents `50`; typing `0.5` represents `0.5` when fraction digits are allowed, and normalizes to `5` when they are not.
- [x] [S][P1][Area: Testing][Owner: Unassigned][Target: Done] Add press-and-hold boundary tests. Holding increment should stop at `max`, holding decrement should stop at `min`, and pointer release, pointer cancel, and pointer leave should stop repeat timers.
- [x] [S][P1][Area: Testing][Owner: Unassigned][Target: Done] Add focus contract regression tests. Ensure only `NumberField.Input` can expose `data-focused` and `data-focus-visible`, and ensure `Root` and `Group` expose only `data-focus-within` for container focus state.
