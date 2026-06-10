<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { untrack } from 'svelte';
	import { useMenuContext } from '../root/context';

	/**
	 * Menu.Item - An interactive menu item (role="menuitem").
	 */
	type MenuItemProps = {
		/** Stable identifier (used for typeahead/navigation). Auto-generated if omitted. */
		value?: string | number;
		/** Handler invoked when the item is activated. */
		onSelect?: (event?: Event) => void;
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
		onSelect,
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

	$effect(() => {
		element = itemRef;
	});

	// Register (and keep updated) this item with the menu context.
	$effect(() => {
		const id = itemId;
		ctx.registerItem(id, {
			textValue,
			element: itemRef ?? undefined,
			disabled,
			onSelect,
			closeOnSelect
		});
		ctx.keyboardNav.updateItems();
		return () => {
			untrack(() => ctx.unregisterItem(id));
		};
	});

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		if (disabled) return;
		ctx.selectItem(itemId, event);
		onClickExternal?.(event);
	}

	function handlePointerEnter(
		event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }
	) {
		if (disabled) return;
		// Hovering a sibling collapses an open submenu — but defer while the pointer is
		// travelling toward it (safe-triangle intent), so diagonal moves aren't interrupted.
		ctx.highlightItemFromPointer(itemId, event.clientX, event.clientY);
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
	data-disabled={disabled || undefined}
	aria-disabled={disabled || undefined}
	data-highlighted={isHighlighted || undefined}
	onclick={handleClick}
	onpointerenter={handlePointerEnter}
	{...restProps}
>
	{@render children?.()}
</div>
