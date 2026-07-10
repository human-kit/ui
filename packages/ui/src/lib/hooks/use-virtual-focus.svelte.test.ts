import { describe, it, expect } from 'vitest';
import { useVirtualFocus } from './use-virtual-focus.svelte';

function flushMicrotasks() {
	return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

describe('useVirtualFocus', () => {
	describe('pendingFocusDirection', () => {
		it("focuses the first registered item and consumes 'first' immediately", () => {
			const nav = useVirtualFocus({ instanceId: 'vf-first' });

			nav.setPendingDirection('first');
			nav.register('a', 'A');
			nav.register('b', 'B');

			expect(nav.focusedId).toBe('a');
			expect(nav.pendingFocusDirection).toBe(null);
		});

		it("keeps following registrations within the batch for 'last', then consumes it", async () => {
			const nav = useVirtualFocus({ instanceId: 'vf-last' });

			nav.setPendingDirection('last');
			nav.register('a', 'A');
			nav.register('b', 'B');
			expect(nav.focusedId).toBe('b');

			await flushMicrotasks();
			expect(nav.pendingFocusDirection).toBe(null);

			// A later registration (e.g. items re-filtering while typing) must not
			// steal the virtual focus once the direction was consumed.
			nav.register('c', 'C');
			expect(nav.focusedId).toBe('b');
		});

		it('is cleared when focus is set externally before any registration', () => {
			const nav = useVirtualFocus({ instanceId: 'vf-clear' });

			nav.setPendingDirection('last');
			nav.setFocused(null);
			expect(nav.pendingFocusDirection).toBe(null);

			nav.register('a', 'A');
			expect(nav.focusedId).toBe(null);
		});

		it('applies immediately when items are already registered', () => {
			const nav = useVirtualFocus({ instanceId: 'vf-immediate' });

			nav.register('a', 'A');
			nav.register('b', 'B');

			nav.setPendingDirection('first');
			expect(nav.focusedId).toBe('a');
			expect(nav.pendingFocusDirection).toBe(null);

			nav.setPendingDirection('last');
			expect(nav.focusedId).toBe('b');
			expect(nav.pendingFocusDirection).toBe(null);
		});
	});

	describe('registration', () => {
		it('registers items and exposes their labels', () => {
			const nav = useVirtualFocus({ instanceId: 'vf-register' });

			nav.register('a', 'A');
			nav.register('b', 'B');

			expect(nav.itemIds).toEqual(['a', 'b']);
			expect(nav.itemLabels.get('a')).toBe('A');
			expect(nav.itemLabels.get('b')).toBe('B');
		});

		it('clears the focus when the focused item unregisters', () => {
			const nav = useVirtualFocus({ instanceId: 'vf-unregister' });

			nav.register('a', 'A');
			nav.register('b', 'B');
			nav.setFocused('a');

			nav.unregister('a');
			expect(nav.itemIds).toEqual(['b']);
			expect(nav.focusedId).toBe(null);
		});
	});

	describe('navigation', () => {
		it('moves the focus with next/previous and clamps at the edges', () => {
			const nav = useVirtualFocus({ instanceId: 'vf-nav' });

			nav.register('a', 'A');
			nav.register('b', 'B');

			nav.next();
			expect(nav.focusedId).toBe('a');
			nav.next();
			expect(nav.focusedId).toBe('b');
			nav.next();
			expect(nav.focusedId).toBe('b');

			nav.previous();
			expect(nav.focusedId).toBe('a');
			nav.previous();
			expect(nav.focusedId).toBe('a');
		});
	});
});
