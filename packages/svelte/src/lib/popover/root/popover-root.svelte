<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setPopoverContext, type PopoverContext } from './context';

	/**
	 * Popover.Root - State management wrapper for Popover components.
	 * Provides context for Trigger and Content children.
	 */
	type PopoverRootProps = {
		/** Controlled open state. */
		open?: boolean;
		/** Initial open state for uncontrolled mode. */
		defaultOpen?: boolean;
		/** Callback when open state changes. */
		onOpenChange?: (open: boolean) => void;
		/** Reference to the trigger element. Can be set manually or via Popover.Trigger. */
		triggerRef?: HTMLElement | null;
		/** Children (Trigger and Content) */
		children?: Snippet;
	};

	let {
		open = $bindable(),
		defaultOpen = false,
		onOpenChange,
		triggerRef = $bindable<HTMLElement | null>(null),
		children
	}: PopoverRootProps = $props();

	// Use function to capture initial value only (not reactive)
	let isOpenInternal = $state((() => defaultOpen)());

	const isControlled = $derived(open !== undefined);
	const isOpen = $derived(isControlled ? open! : isOpenInternal);

	function setOpen(value: boolean) {
		if (isControlled) {
			onOpenChange?.(value);
		} else {
			isOpenInternal = value;
			onOpenChange?.(value);
		}
		// Sync bindable prop
		open = value;
	}

	function toggle() {
		setOpen(!isOpen);
	}

	function openPopover() {
		setOpen(true);
	}

	function closePopover() {
		setOpen(false);
		triggerRef?.focus();
	}

	function setTriggerRef(el: HTMLElement | null) {
		triggerRef = el;
	}

	function handleOpenChange(newOpen: boolean) {
		setOpen(newOpen);
	}

	const ctx: PopoverContext = {
		get isOpen() {
			return isOpen;
		},
		get triggerRef() {
			return triggerRef ?? null;
		},
		setTriggerRef,
		toggle,
		open: openPopover,
		close: closePopover,
		onOpenChange: handleOpenChange
	};

	setPopoverContext(ctx);
</script>

{#if children}
	{@render children()}
{/if}
