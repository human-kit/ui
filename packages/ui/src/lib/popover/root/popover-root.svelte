<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onDestroy, untrack } from 'svelte';
	import {
		setPopoverContext,
		type PopoverCanonicalCloseReason,
		type PopoverChangeReason,
		type PopoverCloseReason,
		type PopoverOpenChangeDetails,
		type PopoverOpenReason,
		type PopoverContext
	} from './context';
	import {
		addTriggerBlurCleanup,
		applyTriggerCloseFocusState,
		clearTriggerFocusState
	} from './focus-state';

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
		onOpenChange?: (open: boolean, details: PopoverOpenChangeDetails) => void;
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
	let closeReason: PopoverCanonicalCloseReason = $state('none');
	let cleanupTriggerBlurListener: (() => void) | undefined;
	let pendingTriggerCloseFocusFrame: number | undefined;

	// Use function to capture initial value only (not reactive)
	let isOpenInternal = $state((() => defaultOpen)());

	// Controlled-ness is captured once at init: a parent that passes `open`
	// owns the state for the lifetime of the component.
	const isControlled = untrack(() => open !== undefined);
	const isOpen = $derived(isControlled ? Boolean(open) : isOpenInternal);

	function setOpenWithDetails(
		value: boolean,
		incomingDetails: { reason: PopoverChangeReason; event?: Event }
	) {
		let canceled = false;
		const details: PopoverOpenChangeDetails = {
			reason: incomingDetails.reason,
			event: incomingDetails.event,
			cancel: () => {
				canceled = true;
			},
			get isCanceled() {
				return canceled;
			}
		};

		onOpenChange?.(value, details);
		if (details.isCanceled) return;

		// In controlled mode the parent owns the state: it reacts in `onOpenChange`
		// and flows the value back down (or ignores it to reject the change).
		// Writing `open` here would locally override the parent's prop.
		if (isControlled) return;

		isOpenInternal = value;
		open = value;
	}

	function toggle(reason: PopoverOpenReason = 'trigger-press', event?: Event) {
		setOpenWithDetails(!isOpen, { reason, event });
	}

	function openPopover(reason: PopoverOpenReason = 'imperative-action', event?: Event) {
		closeReason = 'none';
		setOpenWithDetails(true, { reason, event });
	}

	function clearPendingTriggerCloseFocus() {
		if (pendingTriggerCloseFocusFrame === undefined) return;
		cancelAnimationFrame(pendingTriggerCloseFocusFrame);
		pendingTriggerCloseFocusFrame = undefined;
	}

	function scheduleTriggerCloseFocus(
		trigger: HTMLElement,
		reason: PopoverCanonicalCloseReason,
		event?: Event
	) {
		clearPendingTriggerCloseFocus();
		pendingTriggerCloseFocusFrame = requestAnimationFrame(() => {
			pendingTriggerCloseFocusFrame = undefined;
			if (!trigger.isConnected) return;
			applyTriggerCloseFocusState(trigger, reason, event);
		});
	}

	function closePopover(reason: PopoverCloseReason = 'imperative-action', event?: Event) {
		closeReason = reason;
		const wasOpen = isOpen;
		setOpenWithDetails(false, { reason, event });
		if (!wasOpen || isOpen) return;
		if (!triggerRef) return;
		scheduleTriggerCloseFocus(triggerRef, reason, event);
	}

	function setTriggerRef(el: HTMLElement | null) {
		clearPendingTriggerCloseFocus();
		cleanupTriggerBlurListener?.();
		cleanupTriggerBlurListener = undefined;
		if (triggerRef && triggerRef !== el) {
			clearTriggerFocusState(triggerRef);
		}
		triggerRef = el;
		if (!triggerRef) return;
		const currentTrigger = triggerRef;
		cleanupTriggerBlurListener = addTriggerBlurCleanup(currentTrigger);
	}

	function handleOpenChange(newOpen: boolean, details: PopoverOpenChangeDetails) {
		setOpenWithDetails(newOpen, { reason: details.reason, event: details.event });
	}

	const ctx: PopoverContext = {
		get closeReason() {
			return closeReason;
		},
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

	onDestroy(() => {
		clearPendingTriggerCloseFocus();
		cleanupTriggerBlurListener?.();
	});
</script>

{#if children}
	{@render children()}
{/if}
