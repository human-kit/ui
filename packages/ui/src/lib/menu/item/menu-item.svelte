<script lang="ts" module>
	type PointerPressOwner = {
		key: symbol;
		pointerId: number | null;
		/** Clears the owning item's pressed state (bound to that item's instance). */
		release: () => void;
	};

	// Tracks which item currently "owns" a pointer press so that dragging the held pointer
	// onto a sibling doesn't light it up as pressed — the press belongs to the item it began on.
	let pointerPressOwner: PointerPressOwner | null = null;

	// The press can end anywhere on the page, so pointerup/pointercancel are observed on
	// `window` — but as a single module-level pair shared by ALL items (refcounted by mounted
	// instances), instead of two listeners per item.
	let pointerEndListenerRefCount = 0;

	function handleGlobalPointerEnd(event: PointerEvent) {
		const owner = pointerPressOwner;
		if (!owner) return;
		if (owner.pointerId !== null && owner.pointerId !== event.pointerId) return;
		owner.release();
	}

	function acquireGlobalPointerEndListeners() {
		if (typeof window === 'undefined') return;
		if (pointerEndListenerRefCount === 0) {
			window.addEventListener('pointerup', handleGlobalPointerEnd);
			window.addEventListener('pointercancel', handleGlobalPointerEnd);
		}
		pointerEndListenerRefCount += 1;
	}

	function releaseGlobalPointerEndListeners() {
		if (typeof window === 'undefined') return;
		pointerEndListenerRefCount = Math.max(0, pointerEndListenerRefCount - 1);
		if (pointerEndListenerRefCount === 0) {
			window.removeEventListener('pointerup', handleGlobalPointerEnd);
			window.removeEventListener('pointercancel', handleGlobalPointerEnd);
		}
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { onMount, onDestroy, untrack } from 'svelte';
	import { useMenuContext } from '../root/context';

	/**
	 * Menu.Item - An interactive menu item (role="menuitem").
	 */
	type MenuItemProps = {
		/** Stable identifier (used for typeahead/navigation). Auto-generated if omitted. */
		value?: string | number;
		/** Handler invoked when the item is activated. */
		onAction?: (event?: Event) => void;
		/** Whether the item is disabled. */
		disabled?: boolean;
		/** Override the Root `closeOnSelect` default for this item. */
		closeOnSelect?: boolean;
		/** Text used for typeahead matching. Falls back to the item's text content. */
		textValue?: string;
		/** Item content. */
		children?: Snippet;
		/** CSS class for the item. */
		class?: string;
		/** Bindable reference to the item element. */
		element?: HTMLElement | null;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'role'>;

	const generatedId = $props.id();

	let {
		value,
		onAction,
		disabled = false,
		closeOnSelect,
		textValue,
		children,
		class: className = '',
		element = $bindable<HTMLElement | null>(null),
		onclick: onClickExternal,
		...restProps
	}: MenuItemProps = $props();

	const ctx = useMenuContext('Menu.Item');

	const itemId = $derived(value ?? generatedId);
	const idType = $derived(typeof itemId === 'number' ? 'number' : undefined);

	const focusedId = ctx.keyboardNav.state.focusedId;
	const isHighlighted = $derived($focusedId !== null && String($focusedId) === String(itemId));

	let itemRef: HTMLElement | null = $state(null);
	let isPressed = $state(false);
	const pointerPressOwnerKey = Symbol('menu-item-press');

	const isPressedComputed = $derived(isPressed && !disabled);

	$effect(() => {
		element = itemRef;
	});

	// A disabled item can never be pressed; drop any lingering press state.
	$effect(() => {
		if (disabled) clearPressedState();
	});

	// Register (and keep updated) this item with the menu context.
	$effect(() => {
		const id = itemId;
		ctx.registerItem(id, {
			textValue,
			element: itemRef ?? undefined,
			disabled,
			onSelect: onAction,
			closeOnSelect
		});
		ctx.keyboardNav.updateItems();
		return () => {
			untrack(() => ctx.unregisterItem(id));
		};
	});

	onMount(() => {
		acquireGlobalPointerEndListeners();
	});

	onDestroy(() => {
		releaseGlobalPointerEndListeners();
		clearOwnedPointerPress();
	});

	function getEventPointerId(event: PointerEvent | MouseEvent) {
		return 'pointerId' in event ? event.pointerId : null;
	}

	function ownsPointerPress(event: PointerEvent | MouseEvent) {
		if (pointerPressOwner?.key !== pointerPressOwnerKey) return false;
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

	function clearPressedState() {
		isPressed = false;
		clearOwnedPointerPress();
	}

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		if (disabled) return;
		ctx.selectItem(itemId, event);
		onClickExternal?.(event);
	}

	function handlePointerDown(event: PointerEvent) {
		if (disabled || event.button !== 0) return;
		pointerPressOwner = {
			key: pointerPressOwnerKey,
			pointerId: event.pointerId,
			release: clearPressedState
		};
		isPressed = true;
	}

	function handlePointerUp(event: PointerEvent) {
		if (event.button !== 0) return;
		clearPressedState();
	}

	function handlePointerEnter(
		event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }
	) {
		if (disabled) return;
		// Hovering a sibling collapses an open submenu — but defer while the pointer is
		// travelling toward it (safe-triangle intent), so diagonal moves aren't interrupted.
		ctx.highlightItemFromPointer(itemId, event.clientX, event.clientY);

		// Re-entering the item that started the press (button still held) restores its
		// pressed look; arriving on an item that didn't start the press leaves it alone.
		if ((event.buttons & 1) === 1) {
			isPressed = ownsPointerPress(event);
		} else {
			clearOwnedPointerPress();
		}
	}

	function handlePointerLeave() {
		isPressed = false;
	}
</script>

<div
	bind:this={itemRef}
	class={className}
	role="menuitem"
	tabindex={isHighlighted ? 0 : -1}
	data-navigation-item
	data-item-id={itemId}
	data-item-id-type={idType}
	data-text-value={textValue}
	data-disabled={disabled || undefined}
	aria-disabled={disabled || undefined}
	data-highlighted={isHighlighted || undefined}
	data-pressed={isPressedComputed || undefined}
	onclick={handleClick}
	onpointerdown={handlePointerDown}
	onpointerup={handlePointerUp}
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
	{...restProps}
>
	{@render children?.()}
</div>
