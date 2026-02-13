# ComboBox Button

## API reference

### ComboBox.Button

Name: `ComboBox.Button`  
Description: Optional trigger button that toggles the combobox popover without stealing focus from the input.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `class` | `string` | `undefined` | CSS class names for the button element. |
| `children` | `Snippet` | `undefined` | Custom trigger content. If omitted, a chevron icon is rendered. |
| `tabindex` | `number` | `-1` | Tab index applied to the button. |
| `...restProps` | `HTMLButtonAttributes` | `-` | Additional native button attributes. |
