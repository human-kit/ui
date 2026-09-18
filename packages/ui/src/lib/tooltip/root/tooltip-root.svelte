<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { browser } from '../../internal/environment';
	import { shouldShowFocusVisible } from '../../primitives/input-modality';
	import type { TooltipRootProps } from '../types';
	import {
		getTooltipProviderContext,
		setTooltipContext,
		type TooltipChangeReason,
		type TooltipCloseReason,
		type TooltipContext,
		type TooltipOpenChangeDetails,
		type TooltipOpenReason
	} from './context';
	import {
		DEFAULT_TOOLTIP_CLOSE_DELAY,
		DEFAULT_TOOLTIP_DELAY,
		DEFAULT_TOOLTIP_SKIP_DELAY,
		registerOpenTooltip,
		shouldSkipDelay,
		unregisterOpenTooltip
	} from './tooltip-group';

	/**
	 * Tooltip.Root — the open state, the delays, and the interaction with the trigger.
	 *
	 * The interaction lives here and not in `Tooltip.Trigger`, thus any element can be the trigger
	 * through `triggerRef`. It opens after a delay on a pointer that is not a touch, at once on a
	 * keyboard focus, and never on a focus that a script gave. It closes when the pointer leaves
	 * the trigger and the content, on a blur, on Escape, and on a press on the trigger: a press
	 * does something, and the tooltip must get out of the way.
	 */
	const generatedId = $props.id();

	let {
		id: idProp,
		open = $bindable(),
		defaultOpen = false,
		controlledOpen = false,
		onOpenChange,
		delay,
		closeDelay,
		disabled = false,
		triggerRef = $bindable<HTMLElement | null>(null),
		children,
		context = $bindable()
	}: TooltipRootProps = $props();

	const provider = getTooltipProviderContext();
	const instanceId = untrack(() => idProp) ?? generatedId;
	const contentId = `tooltip-${instanceId}`;

	let isOpenInternal = $state(untrack(() => defaultOpen));
	let arrowRef: HTMLElement | null = $state(null);
	// Whether `Tooltip.Trigger` set the trigger. It then renders the attributes of the trigger
	// itself; for an element the consumer gave, the root writes them.
	let triggerFromPart = false;

	// `open` wins whenever it is supplied — that covers both `bind:open` and a plain
	// `open={...}` — and the internal state only carries the fully uncontrolled case.
	const isOpen = $derived(controlledOpen ? Boolean(open) : (open ?? isOpenInternal));
	const resolvedDelay = $derived(delay ?? provider?.delay ?? DEFAULT_TOOLTIP_DELAY);
	const resolvedCloseDelay = $derived(
		closeDelay ?? provider?.closeDelay ?? DEFAULT_TOOLTIP_CLOSE_DELAY
	);
	const resolvedSkipDelay = $derived(provider?.skipDelay ?? DEFAULT_TOOLTIP_SKIP_DELAY);

	// --- Open state ---------------------------------------------------------------------------

	function setOpenWithDetails(
		value: boolean,
		incoming: { reason: TooltipChangeReason; event?: Event }
	) {
		let canceled = false;
		const details: TooltipOpenChangeDetails = {
			reason: incoming.reason,
			event: incoming.event,
			cancel: () => {
				canceled = true;
			},
			get isCanceled() {
				return canceled;
			}
		};

		onOpenChange?.(value, details);
		if (details.isCanceled) return;
		// Fully controlled: the parent owns the state and sends the value back down, or not.
		if (controlledOpen) return;

		isOpenInternal = value;
		open = value;
	}

	let openTimer: ReturnType<typeof setTimeout> | null = null;
	let closeTimer: ReturnType<typeof setTimeout> | null = null;

	function clearTimers() {
		if (openTimer !== null) {
			clearTimeout(openTimer);
			openTimer = null;
		}
		if (closeTimer !== null) {
			clearTimeout(closeTimer);
			closeTimer = null;
		}
	}

	function openTooltip(reason: TooltipOpenReason = 'imperative-action', event?: Event) {
		clearTimers();
		if (disabled || isOpen) return;
		setOpenWithDetails(true, { reason, event });
	}

	function closeTooltip(reason: TooltipCloseReason = 'imperative-action', event?: Event) {
		clearTimers();
		if (!isOpen) return;
		setOpenWithDetails(false, { reason, event });
	}

	// The first tooltip of a row waits; the next ones open at once while the user reads along.
	function scheduleOpen(reason: TooltipOpenReason, event: Event) {
		clearTimers();
		if (disabled || isOpen) return;
		const wait = shouldSkipDelay(resolvedSkipDelay) ? 0 : resolvedDelay;
		if (wait <= 0) {
			openTooltip(reason, event);
			return;
		}
		openTimer = setTimeout(() => {
			openTimer = null;
			openTooltip(reason, event);
		}, wait);
	}

	// The pointer gets `closeDelay` to cross from the trigger to the content: a tooltip the
	// pointer cannot reach is one the user cannot read to the end.
	function scheduleClose(reason: TooltipCloseReason, event: Event) {
		clearTimers();
		if (!isOpen) return;
		if (resolvedCloseDelay <= 0) {
			closeTooltip(reason, event);
			return;
		}
		closeTimer = setTimeout(() => {
			closeTimer = null;
			if (pointerOnContent) return;
			closeTooltip(reason, event);
		}, resolvedCloseDelay);
	}

	// One tooltip at most is open, whatever opened it: also a `bind:open` from the parent.
	const groupEntry = { close: (reason: 'other-tooltip') => closeTooltip(reason) };
	$effect(() => {
		if (!isOpen) return;
		registerOpenTooltip(groupEntry);
		return () => unregisterOpenTooltip(groupEntry);
	});

	$effect(() => {
		if (!disabled) return;
		untrack(() => closeTooltip('imperative-action'));
	});

	// --- Trigger interaction ------------------------------------------------------------------

	let pointerOnContent = false;
	// A press on the trigger closes the tooltip, and it stays closed until the pointer leaves:
	// the user is working with the control, not reading about it.
	let pressSuppressed = false;
	// A tooltip that a keyboard focus opened stays open while the focus is there, also when
	// the pointer leaves.
	let keyboardFocused = false;

	function handleTriggerPointerEnter(event: PointerEvent) {
		// A touch has no hover: the finger lands and presses.
		if (event.pointerType === 'touch') return;
		if (pressSuppressed) return;
		scheduleOpen('hover', event);
	}

	function handleTriggerPointerLeave(event: PointerEvent) {
		if (event.pointerType === 'touch') return;
		pressSuppressed = false;
		if (openTimer !== null) {
			clearTimeout(openTimer);
			openTimer = null;
		}
		if (keyboardFocused) return;
		scheduleClose('hover-out', event);
	}

	function handleTriggerPointerDown(event: PointerEvent) {
		pressSuppressed = true;
		closeTooltip('trigger-press', event);
	}

	function handleTriggerFocus(event: FocusEvent) {
		const target = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
		// A focus from the keyboard, or a restored one with the keyboard modality, opens at once.
		// A focus that a script gave for another reason, or a pointer press, does not.
		if (!shouldShowFocusVisible(target)) return;
		keyboardFocused = true;
		openTooltip('focus', event);
	}

	function handleTriggerBlur(event: FocusEvent) {
		keyboardFocused = false;
		closeTooltip('focus-out', event);
	}

	function handleDocumentKeyDown(event: KeyboardEvent) {
		if (event.key !== 'Escape' || !isOpen || event.defaultPrevented) return;
		// One Escape dismisses one thing. The tooltip is above everything, thus it goes first,
		// and the layers under it read `defaultPrevented` and stay.
		event.preventDefault();
		closeTooltip('escape-key', event);
	}

	function handleContentPointerEnter(event: PointerEvent) {
		if (event.pointerType === 'touch') return;
		pointerOnContent = true;
		if (closeTimer !== null) {
			clearTimeout(closeTimer);
			closeTimer = null;
		}
	}

	function handleContentPointerLeave(event: PointerEvent) {
		if (event.pointerType === 'touch') return;
		pointerOnContent = false;
		if (keyboardFocused) return;
		scheduleClose('hover-out', event);
	}

	$effect(() => {
		const trigger = triggerRef;
		if (!trigger) return;
		trigger.addEventListener('pointerenter', handleTriggerPointerEnter);
		trigger.addEventListener('pointerleave', handleTriggerPointerLeave);
		trigger.addEventListener('pointerdown', handleTriggerPointerDown);
		trigger.addEventListener('focus', handleTriggerFocus);
		trigger.addEventListener('blur', handleTriggerBlur);
		return () => {
			trigger.removeEventListener('pointerenter', handleTriggerPointerEnter);
			trigger.removeEventListener('pointerleave', handleTriggerPointerLeave);
			trigger.removeEventListener('pointerdown', handleTriggerPointerDown);
			trigger.removeEventListener('focus', handleTriggerFocus);
			trigger.removeEventListener('blur', handleTriggerBlur);
			untrack(() => {
				pointerOnContent = false;
				pressSuppressed = false;
				keyboardFocused = false;
				clearTimers();
			});
		};
	});

	$effect(() => {
		if (!isOpen) return;
		document.addEventListener('keydown', handleDocumentKeyDown, true);
		return () => document.removeEventListener('keydown', handleDocumentKeyDown, true);
	});

	// An element the consumer gave gets the attributes written here; `Tooltip.Trigger` renders
	// its own. The description points at the content only while the content is in the DOM.
	$effect(() => {
		const trigger = triggerRef;
		if (!trigger || triggerFromPart) return;
		const previousDescribedBy = trigger.getAttribute('aria-describedby');
		if (isOpen) {
			const ids = previousDescribedBy ? previousDescribedBy.split(/\s+/) : [];
			if (!ids.includes(contentId)) ids.push(contentId);
			trigger.setAttribute('aria-describedby', ids.join(' '));
		}
		trigger.dataset.state = isOpen ? 'open' : 'closed';
		return () => {
			const ids = (trigger.getAttribute('aria-describedby') ?? '')
				.split(/\s+/)
				.filter((id) => id && id !== contentId);
			if (ids.length) trigger.setAttribute('aria-describedby', ids.join(' '));
			else trigger.removeAttribute('aria-describedby');
			delete trigger.dataset.state;
		};
	});

	onDestroy(() => {
		if (!browser) return;
		clearTimers();
	});

	const ctx: TooltipContext = {
		instanceId,
		contentId,
		get isOpen() {
			return isOpen;
		},
		get isDisabled() {
			return disabled;
		},
		get triggerRef() {
			return triggerRef ?? null;
		},
		get arrowRef() {
			return arrowRef;
		},
		setTriggerRef(element) {
			triggerFromPart = element !== null;
			triggerRef = element;
		},
		setArrowRef(element) {
			arrowRef = element;
		},
		open: openTooltip,
		close: closeTooltip,
		handleContentPointerEnter,
		handleContentPointerLeave
	};

	setTooltipContext(ctx);
	context = ctx;
</script>

{#if children}
	{@render children()}
{/if}
