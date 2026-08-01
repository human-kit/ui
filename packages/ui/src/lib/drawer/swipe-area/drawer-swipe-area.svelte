<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		swipeGesture,
		getSwipeAxis,
		type SwipeGestureOptions
	} from '../../primitives/swipe-gesture';
	import { getFloatingLayerZIndex } from '../../primitives/layer-stack';
	import { requireDrawerContext } from '../root/context';
	import type { DrawerSide } from '../root/types';

	/**
	 * Drawer.SwipeArea — an invisible strip along the viewport edge that opens the
	 * drawer when dragged inward.
	 *
	 * Render it outside `Drawer.Portal`: it has to exist while the drawer is closed,
	 * and the portal only mounts once it opens.
	 *
	 * A swipe is never the only way in — pair this with a `Drawer.Trigger`, or the
	 * drawer is unreachable by keyboard and to anyone who cannot perform the gesture.
	 */
	type DrawerSwipeAreaProps = {
		/** CSS class for the strip. */
		class?: string;
		/** Thickness of the strip, as a CSS length. */
		size?: string;
		/** Turns the gesture off without unmounting the strip. */
		disabled?: boolean;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class'>;

	let {
		class: className = '',
		size = '24px',
		disabled = false,
		style: styleProp,
		...restProps
	}: DrawerSwipeAreaProps = $props();

	const ctx = requireDrawerContext('Drawer.SwipeArea');

	/** Fraction of the panel the drag must cover for the drawer to stay open. */
	const OPEN_FRACTION = 0.4;
	/** px/ms past which a flick opens regardless of distance. */
	const FLICK_VELOCITY = 0.4;

	// The gesture's "outward" is the direction a panel LEAVES by, and opening runs the
	// other way — so it is configured against the opposite side and its positive
	// displacement is the distance pulled in.
	function opposite(side: DrawerSide): DrawerSide {
		if (side === 'bottom') return 'top';
		if (side === 'top') return 'bottom';
		if (side === 'left') return 'right';
		return 'left';
	}

	const gestureSide = $derived(opposite(ctx.side));
	const axis = $derived(getSwipeAxis(ctx.side));

	let isSwiping = $state(false);

	function handleStart() {
		isSwiping = true;
		// Open immediately so the panel mounts and can start following the finger; the
		// release decides whether it stays.
		ctx.setSwipeOpenDistance(0);
		ctx.open();
	}

	function handleMove(displacement: number) {
		ctx.setSwipeOpenDistance(Math.max(0, displacement));
	}

	function handleEnd(displacement: number, velocity: number, event: PointerEvent) {
		isSwiping = false;
		ctx.setSwipeOpenDistance(null);

		const extent = ctx.panelExtent;
		const farEnough = extent > 0 && displacement >= extent * OPEN_FRACTION;
		if (farEnough || velocity >= FLICK_VELOCITY) return;

		ctx.close('swipe', event);
	}

	function handleCancel() {
		isSwiping = false;
		ctx.setSwipeOpenDistance(null);
		ctx.close('swipe');
	}

	const swipeOptions = $derived<SwipeGestureOptions>({
		// `|| isSwiping` keeps the gesture alive through the open it just caused.
		// Without it the drawer opening flips `enabled` to false, the action tears the
		// in-flight drag down, and the release that decides whether to keep the drawer
		// open never arrives — so a half-hearted swipe left it open.
		enabled: !disabled && (!ctx.isOpen || isSwiping),
		side: gestureSide,
		// The strip is a dedicated gesture surface with nothing to scroll, so the axis
		// can be reserved outright — unlike the panel, where doing so would break every
		// scrollable region inside it.
		touchAction: 'none',
		onStart: handleStart,
		onMove: ({ displacement }) => handleMove(displacement),
		onEnd: ({ displacement, velocity, event }) => handleEnd(displacement, velocity, event),
		onCancel: handleCancel
	});

	function edgeFor(side: DrawerSide): string {
		if (side === 'top') return `top: 0; left: 0; right: 0; height: ${size};`;
		if (side === 'bottom') return `bottom: 0; left: 0; right: 0; height: ${size};`;
		if (side === 'left') return `left: 0; top: 0; bottom: 0; width: ${size};`;
		return `right: 0; top: 0; bottom: 0; width: ${size};`;
	}

	/** Direction the finger travels to open, for `data-swipe-direction`. */
	function directionFor(side: DrawerSide): 'up' | 'down' | 'left' | 'right' {
		if (side === 'bottom') return 'up';
		if (side === 'top') return 'down';
		if (side === 'left') return 'right';
		return 'left';
	}

	// Below the drawer's own layers so an open panel is never blocked by the strip,
	// above ordinary page content so the gesture is reachable.
	const style = $derived(
		`position: fixed; ${edgeFor(ctx.side)} z-index: ${getFloatingLayerZIndex() - 2}; ${
			ctx.isOpen ? 'pointer-events: none;' : ''
		} ${styleProp ?? ''}`
	);
</script>

<div
	class={className}
	data-drawer-swipe-area
	data-state={ctx.isOpen ? 'open' : 'closed'}
	data-disabled={disabled || undefined}
	data-swiping={isSwiping || undefined}
	data-swipe-direction={directionFor(ctx.side)}
	data-axis={axis}
	aria-hidden="true"
	{style}
	use:swipeGesture={swipeOptions}
	{...restProps}
></div>
