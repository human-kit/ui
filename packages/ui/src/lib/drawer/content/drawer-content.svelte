<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '../../internal/environment';
	import { focusTrap } from '../../primitives/focus-trap';
	import { scrollLock } from '../../primitives/scroll-lock';
	import { clickOutside } from '../../primitives/click-outside';
	import { ariaHideOutside } from '../../primitives/aria-hide-outside';
	import {
		swipeGesture,
		getSwipeAxis,
		getOutwardSign,
		projectRelease,
		applyRubberBand,
		type SwipeGestureOptions
	} from '../../primitives/swipe-gesture';
	import {
		resolveSnapOffsets,
		resolveSnapPointSize,
		findNearestSnapIndex,
		resolveSnapOnRelease
	} from '../root/snap-points';
	import {
		pushLayer,
		removeLayer,
		isTopmostLayer,
		getLayerKindIndex,
		getContentZIndex,
		subscribeLayerStack
	} from '../../primitives/layer-stack';
	import {
		registerDrawer,
		unregisterDrawer,
		updateDrawer,
		hasDrawerAbove,
		hasSwipingDrawerAbove,
		getDepthFromFront,
		getDrawerIndex,
		drawerStack
	} from '../root/drawer-stack.svelte';
	import { requireDrawerContext } from '../root/context';
	import { getDrawerPresenceContext } from '../root/presence-context';
	import { hasDrawerViewport } from '../root/viewport-context';
	import { getDrawerKeyboardContext } from '../root/keyboard-context';
	import { createStartingStyle } from '../root/starting-style.svelte';
	import type { DrawerSide, DrawerSnapPoint } from '../root/types';

	/**
	 * Drawer.Content — the panel itself.
	 * Belongs inside a Drawer.Portal, optionally wrapped in a Drawer.Viewport.
	 */
	type DrawerContentProps = {
		/** Content of the panel. */
		children?: Snippet;
		/** CSS class for the panel. */
		class?: string;
		/**
		 * Where focus lands when the drawer opens. Defaults to the first focusable
		 * element inside the panel.
		 */
		initialFocus?: HTMLElement | string | (() => HTMLElement | null | undefined);
		/**
		 * `touch-action` for the panel. Defaults to `pan-y` for left/right drawers —
		 * children keep scrolling vertically while the horizontal axis is reserved for
		 * the drag — and to nothing for top/bottom ones, where reserving the vertical
		 * axis would break every scrollable region inside (`touch-action` intersects
		 * down the ancestor chain, so a child cannot opt back in).
		 */
		touchAction?: string | null;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'>;

	let {
		children,
		class: className = '',
		initialFocus,
		touchAction,
		style: styleProp,
		...restProps
	}: DrawerContentProps = $props();

	const ctx = requireDrawerContext('Drawer.Content');
	const insideViewport = hasDrawerViewport();
	// Present only under a Drawer.VirtualKeyboardProvider.
	const keyboard = getDrawerKeyboardContext();
	// The panel only mounts as it opens, so its first frame IS the starting frame.
	const startingStyle = createStartingStyle();

	// Present only when rendered inside Drawer.Portal. Drives the enter/exit animation
	// and lets the Portal time the exit from this element. Falls back to "always open".
	const presence = getDrawerPresenceContext();
	const isOpen = $derived(presence ? presence.state === 'open' : true);

	// The scroll lock must survive the exit animation: releasing it the moment `isOpen`
	// flips false brings the page scrollbar back mid-exit and shifts the layout behind
	// the still-visible panel. It releases only once the exit has finished (unmount).
	const isModal = $derived(ctx.modal === true);
	const shouldLockScroll = $derived(isModal && (presence ? isOpen || presence.isExiting : true));
	const shouldTrapFocus = $derived(ctx.modal !== false && isOpen);

	let panelRef: HTMLElement | undefined = $state();
	let layerId: symbol | null = null;
	let layerLevel = $state(0);
	/** Identity in the drawer-only stack, for nesting. Assigned on mount. */
	let stackId = $state<symbol | null>(null);

	/* ── swipe ─────────────────────────────────────────────────────────── */

	/** px/ms past which a release counts as a flick regardless of distance. */
	const FLICK_VELOCITY = 0.4;
	/** Fraction of the panel that must be projected off-screen to dismiss. */
	const DISMISS_FRACTION = 0.5;
	/**
	 * Ceiling, in px, for the resistance reported when the panel is pulled further
	 * open than it can go. Fixed rather than proportional to the panel: scaling it
	 * with the panel's own size let a tall sheet be hauled most of its own height,
	 * which felt less like resistance and more like the drawer coming loose.
	 */
	const OVERDRAG_LIMIT = 40;

	const axis = $derived(getSwipeAxis(ctx.side));
	const outwardSign = $derived(getOutwardSign(ctx.side));

	/** Outward displacement in px, after resistance. Never negative — see `handleSwipeMove`. */
	let offset = $state(0);
	/** Resisted distance the panel has been pulled past fully open, in px. */
	let overdrag = $state(0);
	let isSwiping = $state(false);
	let dismissedBySwipe = $state(false);
	let releaseStrength = $state(1);

	let panelWidth = $state(0);
	let panelHeight = $state(0);
	let viewportWidth = $state(0);
	let viewportHeight = $state(0);
	let rootFontSize = $state(16);

	/**
	 * Panel extent along its axis. Measured reactively rather than captured at
	 * gesture start: `swipeProgress` derives from it, and a plain `let` left the
	 * progress frozen at its first read (zero), so the backdrop never faded.
	 */
	const panelExtent = $derived(axis === 'x' ? panelWidth : panelHeight);
	const viewportExtent = $derived(axis === 'x' ? viewportWidth : viewportHeight);

	/* ── snap points ───────────────────────────────────────────────────── */

	const snapOffsets = $derived(
		ctx.snapPoints && ctx.snapPoints.length > 0 && panelExtent > 0
			? resolveSnapOffsets(ctx.snapPoints, viewportExtent, panelExtent, rootFontSize)
			: []
	);
	const hasSnapPoints = $derived(snapOffsets.length > 0);

	/** Translation the panel rests at, before any drag. */
	const restingOffset = $derived.by(() => {
		if (!hasSnapPoints) return 0;
		if (ctx.snapPoint === null || ctx.snapPoint === undefined) return snapOffsets[0];
		const size = resolveSnapPointSize(ctx.snapPoint, viewportExtent, rootFontSize);
		if (size === null) return snapOffsets[0];
		const wanted = Math.max(0, panelExtent - size);
		return snapOffsets[findNearestSnapIndex(snapOffsets, wanted)];
	});
	const activeSnapIndex = $derived(
		hasSnapPoints ? findNearestSnapIndex(snapOffsets, restingOffset) : -1
	);
	/** True at the most open snap point — the "expanded" state consumers style. */
	const isExpanded = $derived(hasSnapPoints && activeSnapIndex === 0);

	/** Snap point value at `index`, for handing back to the root. */
	function snapPointAt(index: number): DrawerSnapPoint | null {
		const points = ctx.snapPoints;
		if (!points || index < 0) return null;
		const target = snapOffsets[index];
		// Map back through the same resolution the offsets came from, so the value
		// reported is one the consumer actually wrote.
		for (const point of points) {
			const size = resolveSnapPointSize(point, viewportExtent, rootFontSize);
			if (size === null) continue;
			if (Math.max(0, panelExtent - size) === target) return point;
		}
		return null;
	}

	/* ── gesture ───────────────────────────────────────────────────────── */

	/**
	 * Displacement from the resting position, in px outward.
	 *
	 * An opening drag from `Drawer.SwipeArea` takes precedence: the panel starts
	 * fully out and is pulled in by the distance travelled, so it arrives with the
	 * finger instead of playing its enter animation underneath it.
	 */
	const movement = $derived.by(() => {
		if (ctx.swipeOpenDistance !== null) {
			return Math.max(0, panelExtent - ctx.swipeOpenDistance) - restingOffset;
		}
		return offset;
	});

	const isDragging = $derived(isSwiping || ctx.swipeOpenDistance !== null);

	/**
	 * Offset of the most closed snap point — where "on the way out" begins.
	 * Zero without snap points, since fully open is the only resting place.
	 */
	const dismissFloor = $derived(hasSnapPoints ? snapOffsets[snapOffsets.length - 1] : 0);

	/**
	 * Progress toward DISMISSAL, 0–1 — not progress through the gesture.
	 *
	 * Travelling between snap points reports 0 the whole way: it is movement within
	 * the open drawer, and fading the backdrop for it made the page flash brighter
	 * on the way down and snap dark again on release, for a drawer that never went
	 * anywhere. The backdrop only reacts once the panel is past the last snap point
	 * and genuinely leaving.
	 */
	const swipeProgress = $derived.by(() => {
		const travel = panelExtent - dismissFloor;
		if (travel <= 0) return 0;
		const total = restingOffset + movement;
		return Math.min(Math.max((total - dismissFloor) / travel, 0), 1);
	});

	// Republish to the context so Drawer.Overlay can fade with a gesture it doesn't own,
	// and so Drawer.SwipeArea knows how far a full open is.
	$effect(() => {
		ctx.setSwipeState(swipeProgress, isDragging);
	});
	$effect(() => {
		ctx.setPanelExtent(panelExtent);
	});

	/* ── nesting ───────────────────────────────────────────────────────── */

	// Published to the drawer-only stack so the drawers behind this one — and the
	// app behind all of them — can react. `presence` falls as the panel is dragged
	// away, which is what lets the indent unwind with the gesture instead of
	// snapping back the instant the drawer closes.
	$effect(() => {
		const id = stackId;
		if (!id) return;
		updateDrawer(id, {
			extent: panelExtent,
			presence: 1 - swipeProgress,
			swiping: isDragging,
			exiting: presence?.isExiting ?? false
		});
	});

	// Published so Drawer.Overlay can tell whether a backdrop is already on screen.
	$effect(() => {
		ctx.setStackIndex(stackId ? Math.max(0, getDrawerIndex(stackId)) : 0);
	});

	const nestedDrawerOpen = $derived(stackId ? hasDrawerAbove(stackId) : false);
	const nestedDrawerSwiping = $derived(stackId ? hasSwipingDrawerAbove(stackId) : false);
	const depthFromFront = $derived(stackId ? getDepthFromFront(stackId) : 0);

	function handleSwipeStart() {
		isSwiping = true;
		releaseStrength = 1;
	}

	/** Displacement range the drag may cover freely, before resistance kicks in. */
	function dragBounds(): { lower: number; upper: number } {
		const lower = (hasSnapPoints ? snapOffsets[0] : 0) - restingOffset;
		// A dismissible drawer can be pulled all the way off; otherwise it stops at
		// the most closed snap point (or at fully open, with no snap points).
		const upper = ctx.dismissible
			? Number.POSITIVE_INFINITY
			: (hasSnapPoints ? snapOffsets[snapOffsets.length - 1] : 0) - restingOffset;
		return { lower, upper };
	}

	function handleSwipeMove(displacement: number) {
		const { lower, upper } = dragBounds();

		if (displacement < lower) {
			// Pulled further open than there is anywhere to go. The panel follows, with
			// heavy resistance, and the strip of page it uncovers behind its anchored
			// edge is covered by the bleed element below — moving the panel without that
			// is what made the drawer look like it was coming apart.
			overdrag = applyRubberBand(lower - displacement, OVERDRAG_LIMIT);
			offset = lower - overdrag;
			return;
		}

		overdrag = 0;

		if (displacement > upper) {
			// A drawer that cannot go further still moves, just reluctantly — a dead
			// gesture reads as a broken one.
			offset = upper + applyRubberBand(displacement - upper, OVERDRAG_LIMIT);
			return;
		}
		offset = displacement;
	}

	function handleSwipeEnd(displacement: number, velocity: number, event: PointerEvent) {
		isSwiping = false;
		overdrag = 0;

		// 1 for a still release (the panel eases back over its full transition), down to
		// 0.1 for a hard flick, which should land almost immediately.
		const normalized = Math.min(Math.abs(velocity) / FLICK_VELOCITY, 1);
		releaseStrength = Number.isFinite(normalized) ? 1 - normalized * 0.9 : 0.1;

		if (hasSnapPoints) {
			const release = resolveSnapOnRelease({
				offset: restingOffset + displacement,
				velocity,
				offsets: snapOffsets,
				currentIndex: activeSnapIndex,
				panelSize: panelExtent,
				sequential: ctx.snapToSequentialPoints,
				dismissible: ctx.dismissible
			});

			if (release.dismiss) {
				dismissedBySwipe = true;
				ctx.close('swipe', event);
				return;
			}

			ctx.setSnapPoint(snapPointAt(release.index), event);
			offset = 0;
			return;
		}

		const projected = projectRelease(displacement, velocity);
		const travelledFarEnough = projected >= panelExtent * DISMISS_FRACTION;
		const flicked = velocity >= FLICK_VELOCITY;

		if (ctx.dismissible && (flicked || travelledFarEnough)) {
			// The offset is deliberately NOT reset: the exit animation continues from
			// where the finger left the panel instead of snapping back to open first.
			dismissedBySwipe = true;
			ctx.close('swipe', event);
			return;
		}

		offset = 0;
	}

	function handleSwipeCancel() {
		isSwiping = false;
		offset = 0;
		overdrag = 0;
	}

	const resolvedTouchAction = $derived(
		touchAction !== undefined ? touchAction : axis === 'x' ? 'pan-y' : null
	);

	const swipeOptions = $derived<SwipeGestureOptions>({
		enabled: isOpen,
		side: ctx.side,
		touchAction: resolvedTouchAction,
		onStart: handleSwipeStart,
		onMove: ({ displacement }) => handleSwipeMove(displacement),
		onEnd: ({ displacement, velocity, event }) => handleSwipeEnd(displacement, velocity, event),
		onCancel: handleSwipeCancel
	});

	/**
	 * Box that sits just outside the panel's anchored edge, painted in the panel's own
	 * background, covering the strip of page a stretch would otherwise uncover.
	 *
	 * It exists because there is no way to stretch the panel from here without
	 * fighting the consumer's own padding: `background: inherit` borrows their colour
	 * and an absolutely positioned box costs them nothing.
	 *
	 * Always present, at the full overdrag limit, rather than sized to the live pull.
	 * At rest it sits entirely outside the viewport, so it is invisible and free — and
	 * being permanent it also covers the RELEASE, where a box tied to the live value
	 * vanished the instant the finger lifted while the panel was still easing back,
	 * flashing the gap open again at the very end of the gesture.
	 *
	 * The one assumption: a panel with `overflow: hidden` clips it away.
	 */
	function bleedPosition(side: DrawerSide): string {
		// Overlaps the panel by a pixel. Butting the two edges together leaves a
		// hairline of backdrop showing through wherever the panel lands on a
		// fractional position, which is most of the time during a drag.
		const span = `${OVERDRAG_LIMIT + 1}px`;
		if (side === 'bottom') return `top: calc(100% - 1px); left: 0; right: 0; height: ${span};`;
		if (side === 'top') return `bottom: calc(100% - 1px); left: 0; right: 0; height: ${span};`;
		if (side === 'left') return `right: calc(100% - 1px); top: 0; bottom: 0; width: ${span};`;
		return `left: calc(100% - 1px); top: 0; bottom: 0; width: ${span};`;
	}

	/** Outward direction as a name, for `data-swipe-direction`. */
	function directionFor(side: DrawerSide): 'up' | 'down' | 'left' | 'right' {
		if (side === 'bottom') return 'down';
		if (side === 'top') return 'up';
		return side;
	}

	/* ── layout ────────────────────────────────────────────────────────── */

	/**
	 * Without a Drawer.Viewport the panel pins itself to its edge, so the plain
	 * `Portal → Overlay + Content` composition works. Inside one it stays in flow and
	 * the viewport's flexbox places it.
	 */
	function standalonePosition(side: DrawerSide): string {
		const zIndex = getContentZIndex(layerLevel);
		const edges =
			side === 'top'
				? 'top: 0; left: 0; right: 0;'
				: side === 'bottom'
					? 'bottom: 0; left: 0; right: 0;'
					: side === 'left'
						? 'left: 0; top: 0; bottom: 0;'
						: 'right: 0; top: 0; bottom: 0;';
		return `position: fixed; ${edges} z-index: ${zIndex};`;
	}

	// A consumer `style` is APPENDED, not spread through `restProps`: spreading would
	// place it after this attribute and silently drop every custom property the
	// gesture publishes, taking the panel's own animation with it.
	const style = $derived(
		[
			// The bleed box is positioned against the panel, so the panel has to be a
			// containing block. Fixed positioning already is one; in a viewport it is not.
			insideViewport ? 'position: relative;' : standalonePosition(ctx.side),
			// The viewport is transparent to pointers so the page stays usable around a
			// non-modal drawer; the panel has to opt back in.
			'pointer-events: auto;',
			`--drawer-swipe-movement-x: ${axis === 'x' ? movement * outwardSign : 0}px;`,
			`--drawer-swipe-movement-y: ${axis === 'y' ? movement * outwardSign : 0}px;`,
			`--drawer-swipe-progress: ${swipeProgress};`,
			`--drawer-swipe-strength: ${releaseStrength};`,
			`--drawer-overdrag: ${overdrag}px;`,
			`--drawer-snap-point-offset: ${restingOffset * outwardSign}px;`,
			`--drawer-width: ${panelWidth}px;`,
			`--drawer-height: ${panelHeight}px;`,
			`--drawer-frontmost-height: ${drawerStack.frontmostExtent}px;`,
			`--nested-drawers: ${depthFromFront};`,
			// Deliberately absent while the keyboard is down, so the consumer's
			// `var(--drawer-keyboard-inset, 0px)` fallback is what applies at rest.
			keyboard && keyboard.inset > 0 ? `--drawer-keyboard-inset: ${keyboard.inset}px;` : '',
			styleProp ?? ''
		]
			.filter(Boolean)
			.join(' ')
	);

	/* ── lifecycle ─────────────────────────────────────────────────────── */

	// Register this element so Drawer.Portal can measure its exit animation.
	$effect(() => {
		presence?.setMotionTarget(panelRef ?? null);
		return () => presence?.setMotionTarget(null);
	});

	// Keeps --drawer-width/--drawer-height honest as content grows, which nested
	// stacking and snap points both read.
	$effect(() => {
		const element = panelRef;
		if (!browser || !element || typeof ResizeObserver === 'undefined') return;

		const measure = () => {
			const rect = element.getBoundingClientRect();
			panelWidth = rect.width;
			panelHeight = rect.height;
		};
		measure();

		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	});

	// Snap points expressed as fractions or percentages are resolved against the
	// viewport, and `rem` against the root font size, so both have to be tracked
	// rather than read once — a phone rotating mid-session changes both.
	$effect(() => {
		if (!browser) return;

		const measure = () => {
			viewportWidth = window.innerWidth;
			viewportHeight = window.innerHeight;
			const parsed = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
			if (Number.isFinite(parsed) && parsed > 0) rootFontSize = parsed;
		};
		measure();

		window.addEventListener('resize', measure);
		return () => window.removeEventListener('resize', measure);
	});

	function close(reason: 'escape-key' | 'outside-press' | 'imperative-action', event?: Event) {
		ctx.close(reason, event);
	}

	/** Outside presses only dismiss the topmost layer of the whole stack. */
	function closeIfTopmost(event: MouseEvent) {
		if (layerId && isTopmostLayer(layerId)) {
			close('outside-press', event);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		// Another layer (or a widget inside this one) already consumed this Escape —
		// a single keypress must dismiss at most one thing.
		if (event.defaultPrevented) return;
		if (event.key !== 'Escape' || !isOpen || !ctx.shouldCloseOnEscape) return;
		// A popover or menu opened inside the drawer sits above it in the unified stack.
		if (layerId && isTopmostLayer(layerId)) {
			event.preventDefault();
			close('escape-key', event);
		}
	}

	let unsubscribeStack: (() => void) | null = null;

	onMount(() => {
		if (!browser) return;
		// Registered as a modal layer, the same kind dialogs use, so Escape ordering
		// and z-index interleave correctly between the two.
		layerId = pushLayer('dialog');
		layerLevel = getLayerKindIndex(layerId);
		ctx.setStackLevel(layerLevel);
		stackId = registerDrawer();
		// The level is the CURRENT index, not one frozen at push time: with two sibling
		// layers, closing and reopening the first would otherwise mint it the same level
		// as the still-open second (duplicate z-index).
		unsubscribeStack = subscribeLayerStack(() => {
			if (layerId === null) return;
			const currentLevel = getLayerKindIndex(layerId);
			if (currentLevel === -1 || currentLevel === layerLevel) return;
			layerLevel = currentLevel;
			ctx.setStackLevel(currentLevel);
		});
		document.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		if (!browser) return;
		unsubscribeStack?.();
		unsubscribeStack = null;
		if (layerId) removeLayer(layerId);
		if (stackId) unregisterDrawer(stackId);
		stackId = null;
		document.removeEventListener('keydown', handleKeydown);
	});
</script>

<!--
	`inert` already removes the closed panel from the a11y tree AND prevents focus, so no
	`aria-hidden` is needed. Setting both meant that during the exit animation (still
	mounted, `isOpen` already false) a descendant that retained focus sat under
	`aria-hidden`, tripping the browser's "aria-hidden on a focused element" warning.
-->
<div
	bind:this={panelRef}
	class={className}
	role="dialog"
	aria-modal={isOpen && isModal ? 'true' : undefined}
	aria-labelledby={ctx.labelledBy}
	aria-describedby={ctx.describedBy}
	inert={!isOpen}
	data-drawer-content
	data-side={ctx.side}
	data-state={isOpen ? 'open' : 'closed'}
	data-entering={presence?.isEntering || undefined}
	data-exiting={presence?.isExiting || undefined}
	data-starting-style={startingStyle.active || undefined}
	data-swiping={isDragging || undefined}
	data-swipe-dismiss={dismissedBySwipe || undefined}
	data-swipe-direction={directionFor(ctx.side)}
	data-expanded={isExpanded || undefined}
	data-nested-drawer-open={nestedDrawerOpen || undefined}
	data-nested-drawer-swiping={nestedDrawerSwiping || undefined}
	{style}
	use:clickOutside={{
		handler: closeIfTopmost,
		enabled: isOpen && ctx.shouldCloseOnInteractOutside,
		ignore: [ctx.triggerRef]
	}}
	use:focusTrap={{ enabled: shouldTrapFocus, initialFocus }}
	use:scrollLock={shouldLockScroll}
	use:ariaHideOutside={isOpen && isModal}
	use:swipeGesture={swipeOptions}
	{...restProps}
>
	<div
		data-drawer-bleed
		aria-hidden="true"
		style="position: absolute; {bleedPosition(ctx.side)} background: inherit; pointer-events: none;"
	></div>
	{#if children}
		{@render children()}
	{/if}
</div>
