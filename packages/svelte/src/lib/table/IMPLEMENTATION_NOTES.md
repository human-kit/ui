# Table Implementation Notes

## Open questions

- Disabled body rows are currently rendered and keyboard-focusable, but they cannot be selected. We should validate whether this matches the desired UX.
- `Table.Column` is implemented as a logical wrapper and currently assumes the intended child is a single `Table.ColumnHeaderCell`.
- Controlled clearing of `sortDescriptor` back to an undefined state may need a stricter contract or an explicit escape hatch.
- `Table.Footer` renders semantic table cells but is intentionally excluded from the roving-focus model in v1.
- Interactive controls nested inside `Table.Cell` are still intentionally out of scope for v1.
