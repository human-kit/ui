# TransferList TODO

## Goal

Track TransferList work with the repository TODO format.

## Backlog

- [x] [M][P0][Area: Architecture][Owner: Unassigned][Target: Done] Build the parts (`Root`, `Source`, `Target`, `Item`, `MoveSelected`, `MoveAll`, `Status`) by composing `ListBox`, so selection, keyboard navigation, typeahead and virtualization are inherited rather than reimplemented.
- [x] [M][P0][Area: State][Owner: Unassigned][Target: Done] Model the split as one source of truth: `items` plus an ordered `value` of the keys on the right, so `value` is what a form submits and the right-hand order needs no extra state.
- [x] [M][P0][Area: API][Owner: Unassigned][Target: Done] Support `bind:value`, `defaultValue` and opt-in `controlledValue`, never inferring controlled-ness from `value` being defined.
- [x] [M][P0][Area: Selection][Owner: Unassigned][Target: Done] Prune each side's selection against what is actually on it instead of clearing on request, so a controlled parent that rejects a move keeps the user's selection.
- [x] [M][P0][Area: Selection][Owner: Unassigned][Target: Done] Add anchor-based range selection to `ListBox` (Shift+click, Shift+Arrow, Shift+Home/End, Ctrl/Cmd+click) so moving many items is one gesture.
- [x] [M][P0][Area: Interaction][Owner: Unassigned][Target: Done] Move on double click, and keep `Enter` toggling selection so the multi-select listbox contract is not broken.
- [x] [M][P0][Area: States][Owner: Unassigned][Target: Done] Support `disabledKeys`: pinned items are skipped by move-all, left out of ranges, and ignored by double click.
- [x] [M][P0][Area: Focus][Owner: Unassigned][Target: Done] Place focus explicitly after every move — on the button while it still has work, on the destination list when it goes disabled, and on the row that replaced a double-clicked one.
- [x] [M][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Name the move buttons after their destination list rather than a direction, and announce each move through a polite live region.
- [x] [M][P0][Area: Testing][Owner: Unassigned][Target: Done] Cover moving, ordering, disabled items, button states, the three focus rules, controlled rejection, announcements, and SSR.
- [x] [S][P1][Area: Filtering][Owner: Unassigned][Target: Done] Add a per-side `filter` predicate (the input stays the consumer's), with move-all moving the filtered set — what a user expects with a filter applied.
- [x] [S][P1][Area: Interaction][Owner: Unassigned][Target: Done] Add `MoveUp` / `MoveDown` over the right-hand selection, keeping a contiguous block together and disabling at the ends.
- [x] [S][P1][Area: Data Model][Owner: Unassigned][Target: Done] Add a `name` prop that renders one hidden input per key, in order, so `value` submits without wiring.
- [x] [S][P2][Area: Selection][Owner: Unassigned][Target: Done] Make range selection reach rows a virtualized list never rendered, by giving `ListBox` a `getItemKey` to measure the range over the collection instead of the DOM.
- [x] [S][P2][Area: Interaction][Owner: Unassigned][Target: Done] Add `Ctrl`/`Cmd`+`Enter` to move the focused list's selection, advertised with `aria-keyshortcuts` and disableable with `moveShortcut`.
- [x] [C][P2][Area: Performance][Owner: Unassigned][Target: Done] Add a 2000-row demo exercising the `virtualizer` pass-through on both sides.
- [x] [M][P1][Area: Accessibility][Owner: Unassigned][Target: Done] Render `role="group"` on the Root once it has a name, so the two lists and the buttons are one control rather than unrelated ones.
- [ ] [S][P1][Area: Accessibility][Owner: Unassigned][Target: TBD] Decide between native `disabled` and `aria-disabled` on the move buttons: native removes them from the tab order, so half the actions are undiscoverable and the tab order shifts as the user works.
- [ ] [S][P2][Area: Accessibility][Owner: Unassigned][Target: TBD] Announce `Cmd+Enter` rather than `Control+Enter` in `aria-keyshortcuts` on Apple platforms, where both are accepted.
- [ ] [C][P3][Area: Interaction][Owner: Unassigned][Target: TBD] Evaluate drag and drop between the two lists as an alternative to the buttons.
- [ ] [C][P3][Area: Interaction][Owner: Unassigned][Target: TBD] Evaluate whether a filter should also constrain reordering, which today edits the whole `value`.
