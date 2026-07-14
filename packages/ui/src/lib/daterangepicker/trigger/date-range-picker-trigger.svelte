<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonRoot } from '../../button/index.js';
	import { useDateRangePickerContext } from '../root/context';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';

	type DateRangePickerTriggerProps = Omit<
		HTMLButtonAttributes,
		'type' | 'children' | 'class' | 'onclick' | 'aria-haspopup' | 'aria-expanded'
	> & {
		children?: Snippet;
		class?: string;
	};

	let { children, class: className = '', ...restProps }: DateRangePickerTriggerProps = $props();

	let buttonRef: HTMLButtonElement | null = $state(null);
	let isFocused = $state(false);
	const dateRangePicker = useDateRangePickerContext();

	$effect(() => {
		if (dateRangePicker.isReadOnly) {
			dateRangePicker.setTriggerRef(null);
			return;
		}
		if (buttonRef) {
			dateRangePicker.setTriggerRef(buttonRef);
		}
		const registeredRef = buttonRef;
		return () => {
			if (registeredRef && dateRangePicker.triggerRef === registeredRef) {
				dateRangePicker.setTriggerRef(null);
			}
		};
	});

	function handleFocus() {
		if (dateRangePicker.isDisabled) {
			isFocused = false;
			return;
		}
		if (buttonRef) {
			dateRangePicker.setTriggerRef(buttonRef);
			dateRangePicker.setActiveSegment('end', null);
			isFocused = true;
			dateRangePicker.syncFocusWithin();
			dateRangePicker.setFocusVisible(shouldShowFocusVisible(buttonRef));
		}
	}

	function handleBlur() {
		isFocused = false;
		queueMicrotask(() => {
			dateRangePicker.syncFocusWithin();
		});
	}

	function handleMouseDown(event: MouseEvent) {
		if (dateRangePicker.isDisabled || dateRangePicker.isReadOnly) return;
		trackInteractionModality(event, buttonRef);
		dateRangePicker.setFocusVisible(false);
		event.preventDefault();
	}

	function handleClick(event: MouseEvent) {
		if (dateRangePicker.isDisabled || dateRangePicker.isReadOnly) return;
		if (event.detail > 0) {
			trackInteractionModality(event, buttonRef);
		}
		if (buttonRef) {
			dateRangePicker.setTriggerRef(buttonRef);
		}
		dateRangePicker.togglePopover('trigger-press', event);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (dateRangePicker.isDisabled) return;
		trackInteractionModality(event, buttonRef);
		if (event.key === 'Enter' || event.key === ' ') {
			dateRangePicker.setFocusVisible(true);
			return;
		}
		if (event.key !== 'ArrowLeft') return;
		dateRangePicker.setFocusVisible(true);

		event.preventDefault();
		dateRangePicker.focusLastSegment('end');
	}
</script>

{#if !dateRangePicker.isReadOnly}
	<ButtonRoot
		bind:element={buttonRef}
		type="button"
		disabled={dateRangePicker.isDisabled}
		pressed={dateRangePicker.open || undefined}
		class={className}
		aria-haspopup="dialog"
		aria-expanded={dateRangePicker.open}
		data-focused={isFocused || undefined}
		data-focus-visible={isFocused && dateRangePicker.focusVisible ? 'true' : undefined}
		onmousedown={handleMouseDown}
		onfocus={handleFocus}
		onblur={handleBlur}
		onkeydown={handleKeydown}
		onclick={handleClick}
		{...restProps}
	>
		{#if children}
			{@render children()}
		{/if}
	</ButtonRoot>
{/if}
