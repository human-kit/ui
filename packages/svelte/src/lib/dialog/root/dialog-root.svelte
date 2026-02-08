<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setDialogContext, type DialogContext } from './context';
	import type { DialogStateHelpers } from './types';

	/**
	 * Dialog.Root - State management wrapper for Dialog components.
	 * Provides context for Trigger and Content children.
	 */
	type DialogRootProps = {
		/** Controlled open state. */
		open?: boolean;
		/** Initial open state for uncontrolled mode. */
		defaultOpen?: boolean;
		/** Callback when open state changes. */
		onOpenChange?: (open: boolean) => void;
		/** Reference to the trigger element. Can be set manually or via Dialog.Trigger. */
		triggerRef?: HTMLElement | null;
		/** Children snippet receives state helpers: { close, open, toggle, isOpen } */
		children?: Snippet<[DialogStateHelpers]>;
	};

	let {
		open: openProp = $bindable(),
		defaultOpen = false,
		onOpenChange,
		triggerRef = $bindable<HTMLElement | null>(null),
		children
	}: DialogRootProps = $props();

	// Use function to capture initial value only (not reactive)
	let isOpenInternal = $state((() => defaultOpen)());

	// Stack level for z-index calculation
	let stackLevel = $state(0);

	const isControlled = $derived(openProp !== undefined);
	const isOpen = $derived(isControlled ? openProp! : isOpenInternal);

	function setOpen(value: boolean) {
		if (isControlled) {
			onOpenChange?.(value);
		} else {
			isOpenInternal = value;
			onOpenChange?.(value);
		}
		// Sync bindable prop
		openProp = value;
	}

	function toggle() {
		setOpen(!isOpen);
	}

	function openDialog() {
		setOpen(true);
	}

	function closeDialog() {
		setOpen(false);
		triggerRef?.focus();
	}

	function setTriggerRef(el: HTMLElement | null) {
		triggerRef = el;
	}

	function handleOpenChange(newOpen: boolean) {
		setOpen(newOpen);
	}

	function setStackLevel(level: number) {
		stackLevel = level;
	}

	const ctx: DialogContext = {
		get isOpen() {
			return isOpen;
		},
		get triggerRef() {
			return triggerRef ?? null;
		},
		get stackLevel() {
			return stackLevel;
		},
		setTriggerRef,
		setStackLevel,
		toggle,
		open: openDialog,
		close: closeDialog,
		onOpenChange: handleOpenChange
	};

	setDialogContext(ctx);
</script>

{#if children}
	{@render children({ close: closeDialog, open: openDialog, toggle, isOpen })}
{/if}
