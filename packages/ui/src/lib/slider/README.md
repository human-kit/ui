# Slider

## Description

`Slider` is a form field with a number, or a range of numbers, on a track. The user moves a thumb with the pointer or with the keyboard. Each thumb holds a native `<input type="range">`, thus a form sends the value and a screen reader reads a native slider.

## Anatomy

- `Slider.Root`
- `Slider.Label`
- `Slider.Output`
- `Slider.Track`
- `Slider.Fill`
- `Slider.Thumb`

```svelte
<Slider.Root name="volume">
	<Slider.Label>Volume</Slider.Label>
	<Slider.Output />
	<Slider.Track>
		<Slider.Fill />
		<Slider.Thumb />
	</Slider.Track>
</Slider.Root>
```

## Usage guidelines

- Use `bind:value` for the state, or `value` with `onChange` and `controlledValue` to hold it yourself.
- Give an array for a range, and one `Slider.Thumb` per number.
- Use `onChangeEnd` for work that must not run on each move of a drag.
- Give the track a size and the thumb a size. The thumb and the fill are positioned in percent.
- Give `formatOptions` for the text of the value, and `getValueText` for the text a screen reader reads.

## API reference

- `Slider.Root`
  - `value?: number | number[]`
  - `defaultValue?: number | number[]`
  - `controlledValue?: boolean`
  - `onChange?: (value, details) => void`
  - `onChangeEnd?: (value, details) => void`
  - `min?: number`, `max?: number`, `step?: number`, `largeStep?: number`
  - `minStepsBetweenThumbs?: number`
  - `orientation?: 'horizontal' | 'vertical'`
  - `disabled?: boolean`, `readonly?: boolean`, `invalid?: boolean`
  - `name?: string`, `form?: string`
  - `formatOptions?: Intl.NumberFormatOptions`
  - `getValueText?: (value, index) => string`
- `Slider.Thumb`
  - `index?: number`
  - `name?: string`
  - `aria-label?: string`

## Accessibility

- The root is a `role="group"` named by `Slider.Label`, `aria-labelledby` or `aria-label`.
- Each thumb holds a native `<input type="range">` with `aria-valuenow`, `aria-valuetext`, `aria-orientation` and the name of the field. A range of two thumbs names them "Minimum" and "Maximum" in the locale.
- The keyboard: the arrows step, `PageUp`, `PageDown` and `Shift+Arrow` move a large step, `Home` and `End` move to the ends. The horizontal arrows follow the text direction.
- `Slider.Output` is an `<output>` for the native inputs, with `aria-live="off"`.
- A press on the track puts the focus on the thumb without a focus ring. A key press after it shows the ring.
