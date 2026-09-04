<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onDestroy, untrack } from 'svelte';
	import { setMenuContext, useMenuContext, type MenuOpenChangeDetails } from '../root/context';
	import { createMenuState } from '../root/menu-state.svelte';

	/**
	 * Menu.SubmenuRoot - Provides a nested menu context for a submenu.
	 * Must be used inside a parent Menu.Content.
	 */
	type MenuSubmenuRootProps = {
		/** The open state. */
		open?: boolean;
		/** The open state at the start, for when the component controls the state. */
		defaultOpen?: boolean;
		/** The component calls it when the open state changes. */
		onOpenChange?: (open: boolean, details: MenuOpenChangeDetails) => void;
		/**
		 * At the last item, the arrow keys move the focus to the first item. The default comes from the
		 * menu above it.
		 */
		loop?: boolean;
		/** Starts the typeahead. The default comes from the menu above it. */
		typeahead?: boolean;
		/** Closes the menu when the user selects an item. The default comes from the menu above it. */
		closeOnSelect?: boolean;
		/** The reference to the submenu trigger element. */
		triggerRef?: HTMLElement | null;
		children?: Snippet;
	};

	let {
		open = $bindable(),
		defaultOpen = false,
		onOpenChange,
		loop,
		typeahead,
		closeOnSelect,
		triggerRef = $bindable<HTMLElement | null>(null),
		children
	}: MenuSubmenuRootProps = $props();

	const parent = useMenuContext('Menu.SubmenuRoot');

	const { ctx, destroy } = createMenuState({
		getOpen: () => open,
		setOpen: (value) => (open = value),
		defaultOpen: untrack(() => defaultOpen),
		getOnOpenChange: () => onOpenChange,
		getLoop: () => loop ?? parent.loop,
		getTypeahead: () => typeahead ?? parent.typeahead,
		getCloseOnSelect: () => closeOnSelect ?? parent.closeOnSelect,
		getTriggerRef: () => triggerRef ?? null,
		setTriggerRefProp: (el) => (triggerRef = el),
		parent,
		layer: parent.layer + 1
	});

	setMenuContext(ctx);

	// Keep the parent informed so it can close sibling submenus and itself correctly.
	$effect(() => {
		if (ctx.isOpen) {
			parent.notifyChildOpen(ctx);
		} else {
			parent.notifyChildClose(ctx);
		}
	});

	onDestroy(() => {
		parent.notifyChildClose(ctx);
		destroy();
	});
</script>

{#if children}
	{@render children()}
{/if}
