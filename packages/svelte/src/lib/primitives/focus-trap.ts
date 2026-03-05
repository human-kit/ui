/**
 * Focus trap primitive.
 * Traps keyboard focus within a container element.
 */

const FOCUSABLE_SELECTOR = [
	'a[href]',
	'button:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'[tabindex]:not([tabindex="-1"])',
	'[contenteditable="true"]'
].join(', ');

import { focusWithModality, getInteractionModality } from './input-modality';

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
		(el) => el.offsetParent !== null
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
	export function focusTrap(node: HTMLElement, options: boolean | FocusTrapOptions = true) {
		let previousActiveElement: HTMLElement | null = null;
		let enabled = resolveEnabled(options);
		let restoreFocus = resolveRestoreFocus(options);
		let initialFocus = typeof options === 'boolean' ? undefined : options.initialFocus;
		let enabled = resolveEnabled(options);
		let restoreFocus = resolveRestoreFocus(options);
		let initialFocus = typeof options === 'boolean' ? undefined : options.initialFocus;

		function handleKeydown(event: KeyboardEvent) {
			if (event.key !== 'Tab') return;

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
			} else {
				if (document.activeElement === lastElement || document.activeElement === node) {
					event.preventDefault();
					firstElement.focus();
				}
			}
		}

		function activate() {
			previousActiveElement = document.activeElement as HTMLElement;

			if (!node.hasAttribute('tabindex')) {
				node.setAttribute('tabindex', '-1');
			}

			// Focus first focusable element, or the container if none
			requestAnimationFrame(() => {
				const initialFocusTarget = resolveInitialFocus(node, initialFocus);
				const modality = getInteractionModality();
				if (initialFocusTarget && initialFocusTarget.isConnected) {
					focusWithModality(initialFocusTarget, modality);
					return;
				}
				const focusableElements = getFocusableElements(node);
				if (focusableElements.length > 0) {
					focusWithModality(focusableElements[0], modality);
				} else {
					focusWithModality(node, modality);
				}
			});

			document.addEventListener('keydown', handleKeydown, true);
		}

		function deactivate() {
			document.removeEventListener('keydown', handleKeydown, true);

			if (restoreFocus && previousActiveElement && previousActiveElement.focus) {
				if (restoreFocus && previousActiveElement && previousActiveElement.focus) {
					previousActiveElement.focus();
				}
			}

			if (enabled) {
				activate();
			}

			return {
				update(newOptions: boolean | FocusTrapOptions) {
					const nextEnabled = resolveEnabled(newOptions);
					const nextRestoreFocus = resolveRestoreFocus(newOptions);
					if (nextEnabled && !enabled) {
						update(newOptions: boolean | FocusTrapOptions) {
							const nextEnabled = resolveEnabled(newOptions);
							const nextRestoreFocus = resolveRestoreFocus(newOptions);
							if (nextEnabled && !enabled) {
								activate();
							} else if (!nextEnabled && enabled) {
							} else if (!nextEnabled && enabled) {
								deactivate();
							}
							options = newOptions;
							enabled = nextEnabled;
							restoreFocus = nextRestoreFocus;
							initialFocus = typeof newOptions === 'boolean' ? undefined : newOptions.initialFocus;
							options = newOptions;
							enabled = nextEnabled;
							restoreFocus = nextRestoreFocus;
							initialFocus = typeof newOptions === 'boolean' ? undefined : newOptions.initialFocus;
						},
						destroy() {
							if (enabled) {
								deactivate();
							}
						}
					};
				}
