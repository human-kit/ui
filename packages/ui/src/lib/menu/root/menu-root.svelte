<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onDestroy, untrack } from 'svelte';
	import { setMenuContext, type MenuOpenChangeDetails } from './context';
	import { createMenuState } from './menu-state.svelte';

	/**
	 * Menu.Root - State management wrapper for Menu components.
	 * Provides context for Trigger and Content children.
	 */
	type MenuRootProps = {
		/** The open state. */
		open?: boolean;
		/** The open state at the start, for when the component controls the state. */
		defaultOpen?: boolean;
		/** The component calls it when the open state changes. */
		onOpenChange?: (open: boolean, details: MenuOpenChangeDetails) => void;
		/**
		 * At the last item, the arrow keys move the focus to the first item, and at the first item, to
		 * the last one.
		 */
		loop?: boolean;
		/**
		 * Starts the typeahead. When the user types, the focus moves to an item that agrees with the
		 * text.
		 */
		typeahead?: boolean;
		/** Closes the menu when the user selects an item. An item can replace this value. */
		closeOnSelect?: boolean;
		/** The reference to the trigger element. Set it in your own code, or let Menu.Trigger set it. */
		triggerRef?: HTMLElement | null;
		/** The children: the Trigger and the Content. */
		children?: Snippet;
	};

	let {
		open = $bindable(),
		defaultOpen = false,
		onOpenChange,
		loop = true,
		typeahead = true,
		closeOnSelect = true,
		triggerRef = $bindable<HTMLElement | null>(null),
		children
	}: MenuRootProps = $props();

	const { ctx, destroy } = createMenuState({
		getOpen: () => open,
		setOpen: (value) => (open = value),
		defaultOpen: untrack(() => defaultOpen),
		getOnOpenChange: () => onOpenChange,
		getLoop: () => loop,
		getTypeahead: () => typeahead,
		getCloseOnSelect: () => closeOnSelect,
		getTriggerRef: () => triggerRef ?? null,
		setTriggerRefProp: (el) => (triggerRef = el),
		parent: null,
		layer: 0
	});

	setMenuContext(ctx);

	onDestroy(destroy);
</script>

{#if children}
	{@render children()}
{/if}
