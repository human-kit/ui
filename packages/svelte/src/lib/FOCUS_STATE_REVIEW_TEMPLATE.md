# Focus State Review Template

## Usage

Template to validate focus-related changes without adding extra CI guardrails.
Fill this out for PRs that modify interaction, keyboard navigation, overlays, or focus-based styling.

## 1) Review Metadata

- PR/Branch:
- Component(s):
- Reviewer:
- Date:
- Verified browsers:
  - [ ] Chromium
  - [ ] Firefox
  - [ ] WebKit/Safari

## 2) Minimum Modality Matrix (per component)

> Mark **OK/NA/FAIL** and add a short note when failing.

| Scenario                           | What to validate                                                            | Status | Note |
| ---------------------------------- | --------------------------------------------------------------------------- | ------ | ---- |
| Keyboard (Tab/Arrow/Home/End/Page) | `data-*` and ARIA stay in sync with logical focus                           |        |      |
| Pointer (click/mousedown)          | do not elevate `data-focus-visible` by default                              |        |      |
| External blur                      | transient state cleanup (`data-focus-within`, `data-focus-visible`)         |        |      |
| Close restore (`escape-key`)       | trigger: `data-focused=true`, `data-focus-visible=true` (when applicable)   |        |      |
| Close restore (`outside-press`)    | trigger: `data-focused=true`, `data-focus-visible` absent (when applicable) |        |      |
| Programmatic focus                 | does not break invariants or leave stale state                              |        |      |

## 3) Required Invariants

- [ ] Never serialize `'false'` for `data-focused`, `data-focus-visible`, `data-focus-within`.
- [ ] On containers: `data-focus-visible => data-focus-within`.
- [ ] On items: `data-focus-visible => data-focused`.
- [ ] No visible desync between real focus, logical focus, and `data-*` attributes.

## 4) Component Status (living status)

> Use one row per component touched or audited.

| Component  | Status                            | Current coverage | Residual risk   | Owner |
| ---------- | --------------------------------- | ---------------- | --------------- | ----- |
| DatePicker | Contract-ready / Partial / Legacy | tests + manual   | low/medium/high |       |
| Popover    | Contract-ready / Partial / Legacy | tests + manual   | low/medium/high |       |
| ListBox    | Contract-ready / Partial / Legacy | tests + manual   | low/medium/high |       |
| ComboBox   | Contract-ready / Partial / Legacy | tests + manual   | low/medium/high |       |
| Dialog     | Contract-ready / Partial / Legacy | tests + manual   | low/medium/high |       |
| Calendar   | Contract-ready / Partial / Legacy | tests + manual   | low/medium/high |       |

## 5) PR Checklist

- [ ] If focus/keyboard/overlay behavior changed, tests were added or updated.
- [ ] Shared helper was used: `src/lib/test-utils/focus-contract.ts`.
- [ ] Focused suites for affected components were run.
- [ ] If the change was cross-cutting, full package test suite was run.

## 6) Suggested Commands

- Focused (example):
  - `pnpm run test -- --run src/lib/datepicker src/lib/popover src/lib/listbox src/lib/combobox src/lib/dialog src/lib/calendar`
- Full:
  - `pnpm run test -- --run`

## 7) Final Decision

- Final status: [ ] Approved [ ] Approved with risk [ ] Blocked
- Residual risk summary:
- Follow-up actions:
