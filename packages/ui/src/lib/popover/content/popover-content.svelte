<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { onDestroy } from 'svelte';
	import { browser } from '../../internal/environment';
	import { floating, type ExtendedPlacement } from '../../primitives/floating';
	import { focusTrap, type FocusTrapOptions } from '../../primitives/focus-trap';
	import { allowScrollWithin, scrollLock } from '../../primitives/scroll-lock';
	import { clickOutside } from '../../primitives/click-outside';
	import { ariaHideOutside } from '../../primitives/aria-hide-outside';
	import { releaseFocusedDescendant } from '../../primitives/release-focused-descendant';
	import { createPresence } from '../../primitives/presence.svelte';
	import { Portal } from '../../portal';
	import {
		getPopoverContext,
		type PopoverOpenChangeDetails,
		type PopoverCloseReason
	} from '../root/context';
	import { pushPopoverLayer, removePopoverLayer, isTopmostPopover } from '../root/popover-stack';
	import { getFloatingLayerZIndex } from '../../primitives/layer-stack';
	import {
		addTriggerBlurCleanup,
		applyTriggerCloseFocusState,
		clearTriggerFocusState
	} from '../root/focus-state';

	/**
	 * Popover.Content - The floating content panel.
	 * Can be used inside Popover.Root (reads context) or standalone (props required).
	 */
	type PopoverContentProps = {
		/** The distance from the anchor element, on the main axis. */
		offset?: number;
		/** The position against the anchor element. */
		placement?: ExtendedPlacement;
		/** Moves the panel to the opposite side when the space is not sufficient. */
		shouldFlip?: boolean;
		/** The element that gives the limits of the position. */
		boundaryElement?: Element | null;
		/** The content of the popover. */
		children?: Snippet;
		/** The CSS class names of the popover container. */
		class?: string;
		/**
		 * Makes the popover non-modal. The user can then operate the page, the focus does not stay in
		 * the panel, and the page scrolls.
		 */
		nonModal?: boolean;
		/** Closes the popover when the user clicks outside it. */
		shouldCloseOnInteractOutside?: boolean;
		/** Closes the popover when the user pushes the `Escape` key. */
		shouldCloseOnEscape?: boolean;
		/**
		 * Closes the popover when the focus goes out of it. The default is true for a non-modal popover.
		 */
		shouldCloseOnBlur?: boolean;
		/** The element, or the selector of the element, that gets the focus first in the modal mode. */
		initialFocus?: FocusTrapOptions['initialFocus'];
		// Standalone mode props (used when not inside Popover.Root)
		/** The open state, when you use the part alone. */
		open?: boolean;
		/** The reference to the trigger element, when you use the part alone. */
		triggerRef?: HTMLElement | null;
		/** The component calls it when the open state changes, when you use the part alone. */
		onOpenChange?: (open: boolean, details: PopoverOpenChangeDetails) => void;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'>;

	let {
		offset = 4,
		placement = 'bottom',
		shouldFlip = true,
		boundaryElement = null,
		children,
		class: className = '',
		nonModal = false,
		shouldCloseOnInteractOutside = true,
		shouldCloseOnEscape = true,
		shouldCloseOnBlur,
		initialFocus,
		// Standalone mode props
		open: openProp,
		triggerRef: triggerRefProp = null,
		onOpenChange: onOpenChangeProp,
		...restProps
	}: PopoverContentProps = $props();

	const ctx = getPopoverContext();

	// Support both context mode (inside Root) and standalone mode (props)
	const isStandalone = $derived(ctx === undefined);
	const triggerRef = $derived(isStandalone ? triggerRefProp : ctx!.triggerRef);
	const isOpen = $derived(isStandalone ? (openProp ?? false) : ctx!.isOpen);
	const isModal = $derived(!nonModal);
	const shouldCloseOnBlurResolved = $derived(shouldCloseOnBlur ?? nonModal);

	let popoverRef: HTMLElement | undefined = $state();
	let cleanupStandaloneTriggerBlurListener: (() => void) | undefined;
	let pendingStandaloneTriggerCloseFocusFrame: number | undefined;
	let trackedStandaloneTrigger: HTMLElement | null = null;
	let resolvedPlacement = $state<'top' | 'right' | 'bottom' | 'left'>('bottom');
	let previousOpen = $state(false);
	let closeHandledInternally = false;
	let layerId: symbol | null = null;
	// Resolved when the popover opens so it stacks above whatever dialog (if any) it
	// was opened inside — a fixed z-index renders behind nested dialogs.
	let zIndex = $state(getFloatingLayerZIndex());

	function removeLayer() {
		if (layerId === null) return;
		removePopoverLayer(layerId);
		layerId = null;
	}

	function isTopmost() {
		return layerId !== null && isTopmostPopover(layerId);
	}

	function resolvePlacementSide(value: string) {
		const side = value.split(/[-\s]/)[0];
		return side === 'top' || side === 'right' || side === 'left' ? side : 'bottom';
	}

	function clearPendingStandaloneTriggerCloseFocus() {
		if (pendingStandaloneTriggerCloseFocusFrame === undefined) return;
		cancelAnimationFrame(pendingStandaloneTriggerCloseFocusFrame);
		pendingStandaloneTriggerCloseFocusFrame = undefined;
	}

	function clearStandaloneTriggerTracking() {
		clearPendingStandaloneTriggerCloseFocus();
		cleanupStandaloneTriggerBlurListener?.();
		cleanupStandaloneTriggerBlurListener = undefined;
	}

	function applyStandaloneTriggerCloseState(
		trigger: HTMLElement,
		reason: PopoverCloseReason,
		event?: Event
	) {
		clearStandaloneTriggerTracking();
		pendingStandaloneTriggerCloseFocusFrame = requestAnimationFrame(() => {
			pendingStandaloneTriggerCloseFocusFrame = undefined;
			if (!trigger.isConnected) return;
			applyTriggerCloseFocusState(trigger, reason, event);

			const cleanupTriggerBlur = addTriggerBlurCleanup(trigger, true);
			const handleDocumentFocusIn = (focusEvent: FocusEvent) => {
				const target = focusEvent.target;
				if (target === trigger) return;
				if (target instanceof Node && trigger.contains(target)) return;
				clearTriggerFocusState(trigger);
				document.removeEventListener('focusin', handleDocumentFocusIn);
			};

			document.addEventListener('focusin', handleDocumentFocusIn);
			cleanupStandaloneTriggerBlurListener = () => {
				cleanupTriggerBlur();
				document.removeEventListener('focusin', handleDocumentFocusIn);
			};
		});
	}

	function close(reason: PopoverCloseReason = 'imperative-action', event?: Event) {
		if (isStandalone) {
			let canceled = false;
			const details: PopoverOpenChangeDetails = {
				reason,
				event,
				cancel: () => {
					canceled = true;
				},
				get isCanceled() {
					return canceled;
				}
			};

			// Notify (and allow cancel) BEFORE blurring the focused descendant —
			// a canceled close must leave the user's focus untouched.
			onOpenChangeProp?.(false, details);
			if (details.isCanceled) return;
			closeHandledInternally = true;
			releaseFocusedDescendant(popoverRef, triggerRef);
			if (triggerRefProp) {
				applyStandaloneTriggerCloseState(triggerRefProp, reason, event);
			}
		} else {
			ctx!.close(reason, event);
			// The Root's onOpenChange may have canceled the close (or a controlled
			// parent may have kept it open) — only release focus once it actually closed.
			if (ctx!.isOpen) return;
			closeHandledInternally = true;
			releaseFocusedDescendant(popoverRef, triggerRef);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		// Another layer (or a widget like a range-selection calendar) already consumed
		// this Escape — a single keypress must dismiss at most one thing.
		if (event.defaultPrevented) return;
		if (event.key === 'Escape' && isOpen && shouldCloseOnEscape) {
			// Only the topmost layer dismisses, so a nested popover (e.g. a
			// calendar inside a filter popover) closes without its ancestors.
			if (!isTopmost()) return;
			event.preventDefault();
			close('escape-key', event);
		}
	}

	function handleDocumentFocusIn(event: FocusEvent) {
		if (!shouldCloseOnBlurResolved || !isOpen || !isTopmost()) return;

		const target = event.target as Node;

		const focusInPopover = popoverRef?.contains(target) || target === popoverRef;
		const focusInTrigger = triggerRef?.contains(target) || target === triggerRef;

		if (!focusInPopover && !focusInTrigger) {
			close('focus-out', event);
		}
	}

	function handleScroll(event: Event) {
		if (!nonModal || !isOpen || !shouldCloseOnInteractOutside || !isTopmost()) return;

		// Check if scroll is inside the popover or trigger
		const target = event.target as Node;
		const isInsidePopover = popoverRef?.contains(target) || target === popoverRef;
		const isInsideTrigger = triggerRef?.contains(target) || target === triggerRef;

		// Only close on external scroll
		if (!isInsidePopover && !isInsideTrigger) {
			close('scroll', event);
		}
	}

	$effect(() => {
		if (!isStandalone) {
			if (trackedStandaloneTrigger) {
				clearTriggerFocusState(trackedStandaloneTrigger);
			}
			trackedStandaloneTrigger = null;
			clearStandaloneTriggerTracking();
			return;
		}

		if (trackedStandaloneTrigger && trackedStandaloneTrigger !== triggerRefProp) {
			clearTriggerFocusState(trackedStandaloneTrigger);
			clearStandaloneTriggerTracking();
		}

		trackedStandaloneTrigger = triggerRefProp;
	});

	// Document listeners are only useful while the popover is open — register them per open
	// cycle instead of for the component's whole life. Order relative to other layers doesn't
	// matter: every handler arbitrates via the layer stack (`isTopmost`).
	$effect(() => {
		if (!isOpen) return;
		document.addEventListener('keydown', handleKeydown);
		document.addEventListener('focusin', handleDocumentFocusIn);
		document.addEventListener('scroll', handleScroll, true);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
			document.removeEventListener('focusin', handleDocumentFocusIn);
			document.removeEventListener('scroll', handleScroll, true);
		};
	});

	onDestroy(() => {
		if (!browser) return;
		if (trackedStandaloneTrigger) {
			clearTriggerFocusState(trackedStandaloneTrigger);
		}
		removeLayer();
		clearStandaloneTriggerTracking();
	});

	$effect(() => {
		const wasOpen = previousOpen;
		previousOpen = isOpen;

		if (isOpen) {
			closeHandledInternally = false;
			return;
		}

		if (!wasOpen) {
			closeHandledInternally = false;
			return;
		}

		if (closeHandledInternally) {
			closeHandledInternally = false;
			return;
		}

		releaseFocusedDescendant(popoverRef, triggerRef);
	});

	// Presence: mounted through the exit animation, phases timed from the panel's own CSS motion.
	// The layer is pushed (and the z-index resolved above the topmost dialog) as soon as the
	// popover opens, and popped as soon as it starts closing — while the exit still plays.
	const presence = createPresence(
		() => isOpen,
		() => popoverRef,
		{
			onOpen: () => {
				if (layerId === null) {
					layerId = pushPopoverLayer();
					// Capture the dialog depth at open time so the panel clears the topmost dialog.
					zIndex = getFloatingLayerZIndex();
				}
			},
			onClose: () => {
				removeLayer();
			}
		}
	);
</script>

{#if presence.isMounted}
	<Portal>
		<div
			bind:this={popoverRef}
			class={className}
			role="dialog"
			aria-modal={isOpen ? isModal : undefined}
			aria-hidden={isOpen ? undefined : 'true'}
			inert={!isOpen}
			data-state={isOpen ? 'open' : 'closed'}
			data-entering={presence.isEntering || undefined}
			data-exiting={presence.isExiting || undefined}
			data-placement={resolvedPlacement}
			use:floating={{
				anchor: triggerRef,
				offset,
				placement,
				shouldFlip,
				boundaryElement,
				onPositionUpdate: (_, __, finalPlacement) => {
					resolvedPlacement = resolvePlacementSide(finalPlacement);
				}
			}}
			use:clickOutside={{
				handler: (event) => {
					if (!isTopmost()) return;
					// No preventDefault: the outside press must keep its native behavior
					// (focusing the clicked element, placing the caret, starting a text
					// selection) — suppressing it left the first click on an outside
					// input closing the popover without ever focusing the input.
					close('outside-press', event);
				},
				enabled: isOpen && shouldCloseOnInteractOutside,
				ignore: [triggerRef]
			}}
			use:focusTrap={{ enabled: isOpen && isModal, restoreFocus: false, initialFocus }}
			use:scrollLock={(isOpen || presence.isExiting) && isModal}
			use:allowScrollWithin={isOpen && !isModal}
			use:ariaHideOutside={isOpen && isModal}
			style="position: fixed; z-index: {zIndex};"
			{...restProps}
		>
			{#if children}
				{@render children()}
			{/if}
		</div>
	</Portal>
{/if}
