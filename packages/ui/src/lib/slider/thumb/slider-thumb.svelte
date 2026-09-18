<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { readable } from 'svelte/store';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { isRtl } from '../../internal/rtl';
	import { getLocaleContext } from '../../locale-provider/context';
	import { watchFocusVisible } from '../../primitives/focus-visible.svelte';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { useSliderContext, type SliderChangeDetails } from '../root/context';
	import type { SliderThumbProps, SliderThumbRenderState } from '../types';

	/**
	 * Slider.Thumb — the handle of one value.
	 *
	 * The element the user sees is a `<div>` positioned along the track. Inside it, a native
	 * `<input type="range">` fills the thumb, invisible, and it is what has the focus and the ARIA
	 * state. The native input gives the role and the value to a screen reader, and it receives
	 * the swipe of a mobile screen reader as an `input` event. The keyboard is handled here and
	 * not by the input, so that the steps, the large steps and the text direction are the same in
	 * every browser.
	 */
	let {
		index: indexProp,
		name,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		style,
		onpointerdown,
		...restProps
	}: SliderThumbProps = $props();

	const ctx = useSliderContext('Slider.Thumb');
	const localeStore = getLocaleContext()?.locale ?? readable<string | undefined>(undefined);

	let thumbRef: HTMLDivElement | null = $state(null);
	let inputRef: HTMLInputElement | null = $state(null);

	const registration = ctx.registerThumb({
		index: untrack(() => indexProp),
		inputRef: () => inputRef
	});
	const index = registration.index;
	const inputId = ctx.getThumbInputId(index);

	$effect(() => {
		element = thumbRef;
		return () => {
			element = null;
		};
	});

	$effect(() => registration.unregister);

	const value = $derived(ctx.values[index] ?? ctx.min);
	const percent = $derived(ctx.getPercent(value));
	const text = $derived(ctx.formatValue(value));
	const valueText = $derived(ctx.getValueText(value, index));
	const dragging = $derived(ctx.draggingIndex === index);
	const focused = $derived(ctx.focusedIndex === index);
	const focusVisible = $derived(focused && ctx.isFocusVisible);

	// Two thumbs with the same name are two sliders the screen reader cannot tell apart. A range
	// of two gets "Minimum" and "Maximum" when the consumer gives no name of its own.
	const defaultLabel = $derived.by(() => {
		if (ctx.values.length !== 2) return undefined;
		return resolveLocalizedString($localeStore, index === 0 ? 'slider.minimum' : 'slider.maximum');
	});
	const ownLabel = $derived(ariaLabel ?? (ariaLabelledBy ? undefined : defaultLabel));
	const ownLabelSource = $derived(ariaLabelledBy ?? (ownLabel ? inputId : null));
	// The name of the group: the label, the ids the consumer gave, or the root element itself
	// when it carries an `aria-label`.
	const groupLabelSource = $derived(
		ctx.ariaLabelledBy ?? ctx.labelId ?? (ctx.ariaLabel ? ctx.rootId : null)
	);
	const inputAriaLabel = $derived(
		ownLabel ?? (groupLabelSource === ctx.rootId ? ctx.ariaLabel : undefined)
	);
	const inputLabelledBy = $derived.by(() => {
		if (!ownLabelSource) {
			return groupLabelSource && groupLabelSource !== ctx.rootId ? groupLabelSource : undefined;
		}
		return groupLabelSource ? `${ownLabelSource} ${groupLabelSource}` : ownLabelSource;
	});

	// The native input keeps the value: a screen reader reads it from there, and a form sends it.
	$effect(() => {
		if (!inputRef) return;
		const nextValue = String(value);
		if (inputRef.value !== nextValue) inputRef.value = nextValue;
	});

	// The focus ring must appear when a pointer press is followed by a key press, and the
	// modality alone changes there: no focus event fires to re-read it.
	watchFocusVisible({
		isFocused: () => focused,
		element: () => inputRef,
		set: (visible) => ctx.setFocusVisible(visible)
	});

	const positionStyle = $derived.by(() => {
		if (ctx.orientation === 'vertical') {
			return `position: absolute; bottom: ${percent}%; left: 50%; translate: -50% 50%;`;
		}
		// A physical `left`, because the `translate` that centers the thumb is physical too.
		const left = ctx.isRtl ? 100 - percent : percent;
		return `position: absolute; left: ${left}%; top: 50%; translate: -50% -50%;`;
	});
	const resolvedStyle = $derived(`${positionStyle} touch-action: none;${style ? ` ${style}` : ''}`);

	function handleKeyDown(event: KeyboardEvent) {
		if (event.defaultPrevented) return;
		if (event.ctrlKey || event.metaKey || event.altKey) return;

		const horizontal = ctx.orientation === 'horizontal';
		const rtl = horizontal && isRtl(thumbRef);
		let direction: -1 | 1 | null = null;
		let large = event.shiftKey;
		let absolute: number | null = null;

		switch (event.key) {
			case 'ArrowRight':
				direction = rtl ? -1 : 1;
				break;
			case 'ArrowLeft':
				direction = rtl ? 1 : -1;
				break;
			case 'ArrowUp':
				direction = 1;
				break;
			case 'ArrowDown':
				direction = -1;
				break;
			case 'PageUp':
				direction = 1;
				large = true;
				break;
			case 'PageDown':
				direction = -1;
				large = true;
				break;
			case 'Home':
				absolute = ctx.min;
				break;
			case 'End':
				absolute = ctx.max;
				break;
			default:
				return;
		}

		// The native input would step on its own, in its own amounts.
		event.preventDefault();
		trackInteractionModality(event, inputRef);
		if (focused) ctx.setFocusVisible(true);
		if (ctx.isReadOnly) return;

		if (absolute !== null) {
			const details: SliderChangeDetails = { reason: 'keyboard', index, event };
			if (ctx.setValueAt(index, absolute, details)) ctx.commitValue(details);
			return;
		}
		if (direction !== null) {
			ctx.stepValueAt(index, direction, { large, event });
		}
	}

	// A change that did not come through the keyboard handler: a mobile screen reader swipe, or
	// a browser feature that writes the native input.
	function handleInput(event: Event) {
		if (!inputRef) return;
		const nextValue = Number(inputRef.value);
		if (Number.isFinite(nextValue) && nextValue !== value && !ctx.isReadOnly) {
			const details: SliderChangeDetails = { reason: 'input', index, event };
			if (ctx.setValueAt(index, nextValue, details)) ctx.commitValue(details);
		}
		// Re-sync when the change was refused, or clamped by a neighbor.
		inputRef.value = String(ctx.values[index] ?? ctx.min);
	}

	function handleFocus() {
		ctx.setThumbFocus(index, true);
		ctx.setFocusVisible(shouldShowFocusVisible(inputRef));
	}

	function handleBlur() {
		ctx.setThumbFocus(index, false);
	}

	function handlePointerDown(
		event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }
	) {
		onpointerdown?.(event);
		if (event.defaultPrevented) return;
		// The thumb keeps its value at the press; only a move changes it.
		ctx.startDrag(event, index);
	}

	const renderState = $derived<SliderThumbRenderState>({ value, text, index, dragging, focused });
</script>

<div
	{...restProps}
	bind:this={thumbRef}
	class={className}
	style={resolvedStyle}
	data-slider-thumb="true"
	data-index={index}
	data-orientation={ctx.orientation}
	data-disabled={ctx.isDisabled || undefined}
	data-readonly={ctx.isReadOnly || undefined}
	data-invalid={ctx.isInvalid || undefined}
	data-dragging={dragging || undefined}
	data-focused={focused || undefined}
	data-focus-visible={focusVisible || undefined}
	onpointerdown={handlePointerDown}
>
	<input
		bind:this={inputRef}
		type="range"
		id={inputId}
		name={name ?? ctx.name}
		form={ctx.form}
		min={ctx.min}
		max={ctx.max}
		step={ctx.step}
		value={String(value)}
		disabled={ctx.isDisabled}
		aria-orientation={ctx.orientation}
		aria-valuenow={value}
		aria-valuetext={valueText}
		aria-label={inputAriaLabel}
		aria-labelledby={inputLabelledBy}
		aria-describedby={ctx.ariaDescribedBy}
		aria-readonly={ctx.isReadOnly || undefined}
		aria-invalid={ctx.isInvalid || undefined}
		data-slider-input="true"
		data-index={index}
		style="position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;border:0;opacity:0;cursor:inherit;pointer-events:none;"
		onkeydown={handleKeyDown}
		oninput={handleInput}
		onfocus={handleFocus}
		onblur={handleBlur}
	/>
	{#if children}
		{@render (children as Snippet<[SliderThumbRenderState]>)(renderState)}
	{/if}
</div>
