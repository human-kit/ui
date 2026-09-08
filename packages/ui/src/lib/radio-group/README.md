# RadioGroup

## Description

`RadioGroup` coordinates a set of `RadioGroup.Item` buttons as one field. It holds a single value, and
it shares a `name` for form submission. It also spreads group-wide disabled, read-only and required
state, and it controls the roving focus the pattern asks for.

## Anatomy

- `RadioGroup.Root`
- `RadioGroup.Label`
- `RadioGroup.Item`
- `RadioGroup.Indicator`

```svelte
<RadioGroup.Root name="size" defaultValue="medium">
	<RadioGroup.Label>Size</RadioGroup.Label>
	<RadioGroup.Item value="small">
		<RadioGroup.Indicator>x</RadioGroup.Indicator>
		Small
	</RadioGroup.Item>
	<RadioGroup.Item value="medium">
		<RadioGroup.Indicator>x</RadioGroup.Indicator>
		Medium
	</RadioGroup.Item>
</RadioGroup.Root>
```

## Usage guidelines

- Use `bind:value` to hand the group your state, or plain `value` + `onChange` to own it yourself.
  There is no flag to declare which: supplying `value` makes it the source of truth either way, and
  `onChange` always reports.
- A parent that holds `value` and refuses a change — it sends no new value down — still sees the
  group move. The group then goes back to the value of the parent at the next render.
- Give the group a `name` to submit the answer as one field.
- Every `RadioGroup.Item` must provide a unique `value`, and it must sit inside a `RadioGroup.Root`. A
  radio on its own has nothing to answer, and the component reports that rather than guessing.

## API reference

`RadioGroup.Root` supports:

- `value?: string | null`
- `defaultValue?: string | null`
- `onChange?: (value: string) => void`
- `name?: string`
- `form?: string`
- `disabled?: boolean`
- `readonly?: boolean`
- `required?: boolean`
- `orientation?: 'horizontal' | 'vertical'`
- `context?: RadioGroupContext`
- `children?: Snippet`
- `...restProps: HTMLAttributes<HTMLDivElement>`

`RadioGroup.Item` supports `value` (required), `disabled`, `children`, `class`, `element` and the
usual `HTMLAttributes<HTMLSpanElement>`. It makes a span with `role="radio"` and a hidden radio
input for the form.

`RadioGroup.Indicator` supports `forceMount`. It is in the DOM only while its radio is checked.

`RadioGroup.Label` supports `children`, `class`, `id` and the usual `HTMLAttributes<HTMLSpanElement>`.
It renders a span, and it registers its id with the group as `aria-labelledby`.

## Accessibility

- `RadioGroup.Root` renders `role="radiogroup"`, with `aria-orientation`, `aria-required`,
  `aria-disabled` and `aria-readonly`. That role supports all four, which the plain `group` role of
  a checkbox group does not.
- Give the group an accessible name with `RadioGroup.Label`, or with `aria-label` on the root for a
  name the user does not see. Two labels read as one name, in the order they appear. An
  `aria-labelledby` that the caller gives stands, thus an element of your own wins.
- `RadioGroup.Label` renders a span, and not a `<label>`: a `<label>` names one control, thus it
  cannot name a set.
- The id reaches the group through the context. The server cannot do that: the group tag is
  already written when the label registers. Thus `aria-labelledby` appears at hydration. Give
  `aria-label` as well when the name must be there on the first paint.
- The group holds **one** tab stop, on the checked radio, and on the first enabled radio while
  nothing is checked. Thus Tab enters the group where the user left it, and Tab leaves the group
  rather than walking through it.
- The arrow keys move the focus **and** the selection, and they wrap at both ends. `Home` and `End`
  jump to the bounds. Both axes work in either orientation, the way a native radio group does.
- `Space` selects the focused radio. `Enter` does not: it submits the form of a native radio.
- `aria-readonly` and `aria-required` are on the group, and never on an item: the `radio` role
  does not support them.
- Give each radio an accessible name with its content, `aria-label` or `aria-labelledby`.

## Notes

- There is no unselecting. The platform gives the user no way to take a radio answer back, so a
  second press on the selected radio reports nothing.
- A radio that leaves a mounted group keeps its value in the group. Its hidden input goes with it,
  so the form stops submitting that answer, which is what a native radio group does. A parent
  that holds the value keeps it. The group gives the tab stop to the first enabled radio.
- Values are strings only. A radio carries its value on a native `<input>`, which stores it as a
  string. A number would thus let `value={1}` miss a radio declared as `value="1"`.
- Both parts show each visual state in `data-*` attributes: `data-checked`, `data-unchecked`,
  `data-pressed`, `data-disabled`, `data-readonly`, `data-required`, `data-focused` and
  `data-focus-visible`.
- The selection follows the focus. This is the rule that parts a radio group from every other group
  in this library. In a `ToggleGroup` or a `CheckboxGroup` the arrows only move.
