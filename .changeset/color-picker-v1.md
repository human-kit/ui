---
'@human-kit/ui': minor
---

Add the ColorPicker primitive with `Root`, `Label`, `Area`, `AreaThumb`, `Slider`, `SliderThumb`, `HexField`, `ChannelField`, `SwatchList`, `Swatch`, `Preview` and `EyeDropper`. The color is held as hue, saturation and brightness. The square keeps its shape at each hue, and a color that goes to black keeps the hue it had. The value is text: a hex color, `rgb()`, `hsl()` and `hsb()` come in, and `format` decides what goes out. `alpha` adds the fourth number and the `alpha` channel. `ColorPicker.AreaThumb` holds one native slider for each axis, each with the name of its channel and with `aria-valuetext`. The arrows move both axes from either of them. `ColorPicker.SwatchList` is a listbox of options. The parts paint nothing: `--color-picker-value`, `--color-picker-hue-color`, `--color-picker-area-x`, `--color-picker-slider-start` and `--color-picker-swatch-color` give your CSS what it needs.
