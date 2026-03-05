# Calendar BodyCell

## API reference

### Calendar.BodyCell

Name: `Calendar.BodyCell`  
Description: Wrapper part for date grid cells inside `Calendar.GridBody`.

| Prop           | Type                                   | Default     | Description                                                     |
| -------------- | -------------------------------------- | ----------- | --------------------------------------------------------------- |
| `date`         | `string`                               | `required`  | Calendar date value rendered by the cell (`YYYY-MM-DD`).        |
| `children`     | `Snippet<[string]>`                    | `undefined` | Optional custom renderer receiving the day label text.          |
| `class`        | `string`                               | `''`        | CSS class names for the inner gridcell element.                 |
| `...restProps` | `HTMLAttributes<HTMLTableCellElement>` | `-`         | Additional attributes forwarded to the outer table cell (`td`). |
