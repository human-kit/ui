<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { floating, type ExtendedPlacement } from '../../primitives/floating';
	import { focusTrap, type FocusTrapOptions } from '../../primitives/focus-trap';
	import { scrollLock } from '../../primitives/scroll-lock';
	import { clickOutside } from '../../primitives/click-outside';
	import { ariaHideOutside } from '../../primitives/aria-hide-outside';
	import { Portal } from '../../portal';
	import {
		getPopoverContext,
		type PopoverOpenChangeDetails,
		type PopoverCloseReason
	} from '../root/context';

	/**
	 * Popover.Content - The floating content panel.
	 * Can be used inside Popover.Root (reads context) or standalone (props required).
	 */
	type PopoverContentProps = {
		/** Offset along the main axis from the anchor element. */
		offset?: number;
		/** Placement relative to the anchor element. */
		placement?: ExtendedPlacement;
		/** Whether to flip when there's insufficient space. */
		shouldFlip?: boolean;
		/** Boundary element for positioning constraints. */
		boundaryElement?: Element | null;
		/** Content of the popover. */
		children?: Snippet;
		/** CSS class for the popover container. */
		class?: string;
		/** Whether the popover is non-modal (allows outside interaction, no focus trap, no scroll lock). */
		isNonModal?: boolean;
		/** Whether clicking outside the popover should close it. */
		shouldCloseOnInteractOutside?: boolean;
		/** Whether pressing Escape should close the popover. */
		shouldCloseOnEscape?: boolean;
		/** Whether losing focus (blur) should close the popover. Defaults to true for non-modal popovers. */
		shouldCloseOnBlur?: boolean;
		/** Element or selector to focus first when modal trap activates. */
		initialFocus?: FocusTrapOptions['initialFocus'];
		// Standalone mode props (used when not inside Popover.Root)
		/** Controlled open state (standalone mode). */
		open?: boolean;
		/** Reference to the trigger element (standalone mode). */
		triggerRef?: HTMLElement | null;
		/** Callback when open state changes (standalone mode). */
		onOpenChange?: (open: boolean, details: PopoverOpenChangeDetails) => void;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'>;

	let {
		offset = 8,
		placement = 'bottom',
		shouldFlip = true,
		boundaryElement = null,
		children,
		class: className = '',
		isNonModal = false,
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
	const isModal = $derived(!isNonModal);
	const shouldCloseOnBlurResolved = $derived(shouldCloseOnBlur ?? isNonModal);

	let popoverRef: HTMLElement | undefined = $state();

	function applyStandaloneTriggerCloseState(trigger: HTMLElement, reason: PopoverCloseReason) {
		requestAnimationFrame(() => {
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

			const clearFocusData = () => {
				delete trigger.dataset.focused;
				delete trigger.dataset.focusVisible;
			};
			trigger.addEventListener('blur', clearFocusData, { once: true });
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

			onOpenChangeProp?.(false, details);
			if (details.isCanceled) return;
			if (triggerRefProp) {
				applyStandaloneTriggerCloseState(triggerRefProp, reason);
			}
		} else {
			ctx!.close(reason, event);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen && shouldCloseOnEscape) {
			event.preventDefault();
			close('escape-key', event);
		}
	}

	function handleDocumentFocusIn(event: FocusEvent) {
		if (!shouldCloseOnBlurResolved || !isOpen) return;

		const target = event.target as Node;

		const focusInPopover = popoverRef?.contains(target) || target === popoverRef;
		const focusInTrigger = triggerRef?.contains(target) || target === triggerRef;

		if (!focusInPopover && !focusInTrigger) {
			close('focus-out', event);
		}
	}

	function handleScroll(event: Event) {
		if (!isNonModal || !isOpen || !shouldCloseOnInteractOutside) return;

		// Check if scroll is inside the popover or trigger
		const target = event.target as Node;
		const isInsidePopover = popoverRef?.contains(target) || target === popoverRef;
		const isInsideTrigger = triggerRef?.contains(target) || target === triggerRef;

		// Only close on external scroll
		if (!isInsidePopover && !isInsideTrigger) {
			close('outside-press', event);
		}
	}

	onMount(() => {
		if (!browser) return;
		document.addEventListener('keydown', handleKeydown);
		document.addEventListener('focusin', handleDocumentFocusIn);
		document.addEventListener('scroll', handleScroll, true);
	});

	onDestroy(() => {
		if (!browser) return;
		document.removeEventListener('keydown', handleKeydown);
		document.removeEventListener('focusin', handleDocumentFocusIn);
		document.removeEventListener('scroll', handleScroll, true);
	});
</script>

{#if isOpen}
	<Portal>
		<div
			bind:this={popoverRef}
			class={className}
			role="dialog"
			aria-modal={isModal}
			use:floating={{ anchor: triggerRef, offset, placement, shouldFlip, boundaryElement }}
			use:clickOutside={{
				handler: (event) => {
					event.preventDefault();
					close('outside-press', event);
				},
				enabled: shouldCloseOnInteractOutside,
				ignore: [triggerRef]
			}}
			use:focusTrap={{ enabled: isModal, restoreFocus: false, initialFocus }}
			use:scrollLock={isModal}
			use:ariaHideOutside={isModal}
			style="position: fixed; z-index: 9999;"
			{...restProps}
		>
			{#if children}
				{@render children()}
			{/if}
		</div>
	</Portal>
{/if}
