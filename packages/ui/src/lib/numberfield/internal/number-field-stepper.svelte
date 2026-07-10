<script lang="ts">
	// Shared implementation for NumberField.Increment / NumberField.Decrement.
	import { onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonRoot } from '../../button/index.js';
	import { useNumberFieldContext } from '../root/context';

	type NumberFieldStepperProps = HTMLButtonAttributes & {
		class?: string;
		children?: Snippet;
		direction: 1 | -1;
	};

	type ButtonMouseEvent = MouseEvent & { currentTarget: EventTarget & HTMLButtonElement };

	let {
		direction,
		children,
		class: className,
		onclick,
		onmousedown,
		onpointerdown,
		onpointerup,
		onpointercancel,
		onpointerleave,
		...restProps
	}: NumberFieldStepperProps = $props();

	const numberField = useNumberFieldContext();
	let repeatDelay: ReturnType<typeof setTimeout> | null = null;
	let repeatInterval: ReturnType<typeof setInterval> | null = null;
	let steppedOnPointerDown = false;

	const isStepDisabled = $derived(
		numberField.isDisabled ||
			numberField.isReadOnly ||
			(direction === 1
				? numberField.max !== undefined &&
					numberField.value !== null &&
					numberField.value >= numberField.max
				: numberField.min !== undefined &&
					numberField.value !== null &&
					numberField.value <= numberField.min)
	);

	function clearRepeatTimers() {
		if (repeatDelay !== null) {
			clearTimeout(repeatDelay);
			repeatDelay = null;
		}
		if (repeatInterval !== null) {
			clearInterval(repeatInterval);
			repeatInterval = null;
		}
	}

	function stopRepeat() {
		clearRepeatTimers();
		removeWindowPointerListeners();
	}

	function handleWindowPointerEnd() {
		stopRepeat();
	}

	function addWindowPointerListeners() {
		if (typeof window === 'undefined') return;
		window.addEventListener('pointerup', handleWindowPointerEnd);
		window.addEventListener('pointercancel', handleWindowPointerEnd);
	}

	function removeWindowPointerListeners() {
		if (typeof window === 'undefined') return;
		window.removeEventListener('pointerup', handleWindowPointerEnd);
		window.removeEventListener('pointercancel', handleWindowPointerEnd);
	}

	function focusInput() {
		numberField.inputRef?.focus();
		numberField.syncFocusWithin();
	}

	function step(event: Event): boolean {
		if (isStepDisabled) return false;
		numberField.stepBy(direction, {
			reason: direction === 1 ? 'increment-press' : 'decrement-press',
			event
		});
		focusInput();
		return true;
	}

	function startRepeat(event: Event) {
		stopRepeat();
		// The button disables itself at the bound, which can suppress its own
		// pointerup; listen on window so the hold always ends with the press.
		addWindowPointerListeners();
		repeatDelay = setTimeout(() => {
			repeatInterval = setInterval(() => {
				if (!step(event)) {
					stopRepeat();
				}
			}, 60);
		}, 400);
	}

	function handleMouseDown(event: ButtonMouseEvent) {
		event.preventDefault();
		onmousedown?.(event);
	}

	function handlePointerDown(
		event: PointerEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		if (event.button !== 0) return;
		event.preventDefault();
		steppedOnPointerDown = step(event);
		if (steppedOnPointerDown) {
			startRepeat(event);
		}
		onpointerdown?.(event);
	}

	function handlePointerUp(
		event: PointerEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		stopRepeat();
		onpointerup?.(event);
	}

	function handlePointerCancel(
		event: PointerEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		stopRepeat();
		steppedOnPointerDown = false;
		onpointercancel?.(event);
	}

	function handlePointerLeave(
		event: PointerEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		stopRepeat();
		onpointerleave?.(event);
	}

	function handleClick(event: ButtonMouseEvent) {
		if (!steppedOnPointerDown) {
			step(event);
		}
		steppedOnPointerDown = false;
		onclick?.(event);
	}

	onDestroy(stopRepeat);
</script>

<ButtonRoot
	{...restProps}
	type="button"
	tabindex={-1}
	aria-label={direction === 1 ? numberField.incrementAriaLabel : numberField.decrementAriaLabel}
	aria-controls={numberField.inputId}
	disabled={isStepDisabled}
	class={className}
	{...direction === 1
		? { 'data-number-field-increment': 'true' }
		: { 'data-number-field-decrement': 'true' }}
	data-disabled={isStepDisabled || undefined}
	data-readonly={numberField.isReadOnly || undefined}
	data-invalid={numberField.isInvalid || undefined}
	data-scrubbing={numberField.scrubbing || undefined}
	onmousedown={handleMouseDown}
	onpointerdown={handlePointerDown}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerCancel}
	onpointerleave={handlePointerLeave}
	onclick={handleClick}
>
	{#if children}
		{@render children()}
	{:else}
		{direction === 1 ? '+' : '-'}
	{/if}
</ButtonRoot>
