---
title: ColorPicker
description: A form field for one color, with a square of saturation against brightness, a slider for each channel, a hex field, number fields, swatches, the eye dropper of the browser, and a hidden input for the form.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Alpha from './demos/alpha.svelte';
	import alphaSource from './demos/alpha.svelte?highlight';
	import Swatches from './demos/swatches.svelte';
	import swatchesSource from './demos/swatches.svelte?highlight';
	import Channels from './demos/channels.svelte';
	import channelsSource from './demos/channels.svelte?highlight';
	import api from './api.json';
</script>

# ColorPicker

`ColorPicker` is a form field for one color. The user moves a thumb in the square, moves a slider, writes a hex text, or takes a color from the screen. The color is held as hue, saturation and brightness, and the value that goes out is text.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`ColorPicker.Root` holds the color. `ColorPicker.Area` is the square of two channels, with `ColorPicker.AreaThumb` in it. `ColorPicker.Slider` is the track of one channel, with `ColorPicker.SliderThumb` in it.

`ColorPicker.HexField` is the color as text. `ColorPicker.ChannelField` is one channel as a number. `ColorPicker.SwatchList` holds the `ColorPicker.Swatch` elements. `ColorPicker.Preview` shows the color, and `ColorPicker.EyeDropper` takes one from the screen.

```svelte
<script>
	import { ColorPicker } from '@human-kit/ui';
</script>

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

## Value

Use `bind:value` to give the root your state. Use `value` with `onChange` and `controlledValue` to hold the state yourself. The root then reports each change, and it does not write `value` back.

The value is text. A hex color, `rgb()`, `hsl()` and `hsb()` all come in, and `format` decides what goes out: `hex`, `rgb`, `hsl` or `hsb`. A text that names no color leaves the color that is there.

`onChange` runs on each change, also on each move of a drag. `onChangeEnd` runs when a sequence of changes ends: at the release of a key, and at the end of a drag.

## The model of the color

The color is held as hue, saturation and brightness. The square keeps its shape at each hue in that model, and it does not in red-green-blue.

A black and a gray say nothing about the hue. The picker keeps the hue that was there. The thumb in the square stays where the user left it, and the hue slider does not jump back to red.

## The square and the sliders

`ColorPicker.Area` is the saturation against the brightness. The vertical axis counts from the bottom: white is at the top left corner, and black is at the bottom. Give `xChannel` and `yChannel` for two other channels.

`ColorPicker.Slider` moves one channel: `hue`, `saturation`, `brightness`, `lightness`, `alpha`, `red`, `green` or `blue`. Give `orientation="vertical"` for a track that goes up.

The arrows step, `Shift` with an arrow moves a large step, and `Home` and `End` go to the ends. The horizontal arrows follow the text direction. The hue is a circle: one step past red comes back to red.

## Alpha

Give `alpha` for a color with an alpha, and a `ColorPicker.Slider` with `channel="alpha"`. The value then holds the fourth number: `#3366cc80` in hex, and `rgba(51, 102, 204, 0.5)` in rgb.

Without `alpha` the text holds only the three color channels. A picker with no alpha slider must not answer a number nobody can change.

<Demo source={alphaSource}><Alpha /></Demo>

## The fields

`ColorPicker.HexField` reads its text at `Enter` and when the focus leaves. What the user writes stays in the field until then, thus a half written color is not read on each key. A text that names no color goes back to the color of the picker.

`ColorPicker.ChannelField` is a native number field with the limits and the step of its channel. Red goes from 0 to 255, the hue from 0 to 360, and the alpha from 0 to 1.

<Demo source={channelsSource}><Channels /></Demo>

## Swatches and the eye dropper

`ColorPicker.SwatchList` is a listbox, and each `ColorPicker.Swatch` in it is an option. One swatch is in the tab order, the arrows move between them, and `Enter` or the space bar takes the color. A swatch outside a list shows a color and answers nothing.

`ColorPicker.EyeDropper` opens the eye dropper of the browser, and the color of the press becomes the color of the picker. A browser without it gets `data-unsupported`, which your CSS can hide. Test for it before you make it the one way to choose a color.

The browser takes up to two seconds to paint its eye dropper, because it must first read the screen. Give `data-open` a style of its own: the button carries it, and `aria-busy`, from the press until the color arrives. Without that style the button does not move, and the reader presses it again.

<Demo source={swatchesSource}><Swatches /></Demo>

## Style

The picker paints nothing of its own. These custom properties give your CSS what it needs:

- `--color-picker-value` on the root: the color, with its alpha.
- `--color-picker-hue` and `--color-picker-hue-color`: the hue as a number, and as the color at full saturation and brightness. The square is two gradients over that color.
- `--color-picker-area-x` and `--color-picker-area-y` on the area: the position of the thumb, in percent.
- `--color-picker-slider-start`, `--color-picker-slider-end` and `--color-picker-slider-percent` on a slider: the two ends of its channel in the color of now, and the position of its thumb.
- `--color-picker-swatch-color` on a swatch and on the preview.

## Forms

Give `name` for the color of the field. The root renders a hidden input with the text of the color, and a `<form>` reset takes the first color back. `invalid` marks the color as wrong.

## API reference

<ApiReference api={api} />
