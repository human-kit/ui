export * as ColorPicker from './index.parts.js';

export { default as ColorPickerRoot } from './root/color-picker-root.svelte';
export { default as ColorPickerLabel } from './label/color-picker-label.svelte';
export { default as ColorPickerArea } from './area/color-picker-area.svelte';
export { default as ColorPickerAreaThumb } from './area-thumb/color-picker-area-thumb.svelte';
export { default as ColorPickerSlider } from './slider/color-picker-slider.svelte';
export { default as ColorPickerSliderThumb } from './slider-thumb/color-picker-slider-thumb.svelte';
export { default as ColorPickerHexField } from './hex-field/color-picker-hex-field.svelte';
export { default as ColorPickerChannelField } from './channel-field/color-picker-channel-field.svelte';
export { default as ColorPickerSwatchList } from './swatch-list/color-picker-swatch-list.svelte';
export { default as ColorPickerSwatch } from './swatch/color-picker-swatch.svelte';
export { default as ColorPickerPreview } from './preview/color-picker-preview.svelte';
export { default as ColorPickerEyeDropper } from './eye-dropper/color-picker-eye-dropper.svelte';

export type {
	ColorPickerRootProps,
	ColorPickerLabelProps,
	ColorPickerAreaProps,
	ColorPickerAreaThumbProps,
	ColorPickerAreaThumbRenderState,
	ColorPickerSliderProps,
	ColorPickerSliderThumbProps,
	ColorPickerSliderThumbRenderState,
	ColorPickerHexFieldProps,
	ColorPickerChannelFieldProps,
	ColorPickerSwatchListProps,
	ColorPickerSwatchProps,
	ColorPickerPreviewProps,
	ColorPickerEyeDropperProps
} from './types.js';

export {
	getColorPickerContext,
	setColorPickerContext,
	useColorPickerContext,
	type Color,
	type ColorChannel,
	type ColorFormat,
	type ColorPickerChangeDetails,
	type ColorPickerChangeReason,
	type ColorPickerContext,
	type ColorPickerSliderOrientation
} from './root/context.js';

export {
	COLOR_CHANNEL_RANGES,
	formatColor,
	getColorChannel,
	hsbToHsl,
	hsbToRgb,
	hslToHsb,
	parseColor,
	rgbToHsb,
	toCssColor,
	withColorChannel
} from './root/color.js';
