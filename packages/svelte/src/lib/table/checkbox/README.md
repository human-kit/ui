# Table.Checkbox

## API reference

### Table.Checkbox

Name: `Table.Checkbox`
Description: Headless selection-aware checkbox root for tables. In body cells it toggles the owning row. In header cells it becomes a select-all checkbox for multiple selection mode.

| Prop              | Type                                       | Default     | Description                                                                                             |
| ----------------- | ------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------- |
| `id`              | `string`                                   | `undefined` | Optional id forwarded to the composed checkbox root.                                                    |
| `title`           | `string`                                   | `undefined` | Optional title forwarded to the composed checkbox root.                                                 |
| `style`           | `HTMLAttributes<HTMLSpanElement>['style']` | `undefined` | Optional inline style forwarded to the composed checkbox root.                                          |
| `data-testid`     | `string`                                   | `undefined` | Test id forwarded to the composed checkbox root.                                                        |
| `children`        | `Snippet`                                  | `undefined` | Composed child content, typically `Table.CheckboxIndicator`.                                            |
| `class`           | `string`                                   | `''`        | CSS class names for the composed checkbox root element.                                                 |
| `aria-label`      | `string`                                   | `undefined` | Accessible label override. Defaults to `Select all rows` in headers and `Select row <id>` in body rows. |
| `aria-labelledby` | `string`                                   | `undefined` | Accessible label source id when the checkbox should be named by external content.                       |

## Usage notes

- Use `Table.Checkbox` inside `Table.Cell` or `Table.ColumnHeaderCell`.
- In body rows it mirrors and toggles the row selection state.
- In header cells it only renders when `selectionMode="multiple"` and toggles all selectable rows.
- When `selectionMode="none"`, the part renders nothing.
- `Table.Checkbox` is headless and unstyled. Apply classes from the consumer or docs layer.
- The checkbox receives DOM focus directly and is the intended visible focus target for selection controls inside the table.

```svelte
<Table.Cell>
	<Table.Checkbox class="inline-flex h-5 w-5 items-center justify-center rounded border">
		<Table.CheckboxIndicator>
			<CheckIcon class="h-3.5 w-3.5" />
		</Table.CheckboxIndicator>
	</Table.Checkbox>
</Table.Cell>
```
