<script lang="ts">
	import type { Snippet } from 'svelte';
	import { isRtl } from '../../internal/rtl';
	import { watchFocusVisible } from '../../primitives/focus-visible.svelte';
	import { focusWithModality, shouldShowFocusVisible } from '../../primitives/input-modality';
	import { useColorPickerContext, useColorPickerSliderContext } from '../root/context';
	import type { ColorPickerSliderThumbProps, ColorPickerSliderThumbRenderState } from '../types';

	/**
	 * ColorPicker.SliderThumb — the handle of one channel.
	 *
	 * The element the user sees is a `<div>` on the track. Inside it, a native slider fills the
	 * thumb, invisible, and it is what has the focus and the value. The keyboard is answered
	 * here, thus the steps and the text direction are the same in each browser.
	 */
	let {
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		style,
		onpointerdown,
		...restProps
	}: ColorPickerSliderThumbProps = $props();

	const ctx = useColorPickerContext('ColorPicker.SliderThumb');
	const slider = useColorPickerSliderContext('ColorPicker.SliderThumb');

	let thumbRef: HTMLDivElement | null = $state(null);
	let inputRef: HTMLInputElement | null = $state(null);
	let focused = $state(false);
	let focusVisible = $state(false);
	const rtl = $derived(isRtl(thumbRef));

	$effect(() => {
		element = thumbRef;
	});

	const range = $derived(ctx.getChannelRange(slider.channel));
	const value = $derived(ctx.getChannelValue(slider.channel));

	// The native slider keeps the value: a screen reader reads it from there. A move that the
	// color refuses leaves the input ahead of the color, thus both are made equal again.
	$effect(() => {
		if (inputRef && inputRef.value !== String(value)) inputRef.value = String(value);
	});

	const renderState = $derived<ColorPickerSliderThumbRenderState>({
		percent: slider.percent,
		value,
		dragging: slider.isDragging,
		focused
	});

	watchFocusVisible({
		isFocused: () => focused,
		element: () => inputRef,
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
		ctx.commit({ reason: 'keyboard', channel: slider.channel, event });
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
		const vertical = slider.orientation === 'vertical';
		const large = event.shiftKey;
		let changed = false;

		switch (event.key) {
			case 'ArrowRight':
				changed = ctx.stepChannel(slider.channel, vertical || !rtl ? 1 : -1, { large, event });
				break;
			case 'ArrowLeft':
				changed = ctx.stepChannel(slider.channel, vertical || !rtl ? -1 : 1, { large, event });
				break;
			case 'ArrowUp':
				changed = ctx.stepChannel(slider.channel, 1, { large, event });
				break;
			case 'ArrowDown':
				changed = ctx.stepChannel(slider.channel, -1, { large, event });
				break;
			case 'PageUp':
				changed = ctx.stepChannel(slider.channel, 1, { large: true, event });
				break;
			case 'PageDown':
				changed = ctx.stepChannel(slider.channel, -1, { large: true, event });
				break;
			case 'Home':
				changed = ctx.setChannel(slider.channel, range.min, {
					reason: 'keyboard',
					channel: slider.channel,
					event
				});
				break;
			case 'End':
				changed = ctx.setChannel(slider.channel, range.max, {
					reason: 'keyboard',
					channel: slider.channel,
					event
				});
				break;
			default:
				return;
		}

		event.preventDefault();
		if (changed) keyboardChanged = true;
	}

	function handleInput(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const next = Number(input.value);
		// A screen reader moves the native slider, and the swipe of a mobile one arrives here.
		if (
			!Number.isNaN(next) &&
			ctx.setChannel(slider.channel, next, { reason: 'input', channel: slider.channel, event })
		) {
			ctx.commit({ reason: 'input', channel: slider.channel, event });
		}
		input.value = String(value);
	}

	function handleFocus() {
		focused = true;
		focusVisible = shouldShowFocusVisible(inputRef);
	}

	function handleBlur(event: FocusEvent) {
		// A key still held when the focus leaves has no release to wait for.
		commitKeyboard(event);
		focused = false;
		focusVisible = false;
	}

	function handlePointerDown(
		event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }
	) {
		onpointerdown?.(event);
		if (event.defaultPrevented) return;
		slider.startDrag(event);
		// With the modality, and not a plain focus: the focus ring belongs to the keyboard, and a
		// press that leaves it on paints a ring the reader did not ask for.
		if (inputRef) focusWithModality(inputRef, 'pointer');
	}

	const positionStyle = $derived.by(() => {
		if (slider.orientation === 'vertical') {
			return `position: absolute; bottom: ${slider.percent}%; left: 50%; translate: -50% 50%;`;
		}
		// A physical `left`, because the `translate` that centers the thumb is physical too.
		const left = rtl ? 100 - slider.percent : slider.percent;
		return `position: absolute; left: ${left}%; top: 50%; translate: -50% -50%;`;
	});
	const resolvedStyle = $derived(`${positionStyle} touch-action: none;${style ? ` ${style}` : ''}`);
</script>

<div
	{...restProps}
	bind:this={thumbRef}
	class={className}
	style={resolvedStyle}
	data-color-picker-slider-thumb="true"
	data-channel={slider.channel}
	data-orientation={slider.orientation}
	data-dragging={slider.isDragging || undefined}
	data-disabled={ctx.isDisabled || undefined}
	data-readonly={ctx.isReadOnly || undefined}
	data-focused={focused || undefined}
	data-focus-visible={(focused && focusVisible) || undefined}
	onpointerdown={handlePointerDown}
>
	<input
		bind:this={inputRef}
		type="range"
		id={ctx.getPartId(`slider-input-${slider.channel}`)}
		min={range.min}
		max={range.max}
		step={range.step}
		value={String(value)}
		disabled={ctx.isDisabled}
		aria-label={ctx.getChannelLabel(slider.channel)}
		aria-valuetext={ctx.getChannelValueText(slider.channel)}
		aria-describedby={ctx.ariaDescribedBy}
		aria-orientation={slider.orientation}
		aria-readonly={ctx.isReadOnly || undefined}
		aria-invalid={ctx.isInvalid || undefined}
		data-color-picker-slider-input="true"
		data-channel={slider.channel}
		style="position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;border:0;opacity:0;cursor:inherit;pointer-events:none;"
		onkeydown={handleKeyDown}
		onkeyup={commitKeyboard}
		oninput={handleInput}
		onfocus={handleFocus}
		onblur={handleBlur}
	/>
	{#if children}
		{@render (children as Snippet<[ColorPickerSliderThumbRenderState]>)(renderState)}
	{/if}
</div>
