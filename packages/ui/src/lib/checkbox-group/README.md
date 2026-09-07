# CheckboxGroup

## Description

`CheckboxGroup` coordinates several `Checkbox.Root` boxes as one field. It holds an array value,
and it shares a `name` for form submission. It also spreads group-wide disabled, read-only and
required state, and it reports the counts a parent "select all" checkbox needs.

## Anatomy

- `CheckboxGroup.Root`
- `CheckboxGroup.Item`
- `CheckboxGroup.Indicator`

```svelte
<CheckboxGroup.Root name="colors" defaultValue={['red']} aria-label="Colors">
	<Checkbox.Root value="red">
		<Checkbox.Indicator>x</Checkbox.Indicator>
		Red
	</Checkbox.Root>
	<Checkbox.Root value="green">
		<Checkbox.Indicator>x</Checkbox.Indicator>
		Green
	</Checkbox.Root>
</CheckboxGroup.Root>
```

## Usage guidelines

- Use `bind:value` to hand the group your state, or plain `value` + `onChange` to own it
  yourself. There is no flag to declare which: supplying `value` makes it the source of
  truth either way, and `onChange` always reports.
- A parent that holds `value` and refuses a change — it sends no new value down — still sees the
  group move. The group then goes back to the value of the parent at the next render. Refuse a
  change with a render, and not with silence.
- Give the group a `name` to submit the checked values as one field. Each `Checkbox.Root` puts its
  own `value` on a hidden input under that name, which is what a native checkbox group does.
- `CheckboxGroup.Item` is `Checkbox.Root` under the namespace of the group, and the two names
  are the same component. A checkbox works on its own, thus it keeps its own name too.
- Every box in a group must provide a unique `value`. The default value of a checkbox is
  `on`, so two boxes without a `value` collide and the group reports it.
- Read `allSelected` and `someSelected` from the context to drive a parent "select all" checkbox,
  and call `selectAll()` or `clearAll()` from it. Keep that parent checkbox **outside** the group:
  it commands the group and is not one of its values.

## API reference

`CheckboxGroup.Root` supports:

- `value?: string[]`
- `defaultValue?: string[]`
- `onChange?: (value: string[]) => void`
- `name?: string`
- `disabled?: boolean`
- `readonly?: boolean`
- `required?: boolean`
- `orientation?: 'horizontal' | 'vertical'`
- `context?: CheckboxGroupContext`
- `children?: Snippet`
- `...restProps: HTMLAttributes<HTMLDivElement>`

## Accessibility

- `CheckboxGroup.Root` renders `role="group"`.
- `required` gives `data-required` only. It marks no element with `aria-required`, because
  `role="group"` does not support that property. It also never goes down to the boxes. Native
  `required` on a checkbox demands that one box. It would thus turn "at least one" into
  "every one". Put the word in the group label, and give the reason with `aria-describedby`.
- Provide an accessible group name with `aria-label` or `aria-labelledby`.
- Every checkbox keeps its own tab stop, and `Space` toggles the focused one. The group adds no
  arrow-key navigation. This matches the APG, React Aria and Base UI: React Aria gives each
  checkbox of a group `tabindex="0"`, measured on its own live example. Arrow keys and one tab
  stop for a full set belong to a radio group, which is the `radiogroup` role.

## Notes

- Grouped checkboxes ignore their standalone `checked` and `defaultChecked` props. The group holds
  the checked state and reports it through its own `value`.
- A checkbox that becomes disabled keeps its place in the value. This parts with `ToggleGroup`,
  which drops a disabled selection. A checked and disabled checkbox is a state the platform
  supports, and dropping it would rewrite the value a form was seeded with.
- Removing one `Checkbox.Root` from a mounted group is a real change, and the group reports the
  shorter value. The removal of the full group is not a change, and it reports nothing. Without
  this rule, a move to a different screen would look like the user clearing the boxes.
- Values are strings only. A grouped checkbox carries its value on a native `<input>`, which stores
  it as a string. A number would thus let `value={[1]}` miss a checkbox declared as `value="1"`.
