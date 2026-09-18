export * as Slider from './index.parts.js';

export { default as SliderRoot } from './root/slider-root.svelte';
export { default as SliderLabel } from './label/slider-label.svelte';
export { default as SliderOutput } from './output/slider-output.svelte';
export { default as SliderTrack } from './track/slider-track.svelte';
export { default as SliderFill } from './fill/slider-fill.svelte';
export { default as SliderThumb } from './thumb/slider-thumb.svelte';

export type {
	SliderRootProps,
	SliderLabelProps,
	SliderOutputProps,
	SliderOutputRenderState,
	SliderTrackProps,
	SliderFillProps,
	SliderThumbProps,
	SliderThumbRenderState,
	SliderValue,
	SliderChangeDetails,
	SliderOrientation
} from './types.js';

export {
	getSliderContext,
	setSliderContext,
	useSliderContext,
	type SliderChangeReason,
	type SliderContext
} from './root/context.js';
