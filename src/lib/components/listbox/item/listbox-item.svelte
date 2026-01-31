<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useListBoxContext } from '../root/context';
	import { onMount, onDestroy } from 'svelte';

	/**
	 * Props for the ListBox.Item component.
	 */
	type ListBoxItemProps = Omit<HTMLAttributes<HTMLDivElement>, 'id' | 'children'> & {
		/** Unique identifier for this item. Used for selection tracking. */
		id: string | number;
		/** Text value for typeahead search. If not provided, extracted from content. */
		textValue?: string;
		/** Whether this item is disabled and non-selectable. */
		disabled?: boolean;
		/** CSS class to apply to the item element. */
		class?: string;
		/** Content to render inside the item. */
		children?: Snippet;

		// Override props for composition (e.g., ComboBox.Item wrapping ListBox.Item)
		/** Override the generated ID. Useful for components with custom ID requirements. */
		customId?: string;
		/** Disable real DOM focus handling. When true, no tabindex is set and focus events are skipped. */
		disableFocusHandling?: boolean;
		/** Override the focused state. When provided, this value is used instead of internal focus tracking. */
		isFocusedOverride?: boolean;
		/** Override the select behavior. When provided, called instead of default listbox selection. */
		onItemSelect?: (id: string | number, label: string) => void;
		/** Whether to scroll this item into view when focused. Useful for virtual focus patterns. */
		scrollOnFocus?: boolean;
		/** Additional disabled state from parent. */
		isParentDisabled?: boolean;
	};

	let {
		id,
		textValue,
		disabled = false,
		class: className = '',
		children,
		// Override props
		customId,
		disableFocusHandling = false,
		isFocusedOverride,
		onItemSelect,
		scrollOnFocus = false,
		isParentDisabled = false,
		...restProps
	}: ListBoxItemProps = $props();

	const listboxCtx = useListBoxContext();

	let elementRef: HTMLElement;
	let isSelected = $state(false);
	let isFocused = $state(false);
	let isHovered = $state(false);

	// Focus: use override if provided, otherwise use internal state
	const isFocusedComputed = $derived(
		isFocusedOverride !== undefined ? isFocusedOverride : isFocused
	);
	const isDisabledComputed = $derived(
		disabled || listboxCtx.disabledIds.has(id) || isParentDisabled
	);

	// ID: use custom if provided, otherwise generate
	const uniqueId = $derived(customId ?? `listbox-item-${id}`);

	let unsubscribeSelection: (() => void) | null = null;
	let unsubscribeFocus: (() => void) | null = null;

	onMount(() => {
		const computedTextValue = textValue || elementRef?.textContent?.trim() || String(id);

		// Register with ListBox context for selection state
		listboxCtx.registerItem(id, computedTextValue, elementRef);

		unsubscribeSelection = listboxCtx.subscribeToItem(id, (selected) => {
			isSelected = selected;
		});

		// Only subscribe to ListBox focus if focus handling is enabled
		if (!disableFocusHandling) {
			unsubscribeFocus = listboxCtx.subscribeToFocus(id, (focused) => {
				isFocused = focused;
			});
			listboxCtx.keyboardNav.updateItems();
		}
	});

	onDestroy(() => {
		listboxCtx.unregisterItem(id);
		unsubscribeSelection?.();
		unsubscribeFocus?.();
	});

	// Scroll into view when focused (if enabled)
	$effect(() => {
		if (scrollOnFocus && isFocusedComputed && elementRef) {
			requestAnimationFrame(() => {
				elementRef?.scrollIntoView({ block: 'nearest' });
			});
		}
	});

	function handleClick(event: MouseEvent) {
		if (isDisabledComputed) return;

		const label = textValue || elementRef?.textContent?.trim() || String(id);

		// Use custom select handler if provided, otherwise use listbox default
		if (onItemSelect) {
			onItemSelect(id, label);
		} else {
			listboxCtx.select(id);
			listboxCtx.setFocusedId(id);
		}
	}

	function handleFocus() {
		if (!disableFocusHandling) {
			listboxCtx.setFocusedId(id);
		}
	}

	function handleBlur() {}

	function handleMouseEnter() {
		if (!isDisabledComputed) {
			isHovered = true;
		}
	}

	function handleMouseLeave() {
		isHovered = false;
	}

	// Keyboard is handled by parent container
	function handleKeydown() {}
	function handleMouseDown(event: MouseEvent) {
		// Prevent focus stealing when used in ComboBox (disableFocusHandling=true)
		// This keeps the focus on the input while allowing click selection
		if (disableFocusHandling) {
			event.preventDefault();
		}
	}
</script>

<div
	bind:this={elementRef}
	role="option"
	id={uniqueId}
	class={className}
	tabindex={disableFocusHandling ? undefined : isFocusedComputed ? 0 : -1}
	aria-selected={isSelected}
	aria-disabled={isDisabledComputed || undefined}
	data-navigation-item={!disableFocusHandling || undefined}
	data-item-id={id}
	data-selected={isSelected || undefined}
	data-disabled={isDisabledComputed || undefined}
	data-focused={isFocusedComputed || undefined}
	data-hovered={isHovered || undefined}
	onmousedown={handleMouseDown}
	onclick={handleClick}
	onkeydown={handleKeydown}
	onfocus={handleFocus}
	onblur={handleBlur}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</div>
