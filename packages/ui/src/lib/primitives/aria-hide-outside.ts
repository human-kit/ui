/**
 * Hides all elements in the DOM tree outside of the given targets from screen readers
 * and makes them inert. Based on React Aria's ariaHideOutside implementation.
 *
 * This works by walking the DOM from the body and marking all siblings
 * of ancestors of the target elements as inert. While active, a MutationObserver
 * hides nodes appended to the body afterwards (portalled content, toasts), with
 * two exemptions (see `EXEMPT_SELECTOR`).
 */

import { TOP_LAYER_SELECTOR } from './click-outside';

/**
 * Live regions are exempt from hiding ENTIRELY (neither `aria-hidden` nor `inert` is applied,
 * and their subtree is left untouched): `aria-hidden` would silence their announcements, and
 * `inert` would block interacting with e.g. a toast's dismiss button. The trade-off — a live
 * region staying reachable behind a modal — is intentional: status/alert content is transient
 * and announcing it is the whole point.
 */
const LIVE_REGION_SELECTOR = '[aria-live], [role="status"], [role="alert"], [role="log"]';

/**
 * Elements the MutationObserver must never hide when they appear while a modal is active:
 * - top layers (dialog/popover/menu — the shared `TOP_LAYER_SELECTOR` from click-outside):
 *   portals append in mount order, so a surface added while this hide is active is stacked
 *   ABOVE the modal (it was spawned from within it) and must stay accessible. Its own modality
 *   handling hides what's below it. Surfaces already present when the hide activates are
 *   still hidden by the initial walk (they sit below the new modal).
 * - live regions (see `LIVE_REGION_SELECTOR`).
 */
const EXEMPT_SELECTOR = `${TOP_LAYER_SELECTOR}, ${LIVE_REGION_SELECTOR}`;

interface HideOutsideResult {
	/** Call this to restore the original state */
	restore: () => void;
}

type HiddenElementState = {
	count: number;
	hadInert: boolean;
	ariaHidden: string | null;
};

/**
 * Global hidden state tracker.
 * Allows multiple overlapping hideOutside calls without restoring too early.
 */
const hiddenState = new Map<Element, HiddenElementState>();

function hideElement(element: Element): void {
	const existing = hiddenState.get(element);

	if (existing) {
		existing.count += 1;
		hiddenState.set(element, existing);
	} else {
		hiddenState.set(element, {
			count: 1,
			hadInert: element.hasAttribute('inert'),
			ariaHidden: element.getAttribute('aria-hidden')
		});
	}

	element.setAttribute('inert', '');
	element.setAttribute('aria-hidden', 'true');
}

function restoreElement(element: Element): void {
	const existing = hiddenState.get(element);
	if (!existing) return;

	if (existing.count > 1) {
		existing.count -= 1;
		hiddenState.set(element, existing);
		return;
	}

	if (!existing.hadInert) {
		element.removeAttribute('inert');
	} else {
		element.setAttribute('inert', '');
	}

	if (existing.ariaHidden === null) {
		element.removeAttribute('aria-hidden');
	} else {
		element.setAttribute('aria-hidden', existing.ariaHidden);
	}

	hiddenState.delete(element);
}

/**
 * Hides all content outside of the target elements from assistive technologies
 * and makes it non-interactive.
 *
 * @example
 * ```typescript
 * const { restore } = hideOutside([popoverRef]);
 * // Later, when popover closes:
 * restore();
 * ```
 */
export function hideOutside(targets: HTMLElement[]): HideOutsideResult {
	const affectedElements = new Set<Element>();

	const targetSet = new Set<Element>(targets);

	const targetAncestors = new Set<Element>();
	for (const target of targets) {
		let current: Element | null = target.parentElement;
		while (current) {
			targetAncestors.add(current);
			current = current.parentElement;
		}
	}

	function walk(root: Element): void {
		const children = root.children;
		for (let i = 0; i < children.length; i++) {
			const child = children[i];

			const tagName = child.tagName;
			if (tagName === 'SCRIPT' || tagName === 'STYLE' || tagName === 'LINK') {
				continue;
			}

			if (targetSet.has(child)) {
				continue;
			}

			// Live regions are skipped entirely (see LIVE_REGION_SELECTOR). Note that top layers
			// already present at activation are NOT exempt here: they sit BELOW the new modal
			// (portals append in mount order), so hiding them is intentional — e.g. a nested
			// dialog must hide its parent dialog.
			if (child.matches(LIVE_REGION_SELECTOR)) {
				continue;
			}

			if (targetAncestors.has(child) || child.querySelector(LIVE_REGION_SELECTOR) !== null) {
				// Recurse instead of hiding wholesale, so targets / live regions inside stay visible.
				walk(child);
			} else {
				hideElement(child);
				affectedElements.add(child);
			}
		}
	}

	/** Whether an ancestor was already hidden by THIS call (inert/aria-hidden are inherited). */
	function hasHiddenAncestor(element: Element): boolean {
		let current: Element | null = element.parentElement;
		while (current) {
			if (affectedElements.has(current)) return true;
			current = current.parentElement;
		}
		return false;
	}

	/** Applies the walk() rules — plus the top-layer exemption — to a node added while active. */
	function processAddedElement(element: Element): void {
		const tagName = element.tagName;
		if (tagName === 'SCRIPT' || tagName === 'STYLE' || tagName === 'LINK') return;
		if (targetSet.has(element)) return;
		// Top layers portalled while this hide is active are stacked above the modal; live
		// regions must keep announcing. Both stay untouched (see EXEMPT_SELECTOR).
		if (element.matches(EXEMPT_SELECTOR)) return;
		if (targetAncestors.has(element) || element.querySelector(EXEMPT_SELECTOR) !== null) {
			// Contains something exempt (or a target re-parented into it): recurse so only the
			// non-exempt children are hidden.
			const children = element.children;
			for (let i = 0; i < children.length; i++) {
				processAddedElement(children[i]);
			}
			return;
		}
		hideElement(element);
		affectedElements.add(element);
	}

	if (document.body) {
		walk(document.body);
	}

	// Content mounted while the modal is open (toasts, portals appended to <body>) must be
	// hidden too, or it stays reachable by screen readers behind the modal.
	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			for (const node of mutation.addedNodes) {
				if (!(node instanceof Element) || !node.isConnected) continue;
				// Covered by an ancestor this call already hid.
				if (hasHiddenAncestor(node)) continue;
				const parent = node.parentElement;
				if (parent) {
					// Added inside a target: it's part of the modal itself.
					if (targets.some((target) => target === parent || target.contains(parent))) continue;
					// Added inside an exempt surface (a top layer or live region we left alone).
					if (parent.closest(EXEMPT_SELECTOR) !== null) continue;
				}
				processAddedElement(node);
			}
		}
	});
	if (document.body) {
		observer.observe(document.body, { childList: true, subtree: true });
	}

	let restored = false;

	return {
		restore(): void {
			if (restored) return;
			restored = true;
			observer.disconnect();
			affectedElements.forEach((element) => {
				restoreElement(element);
			});
			affectedElements.clear();
		}
	};
}

/**
 * Svelte action that hides all content outside of the element.
 *
 * @example
 * ```svelte
 * <div use:ariaHideOutside={enabled}>
 *   Modal content
 * </div>
 * ```
 */
export function ariaHideOutside(node: HTMLElement, enabled: boolean = true) {
	let result: HideOutsideResult | null = null;
	let pendingFrame: number | undefined;

	function cancelPendingFrame(): void {
		if (pendingFrame !== undefined) {
			cancelAnimationFrame(pendingFrame);
			pendingFrame = undefined;
		}
	}

	function activate(): void {
		// Cancel any frame still in flight: a rapid enable → disable → enable
		// sequence used to let a stale frame run after deactivation (leaving the
		// whole page inert) or overwrite `result` without restoring the previous
		// one (leaking ref-counted inert/aria-hidden attributes forever).
		cancelPendingFrame();
		pendingFrame = requestAnimationFrame(() => {
			pendingFrame = undefined;
			if (!node.isConnected) return;
			result?.restore();
			result = hideOutside([node]);
		});
	}

	function deactivate(): void {
		cancelPendingFrame();
		if (result) {
			result.restore();
			result = null;
		}
	}

	if (enabled) {
		activate();
	}

	return {
		update(newEnabled: boolean): void {
			if (newEnabled && !enabled) {
				activate();
			} else if (!newEnabled && enabled) {
				deactivate();
			}
			enabled = newEnabled;
		},
		destroy(): void {
			deactivate();
		}
	};
}
