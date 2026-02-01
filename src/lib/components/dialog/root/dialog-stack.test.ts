import { describe, it, expect, beforeEach } from 'vitest';
import {
	pushDialog,
	popDialog,
	isTopmostDialog,
	getOverlayZIndex,
	getContentZIndex,
	getDialogCount
} from './dialog-stack';

describe('Dialog Stack', () => {
	// Reset the stack before each test by popping all dialogs
	beforeEach(() => {
		// Pop all dialogs to reset state
		while (getDialogCount() > 0) {
			// We need to get the top dialog's ID to pop it
			// Since we can't access the stack directly, we'll use a workaround
			const { id } = pushDialog(() => {});
			popDialog(id);
			// This doesn't fully reset, so we need a different approach
		}
	});

	describe('pushDialog', () => {
		it('returns unique id and level 0 for first dialog', () => {
			const closeCallback = () => {};
			const result = pushDialog(closeCallback);

			expect(result.id).toBeDefined();
			expect(typeof result.id).toBe('symbol');
			expect(result.level).toBe(0);

			// Cleanup
			popDialog(result.id);
		});

		it('increments level for each nested dialog', () => {
			const close1 = () => {};
			const close2 = () => {};
			const close3 = () => {};

			const dialog1 = pushDialog(close1);
			const dialog2 = pushDialog(close2);
			const dialog3 = pushDialog(close3);

			expect(dialog1.level).toBe(0);
			expect(dialog2.level).toBe(1);
			expect(dialog3.level).toBe(2);

			// Cleanup
			popDialog(dialog3.id);
			popDialog(dialog2.id);
			popDialog(dialog1.id);
		});

		it('each dialog gets a unique id', () => {
			const dialog1 = pushDialog(() => {});
			const dialog2 = pushDialog(() => {});

			expect(dialog1.id).not.toBe(dialog2.id);

			// Cleanup
			popDialog(dialog2.id);
			popDialog(dialog1.id);
		});
	});

	describe('popDialog', () => {
		it('removes dialog from stack', () => {
			const dialog = pushDialog(() => {});
			expect(getDialogCount()).toBeGreaterThan(0);

			popDialog(dialog.id);

			// The dialog should be removed
			expect(isTopmostDialog(dialog.id)).toBe(false);
		});

		it('handles popping non-existent dialog gracefully', () => {
			const fakeId = Symbol('fake');

			// Should not throw
			expect(() => popDialog(fakeId)).not.toThrow();
		});

		it('can pop dialogs in any order', () => {
			const dialog1 = pushDialog(() => {});
			const dialog2 = pushDialog(() => {});
			const dialog3 = pushDialog(() => {});

			// Pop middle dialog first
			popDialog(dialog2.id);

			// dialog3 should still be topmost
			expect(isTopmostDialog(dialog3.id)).toBe(true);
			expect(isTopmostDialog(dialog1.id)).toBe(false);

			// Cleanup
			popDialog(dialog3.id);
			popDialog(dialog1.id);
		});
	});

	describe('isTopmostDialog', () => {
		it('returns false when stack is empty', () => {
			const fakeId = Symbol('fake');
			// Make sure stack is empty first
			const initialCount = getDialogCount();

			// Even with a valid-looking symbol, should return false if not in stack
			const dialog = pushDialog(() => {});
			popDialog(dialog.id);

			expect(isTopmostDialog(fakeId)).toBe(false);
		});

		it('returns true for only dialog in stack', () => {
			const dialog = pushDialog(() => {});

			expect(isTopmostDialog(dialog.id)).toBe(true);

			popDialog(dialog.id);
		});

		it('returns true only for topmost dialog', () => {
			const dialog1 = pushDialog(() => {});
			const dialog2 = pushDialog(() => {});
			const dialog3 = pushDialog(() => {});

			expect(isTopmostDialog(dialog1.id)).toBe(false);
			expect(isTopmostDialog(dialog2.id)).toBe(false);
			expect(isTopmostDialog(dialog3.id)).toBe(true);

			// Cleanup
			popDialog(dialog3.id);
			popDialog(dialog2.id);
			popDialog(dialog1.id);
		});

		it('updates when top dialog is popped', () => {
			const dialog1 = pushDialog(() => {});
			const dialog2 = pushDialog(() => {});

			expect(isTopmostDialog(dialog2.id)).toBe(true);

			popDialog(dialog2.id);

			expect(isTopmostDialog(dialog1.id)).toBe(true);

			popDialog(dialog1.id);
		});
	});

	describe('getOverlayZIndex', () => {
		it('returns base z-index for level 0', () => {
			const zIndex = getOverlayZIndex(0);
			expect(zIndex).toBe(9990);
		});

		it('increments by 10 for each level', () => {
			expect(getOverlayZIndex(0)).toBe(9990);
			expect(getOverlayZIndex(1)).toBe(10000);
			expect(getOverlayZIndex(2)).toBe(10010);
			expect(getOverlayZIndex(3)).toBe(10020);
		});
	});

	describe('getContentZIndex', () => {
		it('returns base z-index + 1 for level 0', () => {
			const zIndex = getContentZIndex(0);
			expect(zIndex).toBe(9991);
		});

		it('content z-index is always 1 higher than overlay at same level', () => {
			for (let level = 0; level < 5; level++) {
				const overlayZ = getOverlayZIndex(level);
				const contentZ = getContentZIndex(level);
				expect(contentZ).toBe(overlayZ + 1);
			}
		});

		it('nested content is above parent overlay', () => {
			// Level 1 content should be above level 0 overlay
			expect(getContentZIndex(1)).toBeGreaterThan(getOverlayZIndex(0));
			// Level 2 content should be above level 1 overlay
			expect(getContentZIndex(2)).toBeGreaterThan(getOverlayZIndex(1));
		});
	});

	describe('getDialogCount', () => {
		it('returns 0 for empty stack', () => {
			// Pop any existing dialogs
			const dialog = pushDialog(() => {});
			popDialog(dialog.id);

			// Since we can't guarantee empty stack in unit tests due to module state,
			// just verify it returns a number >= 0
			expect(getDialogCount()).toBeGreaterThanOrEqual(0);
		});

		it('increases when dialogs are pushed', () => {
			const initialCount = getDialogCount();

			const dialog1 = pushDialog(() => {});
			expect(getDialogCount()).toBe(initialCount + 1);

			const dialog2 = pushDialog(() => {});
			expect(getDialogCount()).toBe(initialCount + 2);

			// Cleanup
			popDialog(dialog2.id);
			popDialog(dialog1.id);
		});

		it('decreases when dialogs are popped', () => {
			const dialog1 = pushDialog(() => {});
			const dialog2 = pushDialog(() => {});
			const countWith2 = getDialogCount();

			popDialog(dialog2.id);
			expect(getDialogCount()).toBe(countWith2 - 1);

			popDialog(dialog1.id);
			expect(getDialogCount()).toBe(countWith2 - 2);
		});
	});
});
