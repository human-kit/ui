# ColorPicker

## Description

`ColorPicker` is a form field for one color. It holds a square of saturation against brightness, and a slider for each channel. It also holds a hex field, a number field for each channel, a set of swatches and the eye dropper of the browser. The color is held as hue, saturation and brightness, and the value that goes out is text.

## Anatomy

- `ColorPicker.Root`
- `ColorPicker.Label`
- `ColorPicker.Area`
- `ColorPicker.AreaThumb`
- `ColorPicker.Slider`
- `ColorPicker.SliderThumb`
- `ColorPicker.HexField`
- `ColorPicker.ChannelField`
- `ColorPicker.SwatchList`
- `ColorPicker.Swatch`
- `ColorPicker.Preview`
- `ColorPicker.EyeDropper`

```svelte
<ColorPicker.Root name="brand" defaultValue="#3366cc">
	<ColorPicker.Label>Brand color</ColorPicker.Label>
	<ColorPicker.Area>
		<ColorPicker.AreaThumb />
	</ColorPicker.Area>
	<ColorPicker.Slider channel="hue">
		<ColorPicker.SliderThumb />
	</ColorPicker.Slider>
	<ColorPicker.HexField />
	<ColorPicker.Preview />
</ColorPicker.Root>
```

## Usage guidelines

- Use `bind:value` for the state, or `value` with `onChange` and `controlledValue` to hold it yourself.
- `format` decides the text of the value: `hex`, `rgb`, `hsl` or `hsb`. The value that comes in can be in any of them.
- Use `alpha` for a color with an alpha. `ColorPicker.Slider` then accepts `channel="alpha"`.
- Use `onChangeEnd` for work that must not run on each move of a drag.
- Give the area a size and the thumb a size. Each thumb is positioned in percent.
- The CSS custom properties paint the picker: `--color-picker-value` on the root, `--color-picker-hue-color` for the square, `--color-picker-slider-start` and `--color-picker-slider-end` for a track, and `--color-picker-swatch-color` on a swatch and on the preview.
- Test for the eye dropper before you make it the one way to choose a color: a browser without it gets `data-unsupported`.

## API reference

- `ColorPicker.Root`
  - `value?: string`
  - `defaultValue?: string`
  - `controlledValue?: boolean`
  - `onChange?: (value, details) => void`
  - `onChangeEnd?: (value, details) => void`
  - `format?: 'hex' | 'rgb' | 'hsl' | 'hsb'`
  - `alpha?: boolean`
  - `disabled?: boolean`, `readonly?: boolean`, `invalid?: boolean`
  - `name?: string`, `form?: string`
- `ColorPicker.Area`
  - `xChannel?: ColorChannel`, `yChannel?: ColorChannel`
- `ColorPicker.Slider`
  - `channel: ColorChannel`
  - `orientation?: 'horizontal' | 'vertical'`
- `ColorPicker.ChannelField`
  - `channel: ColorChannel`
- `ColorPicker.Swatch`
  - `color: string`
  - `aria-label?: string`

## Accessibility

- The root is a `role="group"` named by `ColorPicker.Label`, `aria-labelledby` or `aria-label`.
- `ColorPicker.AreaThumb` holds two native sliders, one for each axis, each with the name of its channel and with `aria-valuetext`. That gives a two-dimensional control a value a screen reader can read. The arrows move both axes from either of them.
- `ColorPicker.SliderThumb` holds one native slider with the name of its channel.
- The keyboard: the arrows step, `Shift` with an arrow and `PageUp` or `PageDown` move a large step, and `Home` and `End` go to the ends. The horizontal arrows follow the text direction.
- `ColorPicker.HexField` reads its text at `Enter` and when the focus leaves. A text that names no color goes back to the color of the picker.
- `ColorPicker.SwatchList` is a `role="listbox"`, and each swatch is an option. One swatch is in the tab order, the arrows move between them, and `Enter` or the space bar takes the color.
- `ColorPicker.Preview` has no name and no role: the color is already in the fields and in the sliders.
- The color in a form comes from a hidden input. A `<form>` reset takes the first color back.
