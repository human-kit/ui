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
		offset = 4,
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
	let cleanupStandaloneTriggerBlurListener: (() => void) | undefined;
	let pendingStandaloneTriggerCloseFocusFrame: number | undefined;
	let trackedStandaloneTrigger: HTMLElement | null = null;
	let isMounted = $state(false);
	let isEntering = $state(false);
	let isExiting = $state(false);
	let resolvedPlacement = $state<'top' | 'right' | 'bottom' | 'left'>('bottom');
	let motionTimeout: number | undefined;
	let pendingMotionFrame: number | undefined;
	let cleanupMotionListeners: (() => void) | undefined;
	let motionId = 0;
	let previousOpen = $state(false);
	let closeHandledInternally = false;

	function parseTimeList(value: string) {
		return value
			.split(',')
			.map((entry) => entry.trim())
			.filter(Boolean)
			.map((entry) => {
				if (entry.endsWith('ms')) return Number.parseFloat(entry);
				if (entry.endsWith('s')) return Number.parseFloat(entry) * 1000;
				return Number.parseFloat(entry) || 0;
			});
	}

	function getMaxTime(duration: string, delay: string) {
		const durations = parseTimeList(duration);
		const delays = parseTimeList(delay);
		const length = Math.max(durations.length, delays.length);

		let maxTime = 0;
		for (let index = 0; index < length; index += 1) {
			const total =
				(durations[index] ?? durations[durations.length - 1] ?? 0) +
				(delays[index] ?? delays[delays.length - 1] ?? 0);
			maxTime = Math.max(maxTime, total);
		}

		return maxTime;
	}

	function getMotionTime(element: HTMLElement) {
		const styles = getComputedStyle(element);
		const transitionTime = getMaxTime(styles.transitionDuration, styles.transitionDelay);
		const animationTime = getMaxTime(styles.animationDuration, styles.animationDelay);
		return Math.max(transitionTime, animationTime);
	}

	function resolvePlacementSide(value: string) {
		const side = value.split(/[-\s]/)[0];
		return side === 'top' || side === 'right' || side === 'left' ? side : 'bottom';
	}

	function clearMotionTracking() {
		if (pendingMotionFrame !== undefined) {
			cancelAnimationFrame(pendingMotionFrame);
			pendingMotionFrame = undefined;
		}

		if (motionTimeout !== undefined) {
			clearTimeout(motionTimeout);
			motionTimeout = undefined;
		}

		cleanupMotionListeners?.();
		cleanupMotionListeners = undefined;
	}

	function finishEnter(id: number) {
		if (id !== motionId) return;
		clearMotionTracking();
		isEntering = false;
	}

	function finishExit(id: number) {
		if (id !== motionId) return;
		clearMotionTracking();
		isExiting = false;
		isMounted = false;
	}

	function trackMotion(phase: 'enter' | 'exit', element: HTMLElement) {
		clearMotionTracking();
		const id = ++motionId;

		pendingMotionFrame = requestAnimationFrame(() => {
			pendingMotionFrame = undefined;
			if (id !== motionId || !element.isConnected) return;

			const totalMotionTime = getMotionTime(element);
			const complete = phase === 'enter' ? () => finishEnter(id) : () => finishExit(id);

			if (totalMotionTime <= 0) {
				complete();
				return;
			}

			const handleMotionEnd = (event: Event) => {
				if (event.target !== element) return;
				complete();
			};

			element.addEventListener('animationend', handleMotionEnd);
			element.addEventListener('transitionend', handleMotionEnd);
			cleanupMotionListeners = () => {
				element.removeEventListener('animationend', handleMotionEnd);
				element.removeEventListener('transitionend', handleMotionEnd);
			};

			motionTimeout = window.setTimeout(() => {
				complete();
			}, totalMotionTime + 50);
		});
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

	function releaseFocusedDescendantBeforeHide() {
		if (!browser || !popoverRef || !triggerRef) return;

		const activeElement = document.activeElement;
		if (!(activeElement instanceof HTMLElement)) return;
		if (activeElement === triggerRef || triggerRef.contains(activeElement)) return;
		if (activeElement !== popoverRef && !popoverRef.contains(activeElement)) return;

		activeElement.blur();
	}

	function close(reason: PopoverCloseReason = 'imperative-action', event?: Event) {
		closeHandledInternally = true;
		releaseFocusedDescendantBeforeHide();

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
				applyStandaloneTriggerCloseState(triggerRefProp, reason, event);
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

	onMount(() => {
		if (!browser) return;
		document.addEventListener('keydown', handleKeydown);
		document.addEventListener('focusin', handleDocumentFocusIn);
		document.addEventListener('scroll', handleScroll, true);
	});

	onDestroy(() => {
		if (!browser) return;
		if (trackedStandaloneTrigger) {
			clearTriggerFocusState(trackedStandaloneTrigger);
		}
		clearMotionTracking();
		clearStandaloneTriggerTracking();
		document.removeEventListener('keydown', handleKeydown);
		document.removeEventListener('focusin', handleDocumentFocusIn);
		document.removeEventListener('scroll', handleScroll, true);
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

		releaseFocusedDescendantBeforeHide();
	});

	$effect(() => {
		if (isOpen) {
			const shouldAnimateIn = !isMounted || isExiting;
			isMounted = true;
			isExiting = false;
			if (shouldAnimateIn) {
				isEntering = true;
			}
			return;
		}

		if (!isMounted) {
			isEntering = false;
			isExiting = false;
			return;
		}

		isEntering = false;
		isExiting = true;
	});

	$effect(() => {
		if (!isMounted || !popoverRef) {
			clearMotionTracking();
			return;
		}

		if (isEntering) {
			trackMotion('enter', popoverRef);
			return;
		}

		if (isExiting) {
			trackMotion('exit', popoverRef);
			return;
		}

		clearMotionTracking();
	});
</script>

{#if isMounted}
	<Portal>
		<div
			bind:this={popoverRef}
			class={className}
			role="dialog"
			aria-modal={isOpen ? isModal : undefined}
			aria-hidden={isOpen ? undefined : 'true'}
			inert={!isOpen}
			data-state={isOpen ? 'open' : 'closed'}
			data-entering={isEntering || undefined}
			data-exiting={isExiting || undefined}
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
					event.preventDefault();
					close('outside-press', event);
				},
				enabled: isOpen && shouldCloseOnInteractOutside,
				ignore: [triggerRef]
			}}
			use:focusTrap={{ enabled: isOpen && isModal, restoreFocus: false, initialFocus }}
			use:scrollLock={isOpen && isModal}
			use:ariaHideOutside={isOpen && isModal}
			style="position: fixed; z-index: 9999;"
			{...restProps}
		>
			{#if children}
				{@render children()}
			{/if}
		</div>
	</Portal>
{/if}
