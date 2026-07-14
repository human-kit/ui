/**
 * Click outside primitive.
 * Detects clicks outside of an element.
 */

export type ClickOutsideOptions = {
	/** Callback when clicking outside. */
	handler: (event: MouseEvent) => void;
	/** Whether the listener is enabled. */
	enabled?: boolean;
	/** Elements to ignore (clicks on these won't trigger). */
	ignore?: (HTMLElement | null)[];
};

/**
 * Selector matching every portalled dismissable surface the library renders
 * (dialog, popover, menu). Custom surfaces can opt in with `data-top-layer`.
 * Keeping this list in one place prevents the drift where menus were missing
 * from the check and a menu opened inside a popover dismissed the popover.
 * Shared with `aria-hide-outside`, which must not inert surfaces portalled
 * above an active modal.
 */
export const TOP_LAYER_SELECTOR =
	'[data-top-layer], [data-dialog-content], [role="dialog"], [data-menu-content], [role="menu"]';

/**
 * Check if a click landed on a "top layer" (dialog, popover, menu, etc.) stacked
 * *above* the reference node — i.e. a portal spawned from within it.
 *
 * Portaled overlays append to the document in mount order, so a layer that
 * follows `node` in document order opened after it (a nested popover/dialog) and
 * its clicks must not dismiss `node`. A layer that *precedes* `node` is an
 * enclosing ancestor overlay (e.g. the dialog this popover lives in) — and since
 * a modal layer marks everything outside itself `inert`, an outside click often
 * resolves to that ancestor. Treating it as "inside" would wrongly keep `node`
 * open, so those clicks must still dismiss, exactly like clicking the page.
 */
export function isTargetInTopLayerAbove(node: Node, target: Node): boolean {
	if (!(target instanceof Element)) return false;

	const topLayerElement = target.closest(TOP_LAYER_SELECTOR);
	if (topLayerElement === null) return false;

	return (node.compareDocumentPosition(topLayerElement) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
}

/**
 * Svelte action that detects clicks outside of an element.
 *
 * @example
 * ```svelte
 * <div use:clickOutside={{ handler: close, ignore: [triggerRef] }}>
 *   Popover content
 * </div>
 * ```
 */
export function clickOutside(node: HTMLElement, options: ClickOutsideOptions) {
	let { handler, enabled = true, ignore = [] } = options;

	function handleClick(event: MouseEvent) {
		if (!enabled) return;

		const target = event.target as Node;

		if (node.contains(target)) return;

		for (const el of ignore) {
			if (el && el.contains(target)) return;
		}

		// Don't trigger if clicking on a top-layer element stacked above this node
		// (a nested popover/dialog/menu). An enclosing ancestor overlay still dismisses.
		if (isTargetInTopLayerAbove(node, target)) return;

		handler(event);
	}

	if (enabled) {
		document.addEventListener('mousedown', handleClick, true);
	}

	return {
		update(newOptions: ClickOutsideOptions) {
			const wasEnabled = enabled;
			handler = newOptions.handler;
			enabled = newOptions.enabled ?? true;
			ignore = newOptions.ignore ?? [];

			if (enabled && !wasEnabled) {
				document.addEventListener('mousedown', handleClick, true);
			} else if (!enabled && wasEnabled) {
				document.removeEventListener('mousedown', handleClick, true);
			}
		},
		destroy() {
			document.removeEventListener('mousedown', handleClick, true);
		}
	};
}
