/**
 * Hides all elements in the DOM tree outside of the given targets from screen readers
 * and makes them inert. Based on React Aria's ariaHideOutside implementation.
 *
 * This works by walking the DOM from the body and marking all siblings
 * of ancestors of the target elements as inert.
 */

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

			if (targetAncestors.has(child)) {
				walk(child);
			} else {
				hideElement(child);
				affectedElements.add(child);
			}
		}
	}

	if (document.body) {
		walk(document.body);
	}

	let restored = false;

	return {
		restore(): void {
			if (restored) return;
			restored = true;
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
