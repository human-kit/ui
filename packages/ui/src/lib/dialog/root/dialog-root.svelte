<script lang="ts">
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';
	import { setDialogContext, type DialogContext } from './context';
	import type { DialogStateHelpers } from './types';
	import {
		focusWithModality,
		resolveCloseInteractionModality
	} from '../../primitives/input-modality';
	import type { DialogCloseReason } from './context';

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

	// Controlled-ness is captured once at init: a parent that passes `open`
	// owns the state for the lifetime of the component.
	const isControlled = untrack(() => openProp !== undefined);
	const isOpen = $derived(isControlled ? Boolean(openProp) : isOpenInternal);

	function setOpen(value: boolean) {
		if (isControlled) {
			// In controlled mode the parent owns the state: it reacts in `onOpenChange`
			// and flows the value back down (or ignores it to reject the change).
			// Writing `openProp` here would locally override the parent's prop.
			onOpenChange?.(value);
			return;
		}
		isOpenInternal = value;
		// Sync bindable prop
		openProp = value;
		onOpenChange?.(value);
	}

	function toggle() {
		setOpen(!isOpen);
	}

	function openDialog() {
		setOpen(true);
	}

	function closeDialog(reason: DialogCloseReason = 'imperative-action', event?: Event) {
		const wasOpen = isOpen;
		setOpen(false);
		// A controlled parent may have rejected the close (by not flowing `false`
		// back down) — don't steal focus while the dialog is still open.
		if (!wasOpen || isOpen) return;
		if (triggerRef) {
			focusWithModality(triggerRef, resolveCloseInteractionModality(reason, event));
		}
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
