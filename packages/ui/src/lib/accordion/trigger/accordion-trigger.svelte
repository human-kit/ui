<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { ButtonRoot } from '../../button/index.js';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { useAccordionContext } from '../root/context.svelte';
	import { useAccordionItemContext } from '../item/context';
	import { isRtl } from '../../internal/rtl';
	import type { AccordionTriggerProps } from '../types.js';

	type AccordionTriggerMouseEvent = MouseEvent & {
		currentTarget: EventTarget & HTMLButtonElement;
	};
	type AccordionTriggerFocusEvent = FocusEvent & {
		currentTarget: EventTarget & HTMLButtonElement;
	};
	type AccordionTriggerKeyboardEvent = KeyboardEvent & {
		currentTarget: EventTarget & HTMLButtonElement;
	};

	let {
		children,
		class: className = '',
		element = $bindable<HTMLButtonElement | null>(null),
		onclick: onClickExternal,
		onfocus: onFocusExternal,
		onblur: onBlurExternal,
		onkeydown: onKeyDownExternal,
		onmousedown: onMouseDownExternal,
		...restProps
	}: AccordionTriggerProps = $props();

	const accordion = useAccordionContext();
	const item = useAccordionItemContext();

	const triggerId = $derived(accordion.getTriggerId(item.value));
	const panelId = $derived(accordion.getPanelId(item.value));

	let buttonRef: HTMLButtonElement | null = $state(null);
	let registeredValue = untrack(() => item.value);

	untrack(() => {
		accordion.registerItem(registeredValue, { isDisabled: item.isDisabled });
	});

	const open = $derived(accordion.isOpen(item.value));
	const disabled = $derived(accordion.isItemDisabled(item.value));
	const focused = $derived(accordion.isFocused(item.value));
	const focusVisible = $derived(accordion.isFocusVisible(item.value));
	const orientation = $derived(accordion.orientation);

	$effect(() => {
		if (!Object.is(registeredValue, item.value)) {
			accordion.unregisterItem(registeredValue);
			registeredValue = item.value;
		}
		element = buttonRef;
		accordion.registerItem(registeredValue, { isDisabled: item.isDisabled, element: buttonRef });
	});

	onDestroy(() => {
		accordion.unregisterItem(registeredValue);
	});

	function moveFocus(value: ReturnType<typeof accordion.getFirstEnabledValue>) {
		if (value === null) return;
		accordion.setFocusVisible(true);
		accordion.focusValue(value);
	}

	function handleClick(event: AccordionTriggerMouseEvent) {
		if (disabled) {
			event.preventDefault();
			onClickExternal?.(event);
			return;
		}

		accordion.setFocusVisible(false);
		accordion.setFocusedValue(item.value);
		accordion.toggleValue(item.value);
		onClickExternal?.(event);
	}

	function handleFocus(event: AccordionTriggerFocusEvent) {
		if (!disabled) {
			accordion.setFocusedValue(item.value);
			accordion.setFocusVisible(shouldShowFocusVisible(buttonRef));
		}
		onFocusExternal?.(event);
	}

	function handleBlur(event: AccordionTriggerFocusEvent) {
		if (accordion.isFocused(item.value)) {
			accordion.setFocusedValue(null);
			accordion.setFocusVisible(false);
		}
		onBlurExternal?.(event);
	}

	function handleKeyDown(event: AccordionTriggerKeyboardEvent) {
		trackInteractionModality(event, buttonRef);
		if (focused) {
			accordion.setFocusVisible(true);
		}

		if (!disabled && !accordion.isDisabled) {
			// In horizontal orientation the arrows are physical: under RTL the
			// visual "next" trigger is the previous one in DOM order (APG).
			const horizontal = orientation === 'horizontal';
			const rtl = horizontal && isRtl(buttonRef);
			const nextKeys = horizontal ? [rtl ? 'ArrowLeft' : 'ArrowRight'] : ['ArrowDown'];
			const previousKeys = horizontal ? [rtl ? 'ArrowRight' : 'ArrowLeft'] : ['ArrowUp'];

			if (nextKeys.includes(event.key)) {
				event.preventDefault();
				moveFocus(accordion.getNextEnabledValue(item.value, 1));
				return;
			}

			if (previousKeys.includes(event.key)) {
				event.preventDefault();
				moveFocus(accordion.getNextEnabledValue(item.value, -1));
				return;
			}

			if (event.key === 'Home') {
				event.preventDefault();
				moveFocus(accordion.getFirstEnabledValue());
				return;
			}

			if (event.key === 'End') {
				event.preventDefault();
				moveFocus(accordion.getLastEnabledValue());
				return;
			}
		}

		onKeyDownExternal?.(event);
	}

	function handleMouseDown(event: AccordionTriggerMouseEvent) {
		trackInteractionModality(event, buttonRef);
		accordion.setFocusVisible(false);
		onMouseDownExternal?.(event);
	}
</script>

<ButtonRoot
	{...restProps}
	bind:element={buttonRef}
	id={triggerId}
	type="button"
	aria-expanded={open ? 'true' : 'false'}
	aria-controls={panelId}
	{disabled}
	class={className}
	data-accordion-trigger="true"
	data-accordion-value={String(item.value)}
	data-accordion-value-type={typeof item.value}
	data-open={open || undefined}
	data-disabled={disabled || undefined}
	data-focused={focused || undefined}
	data-focus-visible={focusVisible || undefined}
	data-orientation={orientation}
	onclick={handleClick}
	onfocus={handleFocus}
	onblur={handleBlur}
	onkeydown={handleKeyDown}
	onmousedown={handleMouseDown}
>
	{@render children?.()}
</ButtonRoot>
