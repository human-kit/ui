<script lang="ts">
	import { isRtl } from '../../internal/rtl';
	import { setColorPickerSliderContext, useColorPickerContext } from '../root/context';
	import type { ColorPickerSliderProps } from '../types';

	/**
	 * ColorPicker.Slider — the track of one channel.
	 *
	 * A press anywhere on the track moves the thumb there. The track paints nothing of its own:
	 * your CSS draws the gradient of the channel, and `--color-picker-slider-start` and
	 * `--color-picker-slider-end` give it the two ends of that channel in the color of now.
	 */
	let {
		channel,
		orientation = 'horizontal',
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		style,
		onpointerdown,
		...restProps
	}: ColorPickerSliderProps = $props();

	const ctx = useColorPickerContext('ColorPicker.Slider');

	let trackRef: HTMLDivElement | null = $state(null);
	let dragging = $state(false);
	let rtl = $state(false);

	const sliderId = $derived(ctx.getPartId(`slider-${channel}`));
	const range = $derived(ctx.getChannelRange(channel));
	const percent = $derived(ctx.getChannelPercent(channel));

	$effect(() => {
		element = trackRef;
	});

	// The rect is read one time at the press, and again only when the page scrolls: a layout read
	// on each move is what a drag does most.
	let dragRect: DOMRect | null = null;
	let dragPointerId: number | null = null;
	let dragTarget: HTMLElement | null = null;
	let dragChanged = false;

	function applyPointer(event: PointerEvent) {
		if (!trackRef) return;
		dragRect ??= trackRef.getBoundingClientRect();
		const rect = dragRect;

		let fraction: number;
		if (orientation === 'vertical') {
			if (rect.height <= 0) return;
			fraction = (rect.bottom - event.clientY) / rect.height;
		} else {
			if (rect.width <= 0) return;
			const raw = (event.clientX - rect.left) / rect.width;
			fraction = rtl ? 1 - raw : raw;
		}

		const next = range.min + Math.min(Math.max(fraction, 0), 1) * (range.max - range.min);
		if (ctx.setChannel(channel, next, { reason: 'pointer', event })) dragChanged = true;
	}

	function beginDrag(event: PointerEvent, target: HTMLElement) {
		if (ctx.isDisabled || ctx.isReadOnly || event.button !== 0 || dragPointerId !== null) return;
		// The press must not select the page, and the thumb takes the focus below.
		event.preventDefault();
		rtl = isRtl(trackRef);
		dragRect = trackRef?.getBoundingClientRect() ?? null;
		dragPointerId = event.pointerId;
		dragTarget = target;
		dragChanged = false;
		dragging = true;

		try {
			target.setPointerCapture(event.pointerId);
		} catch {
			// Synthetic test events and older browsers can fail pointer capture.
		}
		target.addEventListener('pointermove', handleDragMove);
		target.addEventListener('pointerup', handleDragEnd);
		target.addEventListener('pointercancel', handleDragEnd);
		target.addEventListener('lostpointercapture', handleDragEnd);
		window.addEventListener('scroll', handleDragScroll, true);
	}

	function handleDragScroll() {
		dragRect = null;
	}

	function handleDragMove(event: PointerEvent) {
		if (event.pointerId !== dragPointerId) return;
		applyPointer(event);
	}

	function handleDragEnd(event: PointerEvent) {
		if (event.pointerId !== dragPointerId) return;
		const changed = dragChanged;
		stopDrag();
		if (changed) ctx.commit({ reason: 'pointer', channel, event });
	}

	function stopDrag() {
		const target = dragTarget;
		if (target) {
			target.removeEventListener('pointermove', handleDragMove);
			target.removeEventListener('pointerup', handleDragEnd);
			target.removeEventListener('pointercancel', handleDragEnd);
			target.removeEventListener('lostpointercapture', handleDragEnd);
			window.removeEventListener('scroll', handleDragScroll, true);
			if (dragPointerId !== null && target.hasPointerCapture?.(dragPointerId)) {
				try {
					target.releasePointerCapture(dragPointerId);
				} catch {
					// The capture is gone already.
				}
			}
		}
		dragPointerId = null;
		dragTarget = null;
		dragChanged = false;
		dragRect = null;
		dragging = false;
	}

	$effect(() => () => stopDrag());

	function handlePointerDown(
		event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }
	) {
		onpointerdown?.(event);
		if (event.defaultPrevented) return;
		beginDrag(event, event.currentTarget);
		if (dragging) applyPointer(event);
	}

	setColorPickerSliderContext({
		get channel() {
			return channel;
		},
		get orientation() {
			return orientation;
		},
		get percent() {
			return percent;
		},
		get isDragging() {
			return dragging;
		},
		get isRtl() {
			return rtl;
		},
		get sliderId() {
			return sliderId;
		},
		startDrag(event) {
			const target = event.currentTarget;
			if (!(target instanceof HTMLElement)) return;
			// The thumb keeps its value at the press; only a move changes it.
			beginDrag(event, target);
		}
	});

	const inlineStyle = $derived(
		`position: relative; touch-action: none;` +
			` --color-picker-slider-percent: ${percent}%;` +
			` --color-picker-slider-start: ${ctx.getChannelColor(channel, range.min)};` +
			` --color-picker-slider-end: ${ctx.getChannelColor(channel, range.max)};` +
			`${style ? ` ${style}` : ''}`
	);
</script>

<div
	{...restProps}
	bind:this={trackRef}
	id={sliderId}
	class={className}
	style={inlineStyle}
	data-color-picker-slider="true"
	data-channel={channel}
	data-orientation={orientation}
	data-dragging={dragging || undefined}
	data-disabled={ctx.isDisabled || undefined}
	data-readonly={ctx.isReadOnly || undefined}
	onpointerdown={handlePointerDown}
>
	{@render children?.()}
</div>
