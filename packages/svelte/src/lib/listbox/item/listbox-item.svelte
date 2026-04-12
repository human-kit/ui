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
		/** Callback with resolved text value when mounted (from prop or rendered content). */
		onResolvedTextValue?: (label: string) => void;
		/** Whether to scroll this item into view when focused. Useful for virtual focus patterns. */
		scrollOnFocus?: boolean;
		/** Additional disabled state from parent. */
		isParentDisabled?: boolean;
		/** Override the visual pressed state. When provided, this value is used instead of internal press tracking. */
		pressed?: boolean;
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
		onResolvedTextValue,
		scrollOnFocus = false,
		isParentDisabled = false,
		pressed: pressedOverride,
		...restProps
	}: ListBoxItemProps = $props();

	const listboxCtx = useListBoxContext();

	let elementRef: HTMLElement;
	let isSelected = $state(false);
	let isFocused = $state(false);
	let isHovered = $state(false);
	let isPressed = $state(false);
	let pressedKey: 'Enter' | 'Space' | null = $state(null);

	// Focus: use override if provided, otherwise use internal state
	const isFocusedComputed = $derived(
		isFocusedOverride !== undefined ? isFocusedOverride : isFocused
	);
	const isDisabledComputed = $derived(
		disabled || listboxCtx.disabledIds.has(id) || isParentDisabled
	);
	const isPressedComputed = $derived(
		pressedOverride !== undefined
			? Boolean(pressedOverride) && !isDisabledComputed
			: isPressed && !isDisabledComputed
	);

	// ID: use custom if provided, otherwise generate
	const uniqueId = $derived(customId ?? `listbox-item-${id}`);

	let unsubscribeSelection: (() => void) | null = null;
	let unsubscribeFocus: (() => void) | null = null;

	function getResolvedTextValue() {
		return textValue || elementRef?.textContent?.trim() || String(id);
	}

	onMount(() => {
		const computedTextValue = getResolvedTextValue();

		// Register with ListBox context for selection state
		listboxCtx.registerItem(id, computedTextValue, elementRef);
		onResolvedTextValue?.(computedTextValue);

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

	$effect(() => {
		if (!isDisabledComputed) return;
		clearPressedState();
		isHovered = false;
	});

	function clearPressedState() {
		isPressed = false;
		pressedKey = null;
	}

	function handleClick() {
		if (isDisabledComputed) return;

		const label = getResolvedTextValue();

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

	function handlePointerDown(event: PointerEvent) {
		if (isDisabledComputed) {
			event.preventDefault();
			clearPressedState();
			return;
		}

		if (event.button !== 0) return;
		isPressed = true;
		pressedKey = null;
	}

	function handlePointerUp(event: PointerEvent) {
		if (event.button !== 0) return;
		isPressed = false;
		pressedKey = null;
	}

	function handlePointerCancel() {
		clearPressedState();
	}

	function handlePointerEnter(event: PointerEvent) {
		if (isDisabledComputed) return;

		if ((event.buttons & 1) === 1 && pressedKey === null) {
			isPressed = true;
		}
	}

	function handlePointerLeave() {
		if (pressedKey === null) {
			isPressed = false;
		}
	}

	function handleMouseEnter() {
		if (!isDisabledComputed) {
			isHovered = true;
		}
	}

	function handleMouseLeave() {
		isHovered = false;
		if (pressedKey === null) {
			isPressed = false;
		}
	}

	// Keyboard is handled by parent container
	function handleKeydown(event: KeyboardEvent) {
		const key =
			event.key === 'Enter'
				? 'Enter'
				: event.key === ' ' || event.key === 'Spacebar'
					? 'Space'
					: null;

		if (!key) return;

		if (isDisabledComputed) {
			event.preventDefault();
			clearPressedState();
			return;
		}

		if (event.repeat && isPressed && pressedKey === key) return;

		isPressed = true;
		pressedKey = key;
	}

	function handleKeyup(event: KeyboardEvent) {
		const key =
			event.key === 'Enter'
				? 'Enter'
				: event.key === ' ' || event.key === 'Spacebar'
					? 'Space'
					: null;

		if (!key) return;

		if (isDisabledComputed) {
			event.preventDefault();
			clearPressedState();
			return;
		}

		if (pressedKey === key) {
			clearPressedState();
		}
	}

	function handleMouseDown(event: MouseEvent) {
		// Prevent focus stealing when used in ComboBox (disableFocusHandling=true)
		// This keeps the focus on the input while allowing click selection
		if (isDisabledComputed) {
			event.preventDefault();
			clearPressedState();
			return;
		}

		if (event.button === 0) {
			isPressed = true;
			pressedKey = null;
		}

		if (disableFocusHandling) {
			event.preventDefault();
		}
	}

	function handleMouseUp(event: MouseEvent) {
		if (event.button !== 0) return;
		if (pressedKey === null) {
			clearPressedState();
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
	data-item-id-type={typeof id === 'number' ? 'number' : 'string'}
	data-selected={isSelected || undefined}
	data-disabled={isDisabledComputed || undefined}
	data-focused={isFocusedComputed || undefined}
	data-hovered={isHovered || undefined}
	data-pressed={isPressedComputed || undefined}
	onpointerdown={handlePointerDown}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerCancel}
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
	onmousedown={handleMouseDown}
	onmouseup={handleMouseUp}
	onclick={handleClick}
	onkeydown={handleKeydown}
	onkeyup={handleKeyup}
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
