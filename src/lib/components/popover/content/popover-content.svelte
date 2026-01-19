<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { floating, type ExtendedPlacement } from '$lib/primitives/floating';
	import { focusTrap } from '$lib/primitives/focus-trap';
	import { scrollLock } from '$lib/primitives/scroll-lock';
	import { clickOutside } from '$lib/primitives/click-outside';
	import { ariaHideOutside } from '$lib/primitives/aria-hide-outside';
	import { Portal } from '$lib/components/portal';
	import { getPopoverContext } from '../root/context';

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
		// Standalone mode props (used when not inside Popover.Root)
		/** Controlled open state (standalone mode). */
		open?: boolean;
		/** Reference to the trigger element (standalone mode). */
		triggerRef?: HTMLElement | null;
		/** Callback when open state changes (standalone mode). */
		onOpenChange?: (open: boolean) => void;
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

	function close() {
		if (isStandalone) {
			onOpenChangeProp?.(false);
			triggerRefProp?.focus();
		} else {
			ctx!.close();
		}
	}

	function handleOpenChange(value: boolean) {
		if (isStandalone) {
			onOpenChangeProp?.(value);
		} else {
			ctx!.onOpenChange(value);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen && shouldCloseOnEscape) {
			event.preventDefault();
			close();
		}
	}

	function handleDocumentFocusIn(event: FocusEvent) {
		if (!shouldCloseOnBlurResolved || !isOpen) return;

		const target = event.target as Node;

		const focusInPopover = popoverRef?.contains(target) || target === popoverRef;
		const focusInTrigger = triggerRef?.contains(target) || target === triggerRef;

		if (!focusInPopover && !focusInTrigger) {
			handleOpenChange(false);
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
			close();
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
				handler: close,
				enabled: shouldCloseOnInteractOutside,
				ignore: [triggerRef]
			}}
			use:focusTrap={isModal}
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
