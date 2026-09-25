# Rating

## Description

`Rating` is a form field with a value on a small scale, for example five stars. The user answers with a press or with the arrows. With whole items the rating is a radio group, because each value is one item. With half items it is a slider, because a radio group cannot say 3.5.

## Anatomy

- `Rating.Root`
- `Rating.Label`
- `Rating.Output`
- `Rating.Item`

```svelte
<Rating.Root name="quality" count={5}>
	<Rating.Label>Quality</Rating.Label>
	<Rating.Output />
	{#each { length: 5 } as _, index (index)}
		<Rating.Item />
	{/each}
</Rating.Root>
```

## Usage guidelines

- Use `bind:value` for the state, or `value` with `onChange` and `controlledValue` to hold it yourself.
- Give one `Rating.Item` for each item of `count`.
- Use `precision={0.5}` for half items. The root is a slider then, and the items are decoration.
- Paint each item with `--rating-item-fill`, which goes from 0 to 1. A half item has 0.5.
- `allowClear` is on: a press on the item of the value puts the value back to 0. `Delete` and `Backspace` do the same.
- Use `getValueText` and `getItemLabel` for the text of the value and of each item.
- The value follows the pointer before a press: `Rating.Output` and `--rating-display-value` show the value of the press before it.

## API reference

- `Rating.Root`
  - `value?: number`
  - `defaultValue?: number`
  - `controlledValue?: boolean`
  - `onChange?: (value, details) => void`
  - `onChangeEnd?: (value, details) => void`
  - `count?: number`, `precision?: number`
  - `allowClear?: boolean`
  - `disabled?: boolean`, `readonly?: boolean`, `required?: boolean`, `invalid?: boolean`
  - `name?: string`, `form?: string`
  - `getItemLabel?: (value, count) => string`
  - `getValueText?: (value, count) => string`
- `Rating.Item`
  - `index?: number`
  - `aria-label?: string`

## Accessibility

- With a precision of 1 the root is a `role="radiogroup"`, and each item is a `role="radio"` with its own name, for example "3 of 5". The focus follows the value, which is the rule of a radio group.
- With a smaller precision the root is a `role="slider"` with `aria-valuenow` and `aria-valuetext`, and it is the one tab stop.
- The keyboard: the arrows step by the precision. `Home` goes to the first item, `End` goes to the last one, and `Delete` or `Backspace` clears the value. The horizontal arrows follow the text direction.
- `Rating.Output` is an `<output>` for the root, with `aria-live="off"`.
- The value in a form comes from a hidden input. A `<form>` reset takes the first value back.
