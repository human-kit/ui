<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { useDatePickerContext } from '../root/context';

	type DatePickerTriggerProps = Omit<
		HTMLButtonAttributes,
		'type' | 'children' | 'class' | 'onclick' | 'aria-haspopup' | 'aria-expanded'
	> & {
		children?: Snippet;
		class?: string;
	};

	let { children, class: className = '', ...restProps }: DatePickerTriggerProps = $props();

	let buttonRef: HTMLButtonElement | null = $state(null);
	let isFocused = $state(false);
	const datePicker = useDatePickerContext();

	$effect(() => {
		if (datePicker.isReadOnly) {
			datePicker.setTriggerRef(null);
			return;
		}
		if (buttonRef) {
			datePicker.setTriggerRef(buttonRef);
		}
	});

	function handleFocus() {
		if (datePicker.isDisabled) {
			isFocused = false;
			return;
		}
		if (buttonRef) {
			datePicker.setTriggerRef(buttonRef);
			datePicker.setActiveSegment(null);
			isFocused = true;
			datePicker.syncFocusWithin();
			if (datePicker.consumeTriggerFocusVisibleSuppression()) {
				datePicker.setFocusVisible(false);
			} else {
				datePicker.setFocusVisible(buttonRef.matches(':focus-visible'));
			}
		}
	}

	function handleBlur() {
		isFocused = false;
		queueMicrotask(() => {
			datePicker.syncFocusWithin();
		});
	}

	function handleMouseDown(event: MouseEvent) {
		if (datePicker.isDisabled || datePicker.isReadOnly) return;
		datePicker.setTriggerInteractionModality('pointer');
		datePicker.setFocusVisible(false);
		event.preventDefault();
	}

	function handleClick(event: MouseEvent) {
		if (datePicker.isDisabled || datePicker.isReadOnly) return;
		if (event.detail === 0) {
			datePicker.setTriggerInteractionModality('keyboard');
		}
		if (buttonRef) {
			datePicker.setTriggerRef(buttonRef);
		}
		datePicker.togglePopover('trigger-press', event);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (datePicker.isDisabled) return;
		if (event.key === 'Enter' || event.key === ' ') {
			datePicker.setTriggerInteractionModality('keyboard');
			datePicker.setFocusVisible(true);
			return;
		}
		if (event.key !== 'ArrowLeft') return;
		datePicker.setTriggerInteractionModality('keyboard');
		datePicker.setFocusVisible(true);

		event.preventDefault();
		datePicker.focusLastSegment();
	}
</script>

{#if !datePicker.isReadOnly}
	<button
		bind:this={buttonRef}
		type="button"
		disabled={datePicker.isDisabled}
		class={className}
		aria-haspopup="dialog"
		aria-expanded={datePicker.open}
		data-disabled={datePicker.isDisabled || undefined}
		data-focused={isFocused || undefined}
		data-focus-visible={isFocused && datePicker.focusVisible ? 'true' : undefined}
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
	</button>
{/if}
