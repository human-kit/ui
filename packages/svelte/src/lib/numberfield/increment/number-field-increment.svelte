<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonRoot } from '../../button/index.js';
	import { useNumberFieldContext } from '../root/context';

	type NumberFieldIncrementProps = HTMLButtonAttributes & {
		class?: string;
		children?: Snippet;
	};

	type ButtonMouseEvent = MouseEvent & { currentTarget: EventTarget & HTMLButtonElement };

	let {
		children,
		class: className,
		onclick,
		onmousedown,
		onpointerdown,
		onpointerup,
		onpointercancel,
		onpointerleave,
		...restProps
	}: NumberFieldIncrementProps = $props();

	const numberField = useNumberFieldContext();
	let repeatDelay: ReturnType<typeof setTimeout> | null = null;
	let repeatInterval: ReturnType<typeof setInterval> | null = null;
	let steppedOnPointerDown = false;

	const isStepDisabled = $derived(
		numberField.isDisabled ||
			numberField.isReadOnly ||
			(numberField.max !== undefined &&
				numberField.value !== null &&
				numberField.value >= numberField.max)
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

	function focusInput() {
		numberField.inputRef?.focus();
		numberField.syncFocusWithin();
	}

	function step(event: Event): boolean {
		if (isStepDisabled) return false;
		numberField.stepBy(1, { reason: 'increment-press', event });
		focusInput();
		return true;
	}

	function startRepeat(event: Event) {
		clearRepeatTimers();
		repeatDelay = setTimeout(() => {
			repeatInterval = setInterval(() => {
				step(event);
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
		clearRepeatTimers();
		onpointerup?.(event);
	}

	function handlePointerCancel(
		event: PointerEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		clearRepeatTimers();
		steppedOnPointerDown = false;
		onpointercancel?.(event);
	}

	function handlePointerLeave(
		event: PointerEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		clearRepeatTimers();
		onpointerleave?.(event);
	}

	function handleClick(event: ButtonMouseEvent) {
		if (!steppedOnPointerDown) {
			step(event);
		}
		steppedOnPointerDown = false;
		onclick?.(event);
	}

	onDestroy(clearRepeatTimers);
</script>

<ButtonRoot
	{...restProps}
	type="button"
	tabindex={-1}
	aria-label={numberField.incrementAriaLabel}
	aria-controls={numberField.inputId}
	isDisabled={isStepDisabled}
	class={className}
	data-number-field-increment="true"
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
		+
	{/if}
</ButtonRoot>
