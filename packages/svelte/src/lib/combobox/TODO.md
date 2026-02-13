# ComboBox - Code Review & TODOs

Comprehensive review based on: **Accessibility**, **Scalability**, **Performance**, **Svelte 5 Runes Best Practices**.

---

## Accessibility

### Completed (Accessibility)

- [x] ARIA pattern: `aria-activedescendant` for virtual focus
- [x] `aria-expanded`, `aria-haspopup`, `aria-controls` on input
- [x] `aria-label` on ListBox
- [x] `role="combobox"`, `role="listbox"`, `role="option"`
- [x] `aria-selected` on selected items
- [x] `aria-disabled` on disabled items/placeholder
- [x] Input supports `aria-label` and `aria-labelledby` props
- [x] ListBox has an ID so `aria-controls` works correctly
- [x] Button has `aria-controls` pointing to the listbox
- [x] Wrapper group supports `aria-label` and `aria-labelledby`
- [x] Input supports `aria-describedby` for usage instructions

### Pending (Accessibility)

- [ ] **Live regions for result count**
  - Add `<div aria-live="polite">` to announce "{N} results available" while filtering
  - Important for screen readers that cannot see visual updates

- [ ] **Selection announcement**
  - Announce "Selected item: {label}" when an item is selected
  - Use `aria-live="assertive"` for important changes

- [ ] **Support for groups (sections)**
  - Implement `role="group"` with `aria-labelledby` for sections
  - Add `ComboBox.Section` component

---

## Scalability

### Completed (Scalability)

- [x] Reusable `useVirtualFocus` hook
- [x] Controlled/uncontrolled mode
- [x] Automatic item filtering
- [x] Reactive `emptyPlaceholder`

### Pending (Scalability)

- [ ] **Customizable `filterFn` prop**
  - Filtering is currently case-insensitive includes
  - Allow: fuzzy search, startsWith, exact match, async search

- [ ] **`allowCreate` prop**
  - Allow creating new items when there is no match
  - Callback `onCreate?: (value: string) => void`

- [x] **Multiple selection UI**
  - Chips/tags for selected items: `ComboBox.Tags`, `ComboBox.Tag`, `ComboBox.TagRemove`
  - Clear-all button (available via `clearSelection()` in context)
  - Selected-count indicator (available via `selectedValue.size`)
  - Keyboard tag navigation (ArrowLeft/Right, Delete/Backspace)
  - `ComboBox.ItemIndicator` to show checks for selected items

- [ ] **Form integration**
  - `name` prop for native `<form>`
  - Hidden input with serialized value
  - Validation with `required`, `aria-invalid`

- [ ] **Async data support**
  - Props: `isLoading`, `loadingPlaceholder`
  - Callback: `onLoadMore` for infinite scroll
  - Built-in debounce for async search

- [ ] **Virtualization**
  - For large lists (>100 items)
  - Integrate with `@tanstack/virtual` or similar

---

## Performance

### Completed (Performance)

- [x] DOM query cache with invalidation (`cachedItemOrder`)
- [x] `untrack()` to avoid infinite effect loops
- [x] Subscription pattern for reactive `itemCount`
- [x] Scoped queries via `containerRef`

### Pending (Performance)

- [ ] **`isVisible` memoization in ListBoxItem**
  - It is currently recomputed on each render
  - Consider more granular memoization with `$derived`

- [ ] **Batch registration**
  - `registerItem` runs once per individual item
  - For large lists, consider batched notifications

- [ ] **Lazy `itemLabels`**
  - The `itemLabels` map grows with each item
  - Cleanup on unmount is implemented, but consider `WeakMap`

- [ ] **Effect cleanup optimizations**
  - Review effects that could be consolidated
  - `combobox-listboxitem.svelte` has 2 effects that might become 1

---

## Svelte 5 Runes Best Practices

### Completed (Runes)

- [x] `$state` for reactive state
- [x] `$derived` for computed values
- [x] `$effect` with cleanup functions
- [x] `$bindable` for two-way binding
- [x] `$props()` for destructuring
- [x] `untrack()` to avoid unnecessary re-runs
- [x] `$derived(expression)` instead of `$derived(() => ...)` - simplified in `combobox-listboxitem.svelte`
- [x] Consolidated effects - using 1 `$effect` + `onDestroy` instead of 2 effects

### Reviewed - No Changes Required

- [x] **`$effect.pre`**: Reviewed - no race conditions requiring it
- [x] **Context typing**: Single shared type is appropriate - tree-shaking does not apply to context objects

---

## Testing

### Completed (Testing)

- [x] 291 passing unit tests
- [x] Keyboard navigation tests
- [x] Selection tests
- [x] Filtering tests
- [x] Empty placeholder tests
- [x] ARIA accessibility tests (6 tests)
- [x] Edge cases: rapid typing, whitespace, backspace
- [x] Disabled/ReadOnly state tests
- [x] Trigger modes (focus, input, manual)
- [x] Selection behavior (Enter, click, Escape restoration)
- [x] Multi-select tests (12 tests)
- [x] Tags component tests (4 tests)
- [x] Tag component tests (13 tests) - includes keyboard navigation
- [x] TagRemove component tests (6 tests)
- [x] ItemIndicator component tests (5 tests)

### Pending (Testing)

- [ ] **Tests with many items (100+)** - performance tests
- [ ] **Visual regression tests** - state screenshots

---

## Documentation

- [ ] **Complete JSDoc**
  - Document all public props
  - Add usage examples in comments

- [ ] **Storybook/Demo page**
  - Interactive examples for all use cases
  - States: loading, error, disabled, readonly

---

## Prioritized Next Steps

1. **Live regions** (accessibility - high impact)
2. **Form integration** (usability - common cases)
3. **Customizable `filterFn`** (scalability)
4. **Consolidate effects** (performance/best practices)
5. **Async data support** (scalability)
