# ComboBox Status

## API reference

### ComboBox.Status

Name: `ComboBox.Status`  
Description: Visually-hidden `aria-live="polite"` region that announces the number of results visible in the popover as the filter changes.

| Prop            | Type                        | Default     | Description                                                                                 |
| --------------- | --------------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| `formatMessage` | `(count: number) => string` | `undefined` | Builds the announced message from the visible item count. Defaults to a localized message. |

## Notes

- The count includes disabled-but-visible items, matching what is rendered on screen.
- The default message is localized through `LocaleProvider` (`combobox.noResults`, `combobox.oneResult`, `combobox.multipleResults`).
- The region only announces while the popover is open; when closed it renders an empty message, so closing never announces "no results".
- Mirrors `Autocomplete.Status`.
