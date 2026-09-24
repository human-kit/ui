<script lang="ts">
	import type { Snippet } from 'svelte';
	import { isRtl } from '../../internal/rtl';
	import { watchFocusVisible } from '../../primitives/focus-visible.svelte';
	import { shouldShowFocusVisible } from '../../primitives/input-modality';
	import { useColorPickerAreaContext, useColorPickerContext } from '../root/context';
	import type { ColorPickerAreaThumbProps, ColorPickerAreaThumbRenderState } from '../types';

	/**
	 * ColorPicker.AreaThumb — the handle of the square.
	 *
	 * The element the user sees is a `<div>` in the square. Inside it are two native sliders,
	 * invisible: one for each axis. A screen reader reads each of them with its channel and its
	 * value, and the arrows move both axes from either one. That is the one shape that gives a
	 * two-dimensional control a name and a value a screen reader can read.
	 */
	let {
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		style,
		onpointerdown,
		...restProps
	}: ColorPickerAreaThumbProps = $props();

	const ctx = useColorPickerContext('ColorPicker.AreaThumb');
	const area = useColorPickerAreaContext('ColorPicker.AreaThumb');

	let thumbRef: HTMLDivElement | null = $state(null);
	let xInputRef: HTMLInputElement | null = $state(null);
	let yInputRef: HTMLInputElement | null = $state(null);
	let focusedAxis = $state<'x' | 'y' | null>(null);
	let focusVisible = $state(false);
	const rtl = $derived(isRtl(thumbRef));

	$effect(() => {
		element = thumbRef;
	});

	const xRange = $derived(ctx.getChannelRange(area.xChannel));
	const yRange = $derived(ctx.getChannelRange(area.yChannel));
	const xValue = $derived(ctx.getChannelValue(area.xChannel));
	const yValue = $derived(ctx.getChannelValue(area.yChannel));
	const focused = $derived(focusedAxis !== null);

	// The native sliders keep the value: a screen reader reads it from there. A move that the
	// color refuses leaves the input ahead of the color, thus both are made equal again.
	$effect(() => {
		if (xInputRef && xInputRef.value !== String(xValue)) xInputRef.value = String(xValue);
		if (yInputRef && yInputRef.value !== String(yValue)) yInputRef.value = String(yValue);
	});

	const renderState = $derived<ColorPickerAreaThumbRenderState>({
		xPercent: area.xPercent,
		yPercent: area.yPercent,
		dragging: area.isDragging,
		focused
	});

	watchFocusVisible({
		isFocused: () => focused,
		element: () => (focusedAxis === 'y' ? yInputRef : xInputRef),
		set: (visible) => {
			focusVisible = visible;
		}
	});

	// The keyboard reports `onChange` on each key press, and `onChangeEnd` one time at the
	// release, thus a held key does not report an end on each repeat.
	let keyboardChanged = false;

	function commitKeyboard(event: Event) {
		if (!keyboardChanged) return;
		keyboardChanged = false;
		ctx.commit({ reason: 'keyboard', event });
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
		const large = event.shiftKey;
		let changed = false;

		switch (event.key) {
			case 'ArrowRight':
				changed = ctx.stepChannel(area.xChannel, rtl ? -1 : 1, { large, event });
				break;
			case 'ArrowLeft':
				changed = ctx.stepChannel(area.xChannel, rtl ? 1 : -1, { large, event });
				break;
			case 'ArrowUp':
				changed = ctx.stepChannel(area.yChannel, 1, { large, event });
				break;
			case 'ArrowDown':
				changed = ctx.stepChannel(area.yChannel, -1, { large, event });
				break;
			case 'PageUp':
				changed = ctx.stepChannel(area.yChannel, 1, { large: true, event });
				break;
			case 'PageDown':
				changed = ctx.stepChannel(area.yChannel, -1, { large: true, event });
				break;
			case 'Home':
				changed = ctx.setChannel(area.xChannel, xRange.min, { reason: 'keyboard', event });
				break;
			case 'End':
				changed = ctx.setChannel(area.xChannel, xRange.max, { reason: 'keyboard', event });
				break;
			default:
				return;
		}

		event.preventDefault();
		if (changed) keyboardChanged = true;
	}

	function handleInput(axis: 'x' | 'y', event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const channel = axis === 'x' ? area.xChannel : area.yChannel;
		const next = Number(input.value);
		// A screen reader moves the native slider, and the swipe of a mobile one arrives here.
		if (!Number.isNaN(next) && ctx.setChannel(channel, next, { reason: 'input', event })) {
			ctx.commit({ reason: 'input', event });
		}
		input.value = String(axis === 'x' ? xValue : yValue);
	}

	function handleFocus(axis: 'x' | 'y') {
		focusedAxis = axis;
		focusVisible = shouldShowFocusVisible(axis === 'x' ? xInputRef : yInputRef);
	}

	function handleBlur(axis: 'x' | 'y', event: FocusEvent) {
		// A key still held when the focus leaves has no release to wait for.
		commitKeyboard(event);
		if (focusedAxis === axis) {
			focusedAxis = null;
			focusVisible = false;
		}
	}

	function handlePointerDown(
		event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }
	) {
		onpointerdown?.(event);
		if (event.defaultPrevented) return;
		area.startDrag(event);
		xInputRef?.focus({ preventScroll: true });
	}

	const inputStyle =
		'position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;border:0;opacity:0;' +
		'cursor:inherit;pointer-events:none;';
	const positionStyle = $derived(
		`position: absolute; left: ${rtl ? 100 - area.xPercent : area.xPercent}%;` +
			` bottom: ${area.yPercent}%; translate: -50% 50%; touch-action: none;`
	);
	const resolvedStyle = $derived(`${positionStyle}${style ? ` ${style}` : ''}`);
</script>

<div
	{...restProps}
	bind:this={thumbRef}
	class={className}
	style={resolvedStyle}
	data-color-picker-area-thumb="true"
	data-dragging={area.isDragging || undefined}
	data-disabled={ctx.isDisabled || undefined}
	data-readonly={ctx.isReadOnly || undefined}
	data-focused={focused || undefined}
	data-focus-visible={(focused && focusVisible) || undefined}
	onpointerdown={handlePointerDown}
>
	<input
		bind:this={xInputRef}
		type="range"
		id={ctx.getPartId('area-x')}
		min={xRange.min}
		max={xRange.max}
		step={xRange.step}
		value={String(xValue)}
		disabled={ctx.isDisabled}
		aria-label={ctx.getChannelLabel(area.xChannel)}
		aria-valuetext={ctx.getChannelValueText(area.xChannel)}
		aria-describedby={ctx.ariaDescribedBy}
		aria-readonly={ctx.isReadOnly || undefined}
		aria-invalid={ctx.isInvalid || undefined}
		data-color-picker-area-input="true"
		data-axis="x"
		style={inputStyle}
		onkeydown={handleKeyDown}
		onkeyup={commitKeyboard}
		oninput={(event) => handleInput('x', event)}
		onfocus={() => handleFocus('x')}
		onblur={(event) => handleBlur('x', event)}
	/>
	<input
		bind:this={yInputRef}
		type="range"
		id={ctx.getPartId('area-y')}
		min={yRange.min}
		max={yRange.max}
		step={yRange.step}
		value={String(yValue)}
		disabled={ctx.isDisabled}
		aria-label={ctx.getChannelLabel(area.yChannel)}
		aria-valuetext={ctx.getChannelValueText(area.yChannel)}
		aria-describedby={ctx.ariaDescribedBy}
		aria-readonly={ctx.isReadOnly || undefined}
		aria-invalid={ctx.isInvalid || undefined}
		data-color-picker-area-input="true"
		data-axis="y"
		style={inputStyle}
		onkeydown={handleKeyDown}
		onkeyup={commitKeyboard}
		oninput={(event) => handleInput('y', event)}
		onfocus={() => handleFocus('y')}
		onblur={(event) => handleBlur('y', event)}
	/>
	{#if children}
		{@render (children as Snippet<[ColorPickerAreaThumbRenderState]>)(renderState)}
	{/if}
</div>
