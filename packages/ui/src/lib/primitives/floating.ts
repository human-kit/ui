import {
	computePosition,
	flip,
	shift,
	limitShift,
	offset as offsetMiddleware,
	size,
	autoUpdate,
	type Placement as FloatingPlacement,
	type VirtualElement
} from '@floating-ui/dom';

/**
 * What a floating panel can be positioned against: a real element, or a virtual
 * one — an object that only knows how to report a rect. Floating UI supports
 * both natively, in `computePosition` and in `autoUpdate` (which checks for a
 * real element before observing it for resizes, and falls back to the virtual
 * element's `contextElement` for the ancestor scroll listeners).
 */
export type FloatingAnchor = HTMLElement | VirtualElement | null;

/**
 * A zero-size anchor at a viewport point, for panels that follow the pointer
 * instead of an element — a context menu at the cursor, a toolbar at a text
 * selection.
 *
 * `contextElement` should be the surface the point was measured on: without it
 * `autoUpdate` has no node whose scroll ancestors it can watch, so the panel
 * would not track a scrolling container.
 *
 * Coordinates are viewport-relative (`clientX`/`clientY`) and positioning uses
 * the `fixed` strategy, so the panel stays where the pointer was — which is what
 * a native context menu does.
 *
 * Because the rect has no size, `--trigger-width` / `--trigger-height` resolve to
 * `0px` on the panel. Everything else (`flip`, `shift`, `size`, the
 * `--available-*` custom properties and `--transform-origin`) works unchanged,
 * which is the whole reason to go through Floating UI rather than assigning
 * `left`/`top` by hand.
 */
export function createPointAnchor(
	x: number,
	y: number,
	contextElement?: Element | null
): VirtualElement {
	return {
		getBoundingClientRect: () => new DOMRect(x, y, 0, 0),
		...(contextElement ? { contextElement } : {})
	};
}

/**
 * Placement options for floating elements.
 * Follows the specification with logical 'start'/'end' values.
 */
export type Placement =
	| 'bottom'
	| 'bottom-start'
	| 'bottom-end'
	| 'top'
	| 'top-start'
	| 'top-end'
	| 'left'
	| 'left-start'
	| 'left-end'
	| 'right'
	| 'right-start'
	| 'right-end';

/**
 * Extended placement type that includes human-readable variants.
 */
export type ExtendedPlacement =
	| Placement
	| 'bottom left'
	| 'bottom right'
	| 'top left'
	| 'top right'
	| 'left top'
	| 'left bottom'
	| 'right top'
	| 'right bottom'
	| 'start'
	| 'start top'
	| 'start bottom'
	| 'end'
	| 'end top'
	| 'end bottom';

/**
 * Options for the floating element positioning.
 */
export type FloatingOptions = {
	/** Offset along the main axis from the anchor. */
	offset?: number;
	/** Placement relative to the anchor element. */
	placement?: ExtendedPlacement;
	/** Whether to flip when there's insufficient space. */
	shouldFlip?: boolean;
	/** Boundary element for positioning constraints. */
	boundaryElement?: Element | null;
	/**
	 * Minimum gap kept between the floating element and the boundary edges, in
	 * pixels. Without it the panel sits flush against the viewport edge, which on
	 * a phone reads as clipped content; it also caps `--available-width/height`
	 * so a panel that shrinks to fit still leaves the gutter visible.
	 */
	collisionPadding?: number;
	/** Callback when position is updated. */
	onPositionUpdate?: (x: number, y: number, placement: FloatingPlacement) => void;
};

/** Viewport gutter applied when no `collisionPadding` is given. */
const DEFAULT_COLLISION_PADDING = 8;

/**
 * Converts extended placement syntax to Floating UI placement.
 */
function normalizeExtendedPlacement(placement: ExtendedPlacement): FloatingPlacement {
	const mappings: Record<string, FloatingPlacement> = {
		bottom: 'bottom',
		'bottom-start': 'bottom-start',
		'bottom-end': 'bottom-end',
		'bottom left': 'bottom-start',
		'bottom right': 'bottom-end',
		top: 'top',
		'top-start': 'top-start',
		'top-end': 'top-end',
		'top left': 'top-start',
		'top right': 'top-end',
		left: 'left',
		'left-start': 'left-start',
		'left-end': 'left-end',
		'left top': 'left-start',
		'left bottom': 'left-end',
		right: 'right',
		'right-start': 'right-start',
		'right-end': 'right-end',
		'right top': 'right-start',
		'right bottom': 'right-end',
		start: 'left',
		'start top': 'left-start',
		'start bottom': 'left-end',
		end: 'right',
		'end top': 'right-start',
		'end bottom': 'right-end'
	};

	return mappings[placement] || 'bottom';
}

/**
 * Calculates the transform origin based on the final placement.
 * Used for animations that should originate from the anchor point.
 */
function getTransformOrigin(placement: FloatingPlacement): string {
	const [side, align] = placement.split('-') as [string, string | undefined];

	const sideMap: Record<string, string> = {
		top: 'bottom',
		bottom: 'top',
		left: 'right',
		right: 'left'
	};

	const alignMap: Record<string, string> = {
		start: 'left',
		end: 'right'
	};

	const vertical = side === 'top' || side === 'bottom';
	const oppositeSide = sideMap[side] || 'top';

	if (vertical) {
		const horizontalAlign = align ? alignMap[align] || 'center' : 'center';
		return `${horizontalAlign} ${oppositeSide}`;
	} else {
		const verticalAlign = align ? (align === 'start' ? 'top' : 'bottom') : 'center';
		return `${oppositeSide} ${verticalAlign}`;
	}
}

/**
 * Creates a Svelte action for positioning a floating element relative to an anchor.
 *
 * Exposes CSS custom properties on the floating element:
 * - `--trigger-width`: The trigger element's width
 * - `--trigger-height`: The trigger element's height
 * - `--available-width`: Available width between trigger and viewport edge
 * - `--available-height`: Available height between trigger and viewport edge
 * - `--transform-origin`: Coordinates for animations (e.g., "center top")
 */
export function createFloating(anchorElement: FloatingAnchor, options: FloatingOptions = {}) {
	// Thin wrapper over `floating` — the previous standalone implementation had
	// drifted (it was missing `strategy: 'fixed'`, mispositioning portalled content).
	return function action(floatingElement: HTMLElement) {
		return floating(floatingElement, { anchor: anchorElement, ...options });
	};
}

/**
 * Simple Svelte action for floating positioning.
 * Use when you just need positioning without complex state management.
 *
 * Exposes CSS custom properties on the floating element:
 * - `--trigger-width`: The trigger element's width
 * - `--trigger-height`: The trigger element's height
 * - `--available-width`: Available width between trigger and viewport edge
 * - `--available-height`: Available height between trigger and viewport edge
 * - `--transform-origin`: Coordinates for animations (e.g., "center top")
 */
export function floating(
	floatingElement: HTMLElement,
	options: { anchor: FloatingAnchor } & FloatingOptions
) {
	// Kept mutable so `updatePosition` always reads the CURRENT anchor/options.
	// The previous version closed over the initial values: reactive changes to
	// placement/offset/boundary were silently ignored, and after an anchor swap
	// autoUpdate observed the new element while positioning kept measuring the
	// old one. It also returned `undefined` when the anchor was null at mount,
	// so Svelte never called `update` and a late-arriving anchor (trigger ref
	// bound a tick later) left the panel unpositioned forever.
	let currentOptions = options;
	let cleanup: (() => void) | null = null;

	function buildMiddleware() {
		const offset = currentOptions.offset ?? 8;
		const shouldFlip = currentOptions.shouldFlip ?? true;
		const boundaryElement = currentOptions.boundaryElement || null;
		const padding = currentOptions.collisionPadding ?? DEFAULT_COLLISION_PADDING;

		return [
			offsetMiddleware(offset),
			...(shouldFlip ? [flip({ boundary: boundaryElement || undefined, padding })] : []),
			// `shift`'s main axis is the one running ALONG the placement edge, and its
			// cross axis is off by default. For `top`/`bottom` that main axis is x, so a
			// dropdown too wide for the viewport is pulled back into view. For
			// `left`/`right` it is y — nothing pulls it back horizontally, so a panel
			// that fits on neither side stays wherever the placement put it, which for
			// `left-*` means off the left edge entirely.
			//
			// Submenus are exactly that case: they open `right-start` and flip to
			// `left-start`, and on a narrow viewport neither side has room. Enabled only
			// for the horizontal placements, because on `top`/`bottom` the cross axis is
			// vertical and shifting there would slide a dropdown over its own trigger —
			// which `flip` already handles better. `limitShift` keeps the panel from
			// sliding so far that it detaches from its anchor.
			shift((state) => ({
				boundary: boundaryElement || undefined,
				padding,
				crossAxis: state.placement.startsWith('left') || state.placement.startsWith('right'),
				limiter: limitShift()
			})),
			size({
				padding,
				apply({ rects, availableWidth, availableHeight, elements, placement }) {
					const floatingEl = elements.floating;
					const clampedAvailableWidth = Math.max(0, availableWidth);
					const clampedAvailableHeight = Math.max(0, availableHeight);
					floatingEl.style.setProperty('--trigger-width', `${rects.reference.width}px`);
					floatingEl.style.setProperty('--trigger-height', `${rects.reference.height}px`);
					floatingEl.style.setProperty('--available-width', `${clampedAvailableWidth}px`);
					floatingEl.style.setProperty('--available-height', `${clampedAvailableHeight}px`);
					floatingEl.style.setProperty('--transform-origin', getTransformOrigin(placement));
					floatingEl.style.maxWidth = `${clampedAvailableWidth}px`;
					floatingEl.style.maxHeight = `${clampedAvailableHeight}px`;
				}
			})
		];
	}

	async function updatePosition() {
		const anchor = currentOptions.anchor;
		if (!anchor || !floatingElement) return;

		const {
			x,
			y,
			placement: finalPlacement
		} = await computePosition(anchor, floatingElement, {
			placement: normalizeExtendedPlacement(currentOptions.placement || 'bottom'),
			middleware: buildMiddleware(),
			strategy: 'fixed' // Use fixed strategy for portal-rendered elements
		});

		Object.assign(floatingElement.style, {
			left: `${x}px`,
			top: `${y}px`
		});

		currentOptions.onPositionUpdate?.(x, y, finalPlacement);
	}

	function stop() {
		cleanup?.();
		cleanup = null;
	}

	function start() {
		stop();
		const anchor = currentOptions.anchor;
		if (!anchor) return;
		cleanup = autoUpdate(anchor, floatingElement, updatePosition);
	}

	start();

	return {
		update(newOptions: { anchor: FloatingAnchor } & FloatingOptions) {
			const anchorChanged = newOptions.anchor !== currentOptions.anchor;
			currentOptions = newOptions;

			if (anchorChanged) {
				// Re-subscribe autoUpdate to the new anchor (or stop when it's gone).
				start();
			} else if (cleanup) {
				// Same anchor, new placement/offset/boundary: reposition immediately.
				void updatePosition();
			}
		},
		destroy() {
			stop();
		}
	};
}
