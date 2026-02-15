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
		if (buttonRef) {
			datePicker.setTriggerRef(buttonRef);
		}
	});

	function handleFocus() {
		if (buttonRef) {
			datePicker.setTriggerRef(buttonRef);
			isFocused = true;
			datePicker.syncFocusWithin();
			datePicker.setFocusVisible(buttonRef.matches(':focus-visible'));
		}
	}

	function handleBlur() {
		isFocused = false;
		queueMicrotask(() => {
			datePicker.syncFocusWithin();
		});
	}

	function handleMouseDown(event: MouseEvent) {
		if (datePicker.isDisabled) return;
		datePicker.setFocusVisible(false);
		event.preventDefault();
	}

	function handleClick() {
		if (datePicker.isDisabled) return;
		if (buttonRef) {
			datePicker.setTriggerRef(buttonRef);
		}
		datePicker.togglePopover();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (datePicker.isDisabled) return;
		if (event.key !== 'ArrowLeft') return;
		datePicker.setFocusVisible(true);

		const root = document.getElementById(datePicker.id);
		if (!root) return;
		const segments = Array.from(
			root.querySelectorAll<HTMLElement>('[data-date-picker-segment="true"]')
		);
		const target = segments[segments.length - 1];
		if (!target) return;

		event.preventDefault();
		target.focus();
	}
</script>

<button
	bind:this={buttonRef}
	type="button"
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
	{:else}
		<span aria-hidden="true">📅</span>
	{/if}
</button>
