<script lang="ts">
	import { useSliderContext } from '../root/context';
	import type { SliderFillProps } from '../types';

	/**
	 * Slider.Fill — the part of the track between `min` and the thumb, or between the two thumbs
	 * of a range.
	 *
	 * It is positioned in percent of the value: `inset-inline-start` and `width` on a horizontal
	 * track, `bottom` and `height` on a vertical one. The logical property follows the direction
	 * of the text on its own.
	 */
	let { children, class: className = '', style, ...restProps }: SliderFillProps = $props();

	const ctx = useSliderContext('Slider.Fill');

	const startPercent = $derived(ctx.values.length > 1 ? ctx.getPercent(ctx.values[0]) : 0);
	const endPercent = $derived(ctx.getPercent(ctx.values[ctx.values.length - 1] ?? ctx.min));
	const sizePercent = $derived(Math.max(0, endPercent - startPercent));
	const positionStyle = $derived(
		ctx.orientation === 'vertical'
			? `position: absolute; bottom: ${startPercent}%; height: ${sizePercent}%;`
			: `position: absolute; inset-inline-start: ${startPercent}%; width: ${sizePercent}%;`
	);
	const resolvedStyle = $derived(`${positionStyle}${style ? ` ${style}` : ''}`);
</script>

<div
	{...restProps}
	class={className}
	style={resolvedStyle}
	data-slider-fill="true"
	data-orientation={ctx.orientation}
	data-disabled={ctx.isDisabled || undefined}
	data-readonly={ctx.isReadOnly || undefined}
	data-invalid={ctx.isInvalid || undefined}
	data-dragging={ctx.draggingIndex !== null || undefined}
>
	{@render children?.()}
</div>
