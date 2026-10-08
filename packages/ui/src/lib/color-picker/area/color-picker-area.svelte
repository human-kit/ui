<script lang="ts">
	import { isRtl } from '../../internal/rtl';
	import { withColorChannel } from '../root/color';
	import { useColorPickerContext, setColorPickerAreaContext } from '../root/context';
	import type { ColorPickerAreaProps } from '../types';

	/**
	 * ColorPicker.Area — the square of two channels.
	 *
	 * The horizontal axis is the saturation, and the vertical one is the brightness, which counts
	 * from the bottom: white is at the top left and black is at the bottom. The area paints
	 * nothing of its own. It gives your CSS `--color-picker-hue-color`, and the position of the
	 * thumb in `--color-picker-area-x` and `--color-picker-area-y`.
	 */
	let {
		xChannel = 'saturation',
		yChannel = 'brightness',
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		style,
		onpointerdown,
		...restProps
	}: ColorPickerAreaProps = $props();

	const ctx = useColorPickerContext('ColorPicker.Area');

	let areaRef: HTMLDivElement | null = $state(null);
	let dragging = $state(false);
	let rtl = $state(false);

	const areaId = $derived(ctx.getPartId('area'));
	const xPercent = $derived(ctx.getChannelPercent(xChannel));
	const yPercent = $derived(ctx.getChannelPercent(yChannel));

	$effect(() => {
		element = areaRef;
	});

	// The rect is read one time at the press, and again only when the page scrolls: a layout read
	// on each move is what a drag does most.
	let dragRect: DOMRect | null = null;
	let dragPointerId: number | null = null;
	let dragTarget: HTMLElement | null = null;
	let dragChanged = false;

	function applyPointer(event: PointerEvent) {
		if (!areaRef) return;
		dragRect ??= areaRef.getBoundingClientRect();
		const rect = dragRect;
		if (rect.width <= 0 || rect.height <= 0) return;

		const rawX = (event.clientX - rect.left) / rect.width;
		const fractionX = Math.min(Math.max(rtl ? 1 - rawX : rawX, 0), 1);
		// The vertical axis counts from the bottom: the top of the square is the highest value.
		const fractionY = Math.min(Math.max((rect.bottom - event.clientY) / rect.height, 0), 1);

		const xRange = ctx.getChannelRange(xChannel);
		const yRange = ctx.getChannelRange(yChannel);
		const nextX = xRange.min + fractionX * (xRange.max - xRange.min);
		const nextY = yRange.min + fractionY * (yRange.max - yRange.min);

		// One write for the two axes. Two writes report two changes for one move of the pointer,
		// and the color between them is a color the pointer was never on.
		const next = withColorChannel(withColorChannel(ctx.color, xChannel, nextX), yChannel, nextY);
		if (ctx.setColor(next, { reason: 'pointer', event })) dragChanged = true;
	}

	function beginDrag(event: PointerEvent, target: HTMLElement) {
		if (ctx.isDisabled || ctx.isReadOnly || event.button !== 0 || dragPointerId !== null) return;
		// The press must not select the page, and the thumb takes the focus below.
		event.preventDefault();
		rtl = isRtl(areaRef);
		dragRect = areaRef?.getBoundingClientRect() ?? null;
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
		if (changed) ctx.commit({ reason: 'pointer', event });
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
		const target = event.currentTarget;
		beginDrag(event, target);
		if (dragging) applyPointer(event);
	}

	setColorPickerAreaContext({
		get xChannel() {
			return xChannel;
		},
		get yChannel() {
			return yChannel;
		},
		get xPercent() {
			return xPercent;
		},
		get yPercent() {
			return yPercent;
		},
		get isDragging() {
			return dragging;
		},
		get isRtl() {
			return rtl;
		},
		get areaId() {
			return areaId;
		},
		startDrag(event) {
			const target = event.currentTarget;
			if (!(target instanceof HTMLElement)) return;
			// The thumb keeps its color at the press; only a move changes it.
			beginDrag(event, target);
		}
	});

	const inlineStyle = $derived(
		`position: relative; touch-action: none;` +
			` --color-picker-area-x: ${xPercent}%; --color-picker-area-y: ${yPercent}%;` +
			`${style ? ` ${style}` : ''}`
	);
</script>

<div
	{...restProps}
	bind:this={areaRef}
	id={areaId}
	class={className}
	style={inlineStyle}
	data-color-picker-area="true"
	data-x-channel={xChannel}
	data-y-channel={yChannel}
	data-dragging={dragging || undefined}
	data-disabled={ctx.isDisabled || undefined}
	data-readonly={ctx.isReadOnly || undefined}
	onpointerdown={handlePointerDown}
>
	{@render children?.()}
</div>
