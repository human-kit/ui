<!--
	Generic over the handle's payload so `Drawer.Root handle={h}` accepts a
	`DrawerHandle<User>`. A fixed `DrawerHandle<unknown>` cannot: `open(payload?)`
	puts the type in a contravariant position, which makes the handle invariant.
-->
<script lang="ts" generics="Payload = unknown">
	import { tick, untrack, type Snippet } from 'svelte';
	import { setDrawerContext, type DrawerContext } from './context';
	import type {
		DrawerCloseReason,
		DrawerModal,
		DrawerSide,
		DrawerSnapPoint,
		DrawerStateHelpers
	} from './types';
	import type { DrawerHandle } from './handle.svelte';
	import {
		focusWithModality,
		resolveCloseInteractionModality
	} from '../../primitives/input-modality';

	/**
	 * Drawer.Root — state container for the whole drawer.
	 * Renders no element of its own; it provides the context every other part reads.
	 */
	type DrawerRootProps = {
		/** Open state. Two-way by default — use `bind:open`. */
		open?: boolean;
		/** Initial open state, for when `open` is not supplied. */
		defaultOpen?: boolean;
		/**
		 * Opt into fully controlled state: the component stops writing back to `open` and
		 * only reports through `onOpenChange`, so the parent can reject a change by not
		 * flowing the new value back down. Off by default, because `bind:open` — the
		 * common case — needs the write-back to work at all.
		 */
		controlledOpen?: boolean;
		/** Callback when the open state changes. */
		onOpenChange?: (open: boolean) => void;
		/** Edge the panel is anchored to. */
		side?: DrawerSide;
		/** Focus trap / scroll lock behaviour. See `DrawerModal`. */
		modal?: DrawerModal;
		/** Whether a swipe toward the anchored edge may dismiss the drawer. */
		dismissible?: boolean;
		/** Whether pressing Escape closes the drawer. */
		shouldCloseOnEscape?: boolean;
		/** Whether pressing outside the panel closes it. */
		shouldCloseOnInteractOutside?: boolean;
		/**
		 * Resting positions the panel may settle on, smallest offset first is not
		 * required — they are sorted internally. See `DrawerSnapPoint` for the accepted
		 * value forms. Without this the drawer is either fully open or closed.
		 */
		snapPoints?: readonly DrawerSnapPoint[];
		/** Active snap point. Two-way by default — use `bind:snapPoint`. */
		snapPoint?: DrawerSnapPoint | null;
		/** Initial snap point, for when `snapPoint` is not supplied. */
		defaultSnapPoint?: DrawerSnapPoint | null;
		/** Callback when the active snap point changes. */
		onSnapPointChange?: (snapPoint: DrawerSnapPoint | null, event?: Event) => void;
		/**
		 * Stops a fast flick from skipping past the neighbouring snap point. Use it when
		 * every step is meaningful and jumping two at once would disorient.
		 */
		snapToSequentialPoints?: boolean;
		/**
		 * Drives the drawer from a detached handle instead of the `open` prop, so
		 * triggers can live anywhere in the tree. See `createDrawerHandle`.
		 */
		handle?: DrawerHandle<Payload>;
		/** Reference to the trigger element. Set manually or via Drawer.Trigger. */
		triggerRef?: HTMLElement | null;
		/** Children snippet, receiving state helpers. */
		children?: Snippet<[DrawerStateHelpers<Payload>]>;
	};

	let {
		open: openProp = $bindable(),
		defaultOpen = false,
		controlledOpen = false,
		onOpenChange,
		side = 'bottom',
		modal = true,
		dismissible = true,
		shouldCloseOnEscape = true,
		shouldCloseOnInteractOutside = true,
		snapPoints,
		snapPoint: snapPointProp = $bindable(),
		defaultSnapPoint = null,
		onSnapPointChange,
		snapToSequentialPoints = false,
		handle,
		triggerRef = $bindable<HTMLElement | null>(null),
		children
	}: DrawerRootProps = $props();

	// Function call so only the INITIAL value is captured, not a reactive read.
	let isOpenInternal = $state((() => defaultOpen)());

	let stackLevel = $state(0);
	let stackIndex = $state(0);
	let swipeProgress = $state(0);
	let isSwiping = $state(false);
	let swipeOpenDistance = $state<number | null>(null);
	let panelExtent = $state(0);

	// Same shape as `open`: the prop wins when supplied, the internal state carries
	// the uncontrolled case. `controlledOpen` governs both, since a consumer driving
	// one of them from outside is almost always driving the other too.
	let snapPointInternal = $state<DrawerSnapPoint | null>((() => defaultSnapPoint)());
	const snapPoint = $derived(
		controlledOpen ? (snapPointProp ?? null) : (snapPointProp ?? snapPointInternal)
	);

	function setSnapPoint(point: DrawerSnapPoint | null, event?: Event) {
		onSnapPointChange?.(point, event);
		if (controlledOpen) return;
		snapPointInternal = point;
		snapPointProp = point;
	}

	// Label/description ids, in registration order. Arrays rather than a single id
	// because `aria-labelledby` takes a list, and a drawer may legitimately be
	// named by more than one element.
	let labelIds = $state<string[]>([]);
	let descriptionIds = $state<string[]>([]);

	// `open` wins whenever it is supplied — that covers both `bind:open` and a plain
	// `open={...}` — and the internal state only carries the fully uncontrolled case.
	// Controlled-ness is NOT inferred from `open` being defined: `bind:open={value}` and
	// `open={value}` are indistinguishable at runtime, so inferring it silently breaks
	// every `bind:open` seeded with `false`. It is opt-in via `controlledOpen` instead.
	/**
	 * Current open state, read straight from whichever source owns it.
	 *
	 * A plain function rather than only a `$derived` because `closeDrawer` has to
	 * re-read the state in the same tick it wrote it, to tell a rejected close from a
	 * real one. A derived read back inside the handler it was just invalidated from
	 * is exactly the case where the cached value bites.
	 */
	function readOpen(): boolean {
		// A handle outranks everything: its whole point is that the state lives outside
		// this component, where the scattered triggers can reach it.
		if (handle) return handle.isOpen;
		if (controlledOpen) return Boolean(openProp);
		return openProp ?? isOpenInternal;
	}

	const isOpen = $derived(readOpen());

	function setOpen(value: boolean) {
		onOpenChange?.(value);

		if (handle) {
			handle.setOpen(value);
			return;
		}

		// Fully controlled: the parent owns the state and reacts in `onOpenChange`,
		// flowing the value back down (or ignoring it to reject the change). Writing
		// `openProp` here would locally override the parent's prop.
		if (controlledOpen) return;

		isOpenInternal = value;
		openProp = value;
	}

	function openDrawer() {
		setOpen(true);
	}

	/**
	 * Returns focus to the trigger, retrying once the DOM has caught up.
	 *
	 * While a modal drawer is open, `ariaHideOutside` marks everything outside the
	 * panel `inert` — including the trigger — and `focus()` on an inert element is a
	 * no-op. The attribute is only lifted during the update this close kicks off, so
	 * the first attempt can silently land on `<body>`. The retry costs nothing when
	 * the first one worked, and is the difference between returning the keyboard user
	 * to where they were and dumping them at the top of the page.
	 */
	function restoreFocusTo(
		target: HTMLElement,
		modality: ReturnType<typeof resolveCloseInteractionModality>
	) {
		focusWithModality(target, modality);
		if (document.activeElement === target) return;

		void tick().then(() => {
			if (!target.isConnected || document.activeElement === target) return;
			focusWithModality(target, modality);
		});
	}

	function closeDrawer(reason: DrawerCloseReason = 'imperative-action', event?: Event) {
		const wasOpen = readOpen();
		setOpen(false);
		// A controlled parent may have rejected the close (by not flowing `false`
		// back down) — don't steal focus while the drawer is still open.
		if (!wasOpen || readOpen()) return;
		// With a handle, focus belongs to the trigger that actually opened it — not to
		// whichever one happened to register itself last.
		const restoreTarget = handle?.trigger ?? triggerRef;
		if (restoreTarget) {
			restoreFocusTo(restoreTarget, resolveCloseInteractionModality(reason, event));
		}
	}

	function toggle() {
		setOpen(!isOpen);
	}

	const ctx: DrawerContext = {
		get isOpen() {
			return isOpen;
		},
		get side() {
			return side;
		},
		get modal() {
			return modal;
		},
		get dismissible() {
			return dismissible;
		},
		get shouldCloseOnEscape() {
			return shouldCloseOnEscape;
		},
		get shouldCloseOnInteractOutside() {
			return shouldCloseOnInteractOutside;
		},
		get triggerRef() {
			return handle?.trigger ?? triggerRef ?? null;
		},
		get stackLevel() {
			return stackLevel;
		},
		get stackIndex() {
			return stackIndex;
		},
		setStackIndex(index: number) {
			stackIndex = index;
		},
		get labelledBy() {
			return labelIds.length > 0 ? labelIds.join(' ') : undefined;
		},
		get describedBy() {
			return descriptionIds.length > 0 ? descriptionIds.join(' ') : undefined;
		},
		get snapPoints() {
			return snapPoints;
		},
		get snapPoint() {
			return snapPoint;
		},
		get snapToSequentialPoints() {
			return snapToSequentialPoints;
		},
		setSnapPoint,
		get swipeProgress() {
			return swipeProgress;
		},
		get isSwiping() {
			return isSwiping;
		},
		// `untrack` is load-bearing: these are called from an `$effect` inside
		// Drawer.Title/Description, and reading the list to append to it would
		// subscribe that effect to the very state it writes — an update loop that
		// registers the same id forever.
		registerLabel(id: string) {
			untrack(() => {
				labelIds = [...labelIds, id];
			});
			return () =>
				untrack(() => {
					labelIds = labelIds.filter((candidate) => candidate !== id);
				});
		},
		registerDescription(id: string) {
			untrack(() => {
				descriptionIds = [...descriptionIds, id];
			});
			return () =>
				untrack(() => {
					descriptionIds = descriptionIds.filter((candidate) => candidate !== id);
				});
		},
		setSwipeState(progress: number, swiping: boolean) {
			swipeProgress = progress;
			isSwiping = swiping;
		},
		get swipeOpenDistance() {
			return swipeOpenDistance;
		},
		setSwipeOpenDistance(distance: number | null) {
			swipeOpenDistance = distance;
		},
		get panelExtent() {
			return panelExtent;
		},
		setPanelExtent(extent: number) {
			panelExtent = extent;
		},
		setTriggerRef(el: HTMLElement | null) {
			triggerRef = el;
		},
		setStackLevel(level: number) {
			stackLevel = level;
		},
		open: openDrawer,
		close: closeDrawer,
		toggle,
		onOpenChange: setOpen
	};

	setDrawerContext(ctx);
</script>

{#if children}
	<!--
		Zero-arg wrappers, NOT the internal functions: the snippet helpers are typed
		`() => void`, so a consumer writing `onclick={close}` would otherwise hand the
		MouseEvent to `closeDrawer` as its `reason`, degrading the close-focus modality.
	-->
	{@render children({
		close: () => closeDrawer('imperative-action'),
		open: () => openDrawer(),
		toggle: () => toggle(),
		isOpen,
		payload: handle?.payload
	})}
{/if}
