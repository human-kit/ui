# ListBox TODO

## Goal

Track ListBox work with the repository TODO format.

## Backlog

- [x] [M][P0][Area: Selection][Owner: Unassigned][Target: Done] Add anchor-based range selection: Shift+click, Shift+Arrow, Shift+Home/End, and Ctrl/Cmd+click to toggle one option even under `selectionBehavior="replace"`.
- [x] [M][P1][Area: Accessibility][Owner: Unassigned][Target: Done] Write `aria-setsize` / `aria-posinset` on the rows of a virtualized list, which otherwise reports the size of the rendered window rather than of the collection.
- [x] [S][P1][Area: Accessibility][Owner: Unassigned][Target: Done] Accept `aria-labelledby`, for a list that already has a visible heading.
- [x] [S][P1][Area: API][Owner: Unassigned][Target: Done] Forward unknown props to the element, composing the handlers the listbox owns instead of letting a consumer's replace them.
- [ ] [S][P1][Area: Interaction][Owner: Unassigned][Target: TBD] Make `Home` / `End` reach the ends of a virtualized collection. They walk the rendered options, so today they stop at the edge of the window — which also caps what `Shift+Home` / `Shift+End` can select.
- [ ] [C][P2][Area: Selection][Owner: Unassigned][Target: TBD] Evaluate `Shift+Space` to extend the selection from the anchor to the focused option, which pairs with the arrow-key range.
