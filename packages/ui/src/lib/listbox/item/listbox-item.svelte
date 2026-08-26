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
	import { onMount, onDestroy, untrack } from 'svelte';
	import {
		focusWithModality,
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';

	/**
	 * Props for the ListBox.Item component.
	 */
	type ListBoxItemProps = Omit<HTMLAttributes<HTMLDivElement>, 'id' | 'children'> & {
		/** The unique identifier of this item. The component uses it for the selection. */
		id: string | number;
		/** The text for the typeahead. If you give none, the component reads it from the content. */
		textValue?: string;
		/** Disables this item. The user cannot select it. */
		disabled?: boolean;
		/** The CSS class names of the item element. */
		class?: string;
		/** The content of the item. */
		children?: Snippet;

		// Override props for composition (e.g., ComboBox.Item wrapping ListBox.Item)
		/** Replaces the id that the component makes. Use it when your component needs its own id. */
		customId?: string;
		/**
		 * Stops the DOM focus control. With `true`, the component sets no tabindex and it ignores the
		 * focus events.
		 */
		disableFocusHandling?: boolean;
		/** Replaces the focused state. With this prop, the component uses your value and not its own. */
		isFocusedOverride?: boolean;
		/** Replaces the focus-visible state. */
		isFocusVisibleOverride?: boolean;
		/**
		 * Replaces the selection behavior. With this prop, the component calls it and does not do its
		 * own selection.
		 */
		onItemSelect?: (id: string | number, label: string) => void;
		/**
		 * The component calls it with the text value when the item goes into the DOM. That text comes
		 * from the prop or from the content.
		 */
		onResolvedTextValue?: (label: string) => void;
		/** The component calls it when the pointer must move the logical focus to this item. */
		onItemHoverStart?: (id: string | number, label: string) => void;
		/** Scrolls this item into the viewport when it gets the focus. Use it with a virtual focus. */
		scrollOnFocus?: boolean;
		/** A second disabled state, from the parent. */
		isParentDisabled?: boolean;
		/** Replaces the pressed state. With this prop, the component uses your value and not its own. */
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
	let subscribedSelection = $state<boolean | null>(null);
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
	const isSelected = $derived(subscribedSelection ?? listboxCtx.isSelected(id));
	const isDisabledComputed = $derived(
		disabled || listboxCtx.disabledKeys.has(id) || isParentDisabled
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

	untrack(() => {
		listboxCtx.registerItem(id, textValue ?? String(id));
	});

	onMount(() => {
		const computedTextValue = getResolvedTextValue();

		// Update the render-time registration with the mounted element.
		listboxCtx.registerItem(id, computedTextValue, elementRef);
		onResolvedTextValue?.(computedTextValue);

		unsubscribeSelection = listboxCtx.subscribeToItem(id, (selected) => {
			subscribedSelection = selected;
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

	// Scroll into view when focused (if enabled).
	//
	// Not in a virtualized list: there the scroll is the list's, which places the row against
	// the whole collection — including rows that aren't mounted. An item pulling itself to
	// the nearest edge afterwards undid that placement, which is what left the row the list
	// had just opened on stuck against the bottom edge.
	$effect(() => {
		if (listboxCtx.isVirtualized()) return;

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

	function listboxHasDomFocus() {
		const root = elementRef?.closest('[role="listbox"]');
		return !!root && !!document.activeElement && root.contains(document.activeElement);
	}

	function applyPointerFocusState() {
		suppressNextFocusVisible = true;
		listboxCtx.setFocusVisible(false);
		listboxCtx.setFocusedId(id);
		listboxCtx.keyboardNav.setCurrentId(id);
		// Only move real DOM focus on hover when focus is already inside the
		// listbox; otherwise hovering would steal focus from elsewhere on the page.
		if (elementRef && listboxHasDomFocus()) {
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

	function handleClick(event: MouseEvent) {
		if (isDisabledComputed) return;

		const label = getResolvedTextValue();

		// Shift+click also drags the browser's own text selection across the rows it spans,
		// which paints the whole range blue on top of the widget's own selection styling.
		if (event.shiftKey) {
			window.getSelection()?.removeAllRanges();
		}

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
			listboxCtx.selectWithModifiers(id, {
				shift: event.shiftKey,
				ctrlOrMeta: event.ctrlKey || event.metaKey
			});
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
