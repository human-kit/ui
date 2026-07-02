<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonRoot } from '../../button/index.js';
	import { useTimePickerContext } from '../root/context';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { composeEventHandlers } from '../internal/strict-props';

	type TimePickerTriggerProps = Omit<
		HTMLButtonAttributes,
		'type' | 'children' | 'class' | 'aria-haspopup' | 'aria-expanded'
	> & {
		children?: Snippet;
		class?: string;
	};

	let {
		children,
		class: className = '',
		onmousedown: onMouseDownExternal,
		onfocus: onFocusExternal,
		onblur: onBlurExternal,
		onkeydown: onKeydownExternal,
		onclick: onClickExternal,
		...restProps
	}: TimePickerTriggerProps = $props();

	let buttonRef: HTMLButtonElement | null = $state(null);
	let isFocused = $state(false);
	const timePicker = useTimePickerContext();

	$effect(() => {
		if (timePicker.isReadOnly) {
			timePicker.setTriggerRef(null);
			return;
		}
		if (buttonRef) {
			timePicker.setTriggerRef(buttonRef);
		}
	});

	function handleFocus() {
		if (timePicker.isDisabled) {
			isFocused = false;
			return;
		}
		if (!buttonRef) return;
		timePicker.setTriggerRef(buttonRef);
		timePicker.setActiveSegment(null);
		isFocused = true;
		timePicker.syncFocusWithin();
		timePicker.setFocusVisible(shouldShowFocusVisible(buttonRef));
	}

	function handleBlur() {
		isFocused = false;
		queueMicrotask(() => {
			timePicker.syncFocusWithin();
		});
	}

	function handleMouseDown(event: MouseEvent) {
		if (timePicker.isDisabled || timePicker.isReadOnly) return;
		trackInteractionModality(event, buttonRef);
		timePicker.setFocusVisible(false);
		event.preventDefault();
	}

	function handleClick(event: MouseEvent) {
		if (timePicker.isDisabled || timePicker.isReadOnly) return;
		if (event.detail > 0) {
			trackInteractionModality(event, buttonRef);
		}
		if (buttonRef) {
			timePicker.setTriggerRef(buttonRef);
		}
		timePicker.togglePopover('trigger-press', event);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (timePicker.isDisabled) return;
		trackInteractionModality(event, buttonRef);
		if (event.key === 'Enter' || event.key === ' ') {
			timePicker.setFocusVisible(true);
			return;
		}
		if (event.key !== 'ArrowLeft') return;
		timePicker.setFocusVisible(true);
		event.preventDefault();
		timePicker.focusLastSegment();
	}
</script>

{#if !timePicker.isReadOnly}
	<ButtonRoot
		bind:element={buttonRef}
		type="button"
		disabled={timePicker.isDisabled}
		class={className}
		aria-haspopup="dialog"
		aria-expanded={timePicker.open}
		data-focused={isFocused || undefined}
		data-focus-visible={isFocused && timePicker.focusVisible ? 'true' : undefined}
		{...restProps}
		onmousedown={composeEventHandlers(handleMouseDown, onMouseDownExternal ?? undefined)}
		onfocus={composeEventHandlers(handleFocus, onFocusExternal ?? undefined)}
		onblur={composeEventHandlers(handleBlur, onBlurExternal ?? undefined)}
		onkeydown={composeEventHandlers(handleKeydown, onKeydownExternal ?? undefined, {
			skipExternalOnDefaultPrevented: true
		})}
		onclick={composeEventHandlers(handleClick, onClickExternal ?? undefined, {
			skipExternalOnDefaultPrevented: true
		})}
	>
		{#if children}
			{@render children()}
		{/if}
	</ButtonRoot>
{/if}
