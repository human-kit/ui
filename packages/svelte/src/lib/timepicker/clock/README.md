# TimePicker Clock

## API reference

### TimePicker.Clock

Name: `TimePicker.Clock`  
Description: Clock panel composition part that resolves visible wheel columns from `TimePicker.Root` state.

| Prop           | Type                             | Default                      | Description                                             |
| -------------- | -------------------------------- | ---------------------------- | ------------------------------------------------------- |
| `column`       | `Snippet<[ClockColumnInfo]>`     | `undefined`                  | Optional custom per-column renderer.                    |
| `class`        | `string`                         | `'flex items-stretch gap-2'` | CSS class names for the clock container.                |
| `...restProps` | `HTMLAttributes<HTMLDivElement>` | `-`                          | Additional attributes forwarded to the clock container. |
