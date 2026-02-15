<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onDestroy } from 'svelte';
	import {
		setPopoverContext,
		type PopoverCanonicalCloseReason,
		type PopoverChangeReason,
		type PopoverCloseReason,
		type PopoverOpenChangeDetails,
		type PopoverOpenReason,
		type PopoverContext
	} from './context';

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

	const isControlled = $derived(open !== undefined);
	const isOpen = $derived(isControlled ? open! : isOpenInternal);

	function setOpenWithDetails(value: boolean, incomingDetails: { reason: PopoverChangeReason; event?: Event }) {
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

		if (!isControlled) {
			isOpenInternal = value;
		}

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

	function scheduleTriggerCloseFocus(trigger: HTMLElement, reason: PopoverCanonicalCloseReason) {
		clearPendingTriggerCloseFocus();
		pendingTriggerCloseFocusFrame = requestAnimationFrame(() => {
			pendingTriggerCloseFocusFrame = undefined;
			if (!trigger.isConnected) return;
			trigger.focus();
			if (reason === 'outside-press' || reason === 'escape-key') {
				trigger.dataset.focused = 'true';
			} else {
				delete trigger.dataset.focused;
			}
			if (reason === 'escape-key') {
				trigger.dataset.focusVisible = 'true';
			} else {
				delete trigger.dataset.focusVisible;
			}
		});
	}

	function closePopover(reason: PopoverCloseReason = 'imperative-action', event?: Event) {
		closeReason = reason;
		const wasOpen = isOpen;
		setOpenWithDetails(false, { reason, event });
		if (!wasOpen || isOpen) return;
		if (!triggerRef) return;
		scheduleTriggerCloseFocus(triggerRef, reason);
	}

	function setTriggerRef(el: HTMLElement | null) {
		clearPendingTriggerCloseFocus();
		cleanupTriggerBlurListener?.();
		cleanupTriggerBlurListener = undefined;
		if (triggerRef && triggerRef !== el) {
			delete triggerRef.dataset.focused;
			delete triggerRef.dataset.focusVisible;
		}
		triggerRef = el;
		if (!triggerRef) return;
		const currentTrigger = triggerRef;

		const handleBlur = () => {
			delete currentTrigger.dataset.focused;
			delete currentTrigger.dataset.focusVisible;
		};

		currentTrigger.addEventListener('blur', handleBlur);
		cleanupTriggerBlurListener = () => {
			currentTrigger.removeEventListener('blur', handleBlur);
		};
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
