<script lang="ts">
	import { useSliderContext } from '../root/context';
	import type { SliderTrackProps } from '../types';

	/**
	 * Slider.Track — the rail, and the surface of the pointer.
	 *
	 * A press on it moves the nearest thumb to the pointer and starts a drag. The thumbs sit in
	 * it, positioned along it in percent of the value. It is `position: relative` for that, and
	 * `touch-action: none` so that a touch drag moves the thumb and not the page.
	 */
	let {
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		style,
		onpointerdown,
		...restProps
	}: SliderTrackProps = $props();

	const ctx = useSliderContext('Slider.Track');
	let trackRef: HTMLDivElement | null = $state(null);

	$effect(() => {
		element = trackRef;
		ctx.setTrackRef(trackRef);
		return () => {
			ctx.setTrackRef(null);
		};
	});

	// The consumer style comes last, thus it can replace the two defaults.
	const resolvedStyle = $derived(
		`position: relative; touch-action: none;${style ? ` ${style}` : ''}`
	);

	function handlePointerDown(
		event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }
	) {
		onpointerdown?.(event);
		if (event.defaultPrevented) return;
		ctx.startDrag(event);
	}
</script>

<div
	{...restProps}
	bind:this={trackRef}
	class={className}
	style={resolvedStyle}
	data-slider-track="true"
	data-orientation={ctx.orientation}
	data-disabled={ctx.isDisabled || undefined}
	data-readonly={ctx.isReadOnly || undefined}
	data-invalid={ctx.isInvalid || undefined}
	data-dragging={ctx.draggingIndex !== null || undefined}
	onpointerdown={handlePointerDown}
>
	{@render children?.()}
</div>
