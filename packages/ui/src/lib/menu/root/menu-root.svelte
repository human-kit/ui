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
		/** Controlled open state. */
		open?: boolean;
		/** Initial open state for uncontrolled mode. */
		defaultOpen?: boolean;
		/** Callback when open state changes. */
		onOpenChange?: (open: boolean, details: MenuOpenChangeDetails) => void;
		/** Whether arrow navigation wraps around the ends. */
		loop?: boolean;
		/** Whether typeahead (type to focus a matching item) is enabled. */
		typeahead?: boolean;
		/** Whether selecting an item closes the menu. Items can override this. */
		closeOnSelect?: boolean;
		/** Reference to the trigger element. Can be set manually or via Menu.Trigger. */
		triggerRef?: HTMLElement | null;
		/** Children (Trigger and Content). */
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
