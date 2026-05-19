<script lang="ts" module>
	type PointerPressOwner = {
		key: symbol;
		pointerId: number | null;
	};

	let pointerPressOwner: PointerPressOwner | null = null;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useListBoxContext } from '../root/context';
	import { onMount, onDestroy } from 'svelte';
	import {
		focusWithModality,
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';

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
		/** Override the focus-visible presentation state. */
		isFocusVisibleOverride?: boolean;
		/** Override the select behavior. When provided, called instead of default listbox selection. */
		onItemSelect?: (id: string | number, label: string) => void;
		/** Callback with resolved text value when mounted (from prop or rendered content). */
		onResolvedTextValue?: (label: string) => void;
		/** Callback when pointer hover should move logical focus to this item. */
		onItemHoverStart?: (id: string | number, label: string) => void;
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
		isFocusVisibleOverride,
		onItemSelect,
		onResolvedTextValue,
		onItemHoverStart,
		scrollOnFocus = false,
		isParentDisabled = false,
		pressed: pressedOverride,
		...restProps
	}: ListBoxItemProps = $props();

	const listboxCtx = useListBoxContext();

	let elementRef: HTMLElement;
	let isSelected = $state(false);
	let isFocused = $state(false);
	let isFocusVisible = $state(false);
	let listFocusVisible = $state(false);
	let isHovered = $state(false);
	let isPressed = $state(false);
	let pressedKey: 'Enter' | 'Space' | null = $state(null);
	let suppressNextFocusVisible = $state(false);

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
	const isFocusVisibleComputed = $derived(
		isFocusVisibleOverride !== undefined ? isFocusVisibleOverride : isFocusVisible
	);
	const isActiveFocusVisible = $derived(
		isFocusVisibleOverride !== undefined
			? isFocusVisibleComputed
			: isFocusedComputed && listFocusVisible
	);
	const showFocusVisible = $derived(isActiveFocusVisible && !isHovered);
	const showHovered = $derived(isHovered && !isActiveFocusVisible);

	// ID: use custom if provided, otherwise generate
	const uniqueId = $derived(customId ?? `listbox-item-${id}`);
	const pointerPressOwnerKey = Symbol('listbox-item-press');

	let unsubscribeSelection: (() => void) | null = null;
	let unsubscribeFocus: (() => void) | null = null;
	let unsubscribeFocusVisible: (() => void) | null = null;

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
			unsubscribeFocusVisible = listboxCtx.subscribeToFocusVisible((visible) => {
				listFocusVisible = visible;
			});
			listboxCtx.keyboardNav.updateItems();
		}

		window.addEventListener('pointerup', handleGlobalPointerEnd);
		window.addEventListener('pointercancel', handleGlobalPointerEnd);
		window.addEventListener('mouseup', handleGlobalPointerEnd);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('pointerup', handleGlobalPointerEnd);
			window.removeEventListener('pointercancel', handleGlobalPointerEnd);
			window.removeEventListener('mouseup', handleGlobalPointerEnd);
		}
		clearOwnedPointerPress();
		listboxCtx.unregisterItem(id);
		unsubscribeSelection?.();
		unsubscribeFocus?.();
		unsubscribeFocusVisible?.();
	});

	// Scroll into view when focused (if enabled)
	$effect(() => {
		if (scrollOnFocus && isFocusedComputed && isFocusVisibleComputed && elementRef) {
			requestAnimationFrame(() => {
				elementRef?.scrollIntoView({ block: 'nearest' });
			});
		}
	});

	$effect(() => {
		if (!isDisabledComputed) return;
		clearPressedState();
		isHovered = false;
		isFocusVisible = false;
	});

	$effect(() => {
		if (!isFocusedComputed) {
			if (pressedKey !== null) {
				clearPressedState();
			}
			return;
		}

		if (listFocusVisible || isFocusVisibleComputed) {
			isHovered = false;
		}
	});

	function getEventPointerId(event: PointerEvent | MouseEvent) {
		return 'pointerId' in event ? event.pointerId : null;
	}

	function ownsPointerPress(event: PointerEvent | MouseEvent) {
		if (pointerPressOwner?.key !== pointerPressOwnerKey) {
			return false;
		}

		const pointerId = getEventPointerId(event);

		return (
			pointerPressOwner.pointerId === null ||
			pointerId === null ||
			pointerPressOwner.pointerId === pointerId
		);
	}

	function clearOwnedPointerPress() {
		if (pointerPressOwner?.key === pointerPressOwnerKey) {
			pointerPressOwner = null;
		}
	}

	function startPointerPress(pointerId: number | null) {
		pointerPressOwner = { key: pointerPressOwnerKey, pointerId };
		isPressed = true;
		pressedKey = null;
	}

	function clearPressedState() {
		isPressed = false;
		pressedKey = null;
		clearOwnedPointerPress();
	}

	function handleGlobalPointerEnd(event: PointerEvent | MouseEvent) {
		if (!ownsPointerPress(event)) {
			return;
		}

		clearPressedState();
	}

	function applyPointerFocusState() {
		suppressNextFocusVisible = true;
		listboxCtx.setFocusVisible(false);
		listboxCtx.setFocusedId(id);
		listboxCtx.keyboardNav.setCurrentId(id);
		if (elementRef) {
			focusWithModality(elementRef, 'pointer');
		}
	}

	function transferHoverFocus() {
		const label = getResolvedTextValue();
		if (onItemHoverStart) {
			onItemHoverStart(id, label);
		} else if (!disableFocusHandling) {
			applyPointerFocusState();
			requestAnimationFrame(() => {
				if (isHovered && !isDisabledComputed) {
					applyPointerFocusState();
				}
			});
		}
	}

	function handleClick() {
		if (isDisabledComputed) return;

		const label = getResolvedTextValue();

		if (!disableFocusHandling && elementRef) {
			suppressNextFocusVisible = true;
			isFocusVisible = false;
			listboxCtx.setFocusVisible(false);
			listboxCtx.setFocusedId(id);
			listboxCtx.keyboardNav.setCurrentId(id);
			focusWithModality(elementRef, 'pointer');
		}

		// Use custom select handler if provided, otherwise use listbox default
		if (onItemSelect) {
			onItemSelect(id, label);
		} else {
			listboxCtx.select(id);
		}

		if (!disableFocusHandling) {
			listboxCtx.keyboardNav.setCurrentId(id);
		}
	}

	function handleFocus() {
		if (isDisabledComputed) return;
		isFocusVisible = suppressNextFocusVisible ? false : shouldShowFocusVisible(elementRef);
		suppressNextFocusVisible = false;
		if (isFocusVisible) {
			isHovered = false;
		}
		if (!disableFocusHandling) {
			listboxCtx.setFocusVisible(isFocusVisible);
			listboxCtx.setFocusedId(id);
		}
	}

	function handleBlur() {
		isFocusVisible = false;
		if (!disableFocusHandling && listboxCtx.isFocused(id)) {
			listboxCtx.setFocusVisible(false);
			listboxCtx.setFocusedId(null);
		}
	}

	function handlePointerDown(event: PointerEvent) {
		trackInteractionModality(event, elementRef);
		isFocusVisible = false;
		if (!disableFocusHandling) {
			listboxCtx.setFocusVisible(false);
		}

		if (isDisabledComputed) {
			event.preventDefault();
			clearPressedState();
			return;
		}

		if (event.button !== 0) return;
		startPointerPress(event.pointerId);
	}

	function handlePointerUp(event: PointerEvent) {
		if (event.button !== 0) return;
		clearPressedState();
	}

	function handlePointerCancel() {
		clearPressedState();
	}

	function handlePointerEnter(event: PointerEvent) {
		if (isDisabledComputed) return;

		trackInteractionModality(event, elementRef);
		if (!disableFocusHandling) {
			listboxCtx.setFocusVisible(false);
		}
		transferHoverFocus();

		if ((event.buttons & 1) === 1 && pressedKey === null) {
			isPressed = ownsPointerPress(event);
		} else {
			clearOwnedPointerPress();
		}
	}

	function handlePointerLeave() {
		if (pressedKey === null) {
			isPressed = false;
		}
	}

	function handleMouseEnter(event: MouseEvent) {
		if (!isDisabledComputed) {
			trackInteractionModality(event, elementRef);
			isHovered = true;
			isFocusVisible = false;
			if (!disableFocusHandling) {
				listboxCtx.setFocusVisible(false);
				transferHoverFocus();
			}

			if ((event.buttons & 1) === 1 && pressedKey === null) {
				isPressed = ownsPointerPress(event);
			} else {
				clearOwnedPointerPress();
			}
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
		trackInteractionModality(event, elementRef);
		if (isFocusedComputed) {
			isHovered = false;
			isFocusVisible = true;
			if (!disableFocusHandling) {
				listboxCtx.setFocusVisible(true);
			}
		}

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
		trackInteractionModality(event, elementRef);
		isFocusVisible = false;
		if (!disableFocusHandling) {
			listboxCtx.setFocusVisible(false);
		}

		// Prevent focus stealing when used in ComboBox (disableFocusHandling=true)
		// This keeps the focus on the input while allowing click selection
		if (isDisabledComputed) {
			event.preventDefault();
			clearPressedState();
			return;
		}

		if (event.button === 0) {
			startPointerPress(null);
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
	data-focus-visible={showFocusVisible || undefined}
	data-hovered={showHovered || undefined}
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
