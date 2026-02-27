import { expect } from 'vitest';

export function expectFocusVisibleImpliesFocusWithin(root: HTMLElement | null) {
	expect(root).toBeTruthy();
	const focusVisible = root?.getAttribute('data-focus-visible');
	const focusWithin = root?.getAttribute('data-focus-within');
	if (focusVisible === 'true') {
		expect(focusWithin).toBe('true');
	}
}

export function expectFocusVisibleImpliesFocused(node: HTMLElement | null) {
	expect(node).toBeTruthy();
	const focusVisible = node?.getAttribute('data-focus-visible');
	const focused = node?.getAttribute('data-focused');
	if (focusVisible === 'true') {
		expect(focused).toBe('true');
	}
}

export function expectNoFalseFocusAttributes(scope: ParentNode = document) {
	const focusAttrs = ['data-focused', 'data-focus-visible', 'data-focus-within'];
	for (const attr of focusAttrs) {
		const nodes = Array.from(scope.querySelectorAll<HTMLElement>(`[${attr}]`));
		for (const node of nodes) {
			expect(node.getAttribute(attr)).not.toBe('false');
		}
	}
}
