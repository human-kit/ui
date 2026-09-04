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
		/** The open state. By default it goes in the two directions: use `bind:open`. */
		open?: boolean;
		/** The open state at the start, for when you give no `open`. */
		defaultOpen?: boolean;
		/**
		 * Give your own code full control of the open state. The component stops to write back to
		 * `open`, and it reports only through `onOpenChange`. Thus the parent can refuse a change: the
		 * parent does not send the new value down. The default is off, because `bind:open` is the usual
		 * case and it needs the write-back.
		 *
		 * To refuse one change, use `details.cancel()`. That function works in the two modes.
		 */
		controlledOpen?: boolean;
		/** The component calls it when the open state changes. */
		onOpenChange?: (open: boolean, details: PopoverOpenChangeDetails) => void;
		/**
		 * The reference to the trigger element. Set it in your own code, or let Popover.Trigger set it.
		 */
		triggerRef?: HTMLElement | null;
		/** The children: the Trigger and the Content. */
		children?: Snippet;
	};

	let {
		open = $bindable(),
		defaultOpen = false,
		controlledOpen = false,
		onOpenChange,
		triggerRef = $bindable<HTMLElement | null>(null),
		children
	}: PopoverRootProps = $props();
	let closeReason: PopoverCanonicalCloseReason = $state('none');
	let cleanupTriggerBlurListener: (() => void) | undefined;
	let pendingTriggerCloseFocusFrame: number | undefined;

	// Use function to capture initial value only (not reactive)
	let isOpenInternal = $state((() => defaultOpen)());

	// `open` wins whenever it is supplied — that covers both `bind:open` and a plain
	// `open={...}` — and the internal state only carries the fully uncontrolled case.
	// Controlled-ness is NOT inferred from `open` being defined: `bind:open={value}` and
	// `open={value}` are indistinguishable at runtime, so inferring it silently broke
	// every `bind:open` seeded with `false` — the popover would report the open and then
	// drop it, never appearing at all. It is opt-in via `controlledOpen` instead.
	const isOpen = $derived(controlledOpen ? Boolean(open) : (open ?? isOpenInternal));

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

		// Fully controlled: the parent owns the state and reacts in `onOpenChange`,
		// flowing the value back down (or ignoring it to reject the change). Writing
		// `open` here would locally override the parent's prop.
		if (controlledOpen) return;

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
