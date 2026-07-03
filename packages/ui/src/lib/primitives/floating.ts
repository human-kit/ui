import {
	computePosition,
	flip,
	shift,
	offset as offsetMiddleware,
	size,
	autoUpdate,
	type Placement as FloatingPlacement
} from '@floating-ui/dom';

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
	/** Callback when position is updated. */
	onPositionUpdate?: (x: number, y: number, placement: FloatingPlacement) => void;
};

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
export function createFloating(anchorElement: HTMLElement | null, options: FloatingOptions = {}) {
	const {
		offset = 8,
		placement = 'bottom',
		shouldFlip = true,
		boundaryElement = null,
		onPositionUpdate
	} = options;

	let cleanup: (() => void) | null = null;

	function action(floatingElement: HTMLElement) {
		if (!anchorElement) return;

		const normalizedPlacement = normalizeExtendedPlacement(placement);

		const middleware = [
			offsetMiddleware(offset),
			...(shouldFlip ? [flip({ boundary: boundaryElement || undefined })] : []),
			shift({ boundary: boundaryElement || undefined }),
			size({
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

		async function updatePosition() {
			if (!anchorElement || !floatingElement) return;

			const {
				x,
				y,
				placement: finalPlacement
			} = await computePosition(anchorElement, floatingElement, {
				placement: normalizedPlacement,
				middleware
			});

			Object.assign(floatingElement.style, {
				left: `${x}px`,
				top: `${y}px`
			});

			onPositionUpdate?.(x, y, finalPlacement);
		}

		cleanup = autoUpdate(anchorElement, floatingElement, updatePosition);

		return {
			destroy() {
				cleanup?.();
				cleanup = null;
			}
		};
	}

	return action;
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
	options: { anchor: HTMLElement | null } & FloatingOptions
) {
	const { anchor, ...floatingOptions } = options;

	if (!anchor) return;

	const normalizedPlacement = normalizeExtendedPlacement(floatingOptions.placement || 'bottom');
	const offset = floatingOptions.offset ?? 8;
	const shouldFlip = floatingOptions.shouldFlip ?? true;
	const boundaryElement = floatingOptions.boundaryElement || null;

	const middleware = [
		offsetMiddleware(offset),
		...(shouldFlip ? [flip({ boundary: boundaryElement || undefined })] : []),
		shift({ boundary: boundaryElement || undefined }),
		size({
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

	let cleanup: (() => void) | null = null;

	async function updatePosition() {
		if (!anchor || !floatingElement) return;

		const {
			x,
			y,
			placement: finalPlacement
		} = await computePosition(anchor, floatingElement, {
			placement: normalizedPlacement,
			middleware,
			strategy: 'fixed' // Use fixed strategy for portal-rendered elements
		});

		Object.assign(floatingElement.style, {
			left: `${x}px`,
			top: `${y}px`
		});

		floatingOptions.onPositionUpdate?.(x, y, finalPlacement);
	}

	cleanup = autoUpdate(anchor, floatingElement, updatePosition);

	return {
		update(newOptions: { anchor: HTMLElement | null } & FloatingOptions) {
			cleanup?.();
			if (newOptions.anchor) {
				cleanup = autoUpdate(newOptions.anchor, floatingElement, updatePosition);
			}
		},
		destroy() {
			cleanup?.();
		}
	};
}
