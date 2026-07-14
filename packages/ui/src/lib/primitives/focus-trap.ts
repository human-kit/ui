/**
 * Focus trap primitive.
 * Traps keyboard focus within a container element.
 */

import { focusWithModality, getInteractionModality } from './input-modality';

const FOCUSABLE_SELECTOR = [
	'a[href]',
	'area[href]',
	'button:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'audio[controls]',
	'video[controls]',
	'iframe',
	'summary',
	'[tabindex]:not([tabindex="-1"])',
	'[contenteditable]:not([contenteditable="false"])'
].join(', ');

/**
 * Active traps in activation order. Only the topmost trap handles Tab: with
 * stacked overlays (dialog → nested dialog / modal popover) every trap used to
 * process the same document-level keydown, and an ancestor trap — whose content
 * the nested layer had marked `inert` — would preventDefault and try to focus
 * its own unfocusable content, leaving Tab dead inside the nested overlay.
 */
const activeTraps: HTMLElement[] = [];

function isTopmostTrap(node: HTMLElement): boolean {
	return activeTraps.length > 0 && activeTraps[activeTraps.length - 1] === node;
}

export type FocusTrapOptions = {
	enabled?: boolean;
	restoreFocus?: boolean;
	initialFocus?: HTMLElement | string | (() => HTMLElement | null | undefined);
};

function resolveEnabled(options: boolean | FocusTrapOptions): boolean {
	if (typeof options === 'boolean') return options;
	return options.enabled ?? true;
}

function resolveRestoreFocus(options: boolean | FocusTrapOptions): boolean {
	if (typeof options === 'boolean') return true;
	return options.restoreFocus ?? true;
}

function resolveInitialFocus(
	container: HTMLElement,
	initialFocus: FocusTrapOptions['initialFocus']
): HTMLElement | null {
	if (!initialFocus) return null;
	if (typeof initialFocus === 'function') {
		return initialFocus() ?? null;
	}
	if (typeof initialFocus === 'string') {
		return container.querySelector<HTMLElement>(initialFocus);
	}
	return initialFocus;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
	return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
		(element) =>
			// getClientRects covers display:none and detached nodes while still
			// accepting position:fixed descendants (whose offsetParent is null).
			element.getClientRects().length > 0 &&
			element.closest('[inert]') === null &&
			getComputedStyle(element).visibility !== 'hidden'
	);
}

/**
 * Svelte action that traps focus within an element.
 *
 * @example
 * ```svelte
 * <div use:focusTrap={isOpen}>
 *   <button>First</button>
 *   <button>Last</button>
 * </div>
 * ```
 */
export function focusTrap(node: HTMLElement, options: boolean | FocusTrapOptions = true) {
	let previousActiveElement: HTMLElement | null = null;
	let enabled = resolveEnabled(options);
	let restoreFocus = resolveRestoreFocus(options);
	let initialFocus = typeof options === 'boolean' ? undefined : options.initialFocus;
	let pendingInitialFocusFrame: number | undefined;

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Tab') return;
		// Only the topmost active trap arbitrates Tab; ancestor traps under a
		// nested overlay must not intercept it.
		if (!isTopmostTrap(node)) return;

		const focusableElements = getFocusableElements(node);
		if (focusableElements.length === 0) {
			event.preventDefault();
			node.focus();
			return;
		}

		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];
		const focusIsInside = node.contains(document.activeElement);

		if (!focusIsInside) {
			event.preventDefault();
			firstElement.focus();
			return;
		}

		if (event.shiftKey) {
			if (document.activeElement === firstElement || document.activeElement === node) {
				event.preventDefault();
				lastElement.focus();
			}
			return;
		}

		if (document.activeElement === lastElement || document.activeElement === node) {
			event.preventDefault();
			firstElement.focus();
		}
	}

	function activate() {
		previousActiveElement = document.activeElement as HTMLElement;
		activeTraps.push(node);

		if (!node.hasAttribute('tabindex')) {
			node.setAttribute('tabindex', '-1');
		}

		pendingInitialFocusFrame = requestAnimationFrame(() => {
			pendingInitialFocusFrame = undefined;
			// A trap stacked above us activated (or we deactivated) before this
			// frame — applying initial focus now would steal it from that layer.
			if (!isTopmostTrap(node)) return;

			const initialFocusTarget = resolveInitialFocus(node, initialFocus);
			const modality = getInteractionModality();
			if (initialFocusTarget && initialFocusTarget.isConnected) {
				focusWithModality(initialFocusTarget, modality);
				return;
			}

			const focusableElements = getFocusableElements(node);
			if (focusableElements.length > 0) {
				focusWithModality(focusableElements[0], modality);
				return;
			}

			focusWithModality(node, modality);
		});

		document.addEventListener('keydown', handleKeydown, true);
	}

	function deactivate() {
		const index = activeTraps.lastIndexOf(node);
		if (index !== -1) {
			activeTraps.splice(index, 1);
		}

		if (pendingInitialFocusFrame !== undefined) {
			cancelAnimationFrame(pendingInitialFocusFrame);
			pendingInitialFocusFrame = undefined;
		}

		document.removeEventListener('keydown', handleKeydown, true);

		// Restore only as a fallback: if something else (e.g. the overlay's own
		// close handler focusing its trigger) already moved focus outside the
		// trapped subtree, restoring here would stomp that deliberate move.
		const active = document.activeElement;
		const focusStillInside = active === null || active === document.body || node.contains(active);
		if (
			restoreFocus &&
			focusStillInside &&
			previousActiveElement &&
			previousActiveElement.isConnected &&
			previousActiveElement.focus
		) {
			previousActiveElement.focus();
		}
	}

	if (enabled) {
		activate();
	}

	return {
		update(newOptions: boolean | FocusTrapOptions) {
			const nextEnabled = resolveEnabled(newOptions);

			// Apply the new option values BEFORE toggling activation, so a
			// deactivation triggered by this update honors the options it was
			// called with (e.g. `enabled: false, restoreFocus: false`).
			options = newOptions;
			restoreFocus = resolveRestoreFocus(newOptions);
			initialFocus = typeof newOptions === 'boolean' ? undefined : newOptions.initialFocus;

			if (nextEnabled && !enabled) {
				activate();
			} else if (!nextEnabled && enabled) {
				deactivate();
			}

			enabled = nextEnabled;
		},
		destroy() {
			if (enabled) {
				deactivate();
			}
		}
	};
}
