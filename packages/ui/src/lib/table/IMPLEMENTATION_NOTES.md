# Table Implementation Notes

## Open questions

- Disabled body rows are currently rendered and treated with an all-or-nothing disabled model. The planned `disabledBehavior` API (`'selection' | 'all'`) will require splitting focus/action disabling from selection disabling.
- `Table.Column` is implemented as a logical wrapper and currently assumes the intended child is a single `Table.ColumnHeaderCell`.
- `Table.Footer` renders semantic table cells but is intentionally excluded from the roving-focus model in v1.
- Interactive controls nested inside `Table.Cell` are still intentionally out of scope for v1.
- `pressRow()` is currently selection-oriented. The planned `onRowAction` feature will require a clearer interaction pipeline so pointer click, double click, `Enter`, and `Space` can route to action and selection independently.
