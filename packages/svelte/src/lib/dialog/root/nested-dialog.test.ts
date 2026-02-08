import { describe, it, expect, afterEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import NestedDialogTest from './nested-dialog-test.svelte';

describe('Nested Dialogs', () => {
	// Clean up any portaled content after each test
	afterEach(() => {
		const dialogs = document.querySelectorAll('[role="dialog"]');
		dialogs.forEach((d) => d.remove());
		const overlays = document.querySelectorAll('[data-dialog-overlay]');
		overlays.forEach((o) => o.remove());
	});

	describe('Opening nested dialogs', () => {
		it('can open first dialog', async () => {
			const screen = render(NestedDialogTest);
			const trigger1 = screen.getByTestId('trigger-1');

			await trigger1.click();

			await expect.poll(() => document.querySelector('[data-testid="content-1"]')).toBeTruthy();
		});

		it('can open second dialog from within first', async () => {
			const screen = render(NestedDialogTest);
			const trigger1 = screen.getByTestId('trigger-1');

			// Open first dialog
			await trigger1.click();
			await expect.poll(() => document.querySelector('[data-testid="content-1"]')).toBeTruthy();

			// Open second dialog
			const trigger2 = document.querySelector('[data-testid="trigger-2"]') as HTMLElement;
			await trigger2.click();

			await expect.poll(() => document.querySelector('[data-testid="content-2"]')).toBeTruthy();
		});

		it('can open all three nested dialogs', async () => {
			const screen = render(NestedDialogTest);
			const trigger1 = screen.getByTestId('trigger-1');

			// Open first dialog
			await trigger1.click();
			await expect.poll(() => document.querySelector('[data-testid="content-1"]')).toBeTruthy();

			// Open second dialog
			const trigger2 = document.querySelector('[data-testid="trigger-2"]') as HTMLElement;
			await trigger2.click();
			await expect.poll(() => document.querySelector('[data-testid="content-2"]')).toBeTruthy();

			// Open third dialog
			const trigger3 = document.querySelector('[data-testid="trigger-3"]') as HTMLElement;
			await trigger3.click();
			await expect.poll(() => document.querySelector('[data-testid="content-3"]')).toBeTruthy();

			// All three should be in the DOM
			expect(document.querySelectorAll('[role="dialog"]').length).toBe(3);
		});
	});

	describe('Escape key handling', () => {
		it('Escape closes only the topmost dialog', async () => {
			const onDialog2Close = vi.fn();
			const onDialog1Close = vi.fn();

			const screen = render(NestedDialogTest, {
				onDialog1Close,
				onDialog2Close
			});

			// Open both dialogs
			await screen.getByTestId('trigger-1').click();
			await expect.poll(() => document.querySelector('[data-testid="content-1"]')).toBeTruthy();

			const trigger2 = document.querySelector('[data-testid="trigger-2"]') as HTMLElement;
			await trigger2.click();
			await expect.poll(() => document.querySelector('[data-testid="content-2"]')).toBeTruthy();

			// Press Escape - should close only dialog 2
			await userEvent.keyboard('{Escape}');

			// Wait for dialog 2 to close
			await expect.poll(() => document.querySelector('[data-testid="content-2"]')).toBeNull();

			// Dialog 1 should still be open
			expect(document.querySelector('[data-testid="content-1"]')).toBeTruthy();
			expect(onDialog2Close).toHaveBeenCalled();
			expect(onDialog1Close).not.toHaveBeenCalled();
		});

		it('second Escape closes the next dialog', async () => {
			const onDialog2Close = vi.fn();
			const onDialog1Close = vi.fn();

			const screen = render(NestedDialogTest, {
				onDialog1Close,
				onDialog2Close
			});

			// Open both dialogs
			await screen.getByTestId('trigger-1').click();
			await expect.poll(() => document.querySelector('[data-testid="content-1"]')).toBeTruthy();

			const trigger2 = document.querySelector('[data-testid="trigger-2"]') as HTMLElement;
			await trigger2.click();
			await expect.poll(() => document.querySelector('[data-testid="content-2"]')).toBeTruthy();

			// First Escape - closes dialog 2
			await userEvent.keyboard('{Escape}');
			await expect.poll(() => document.querySelector('[data-testid="content-2"]')).toBeNull();

			// Second Escape - closes dialog 1
			await userEvent.keyboard('{Escape}');
			await expect.poll(() => document.querySelector('[data-testid="content-1"]')).toBeNull();

			expect(onDialog1Close).toHaveBeenCalled();
		});

		it('Escape closes dialogs one by one with 3 levels', async () => {
			const screen = render(NestedDialogTest);

			// Open all three dialogs
			await screen.getByTestId('trigger-1').click();
			await expect.poll(() => document.querySelector('[data-testid="content-1"]')).toBeTruthy();

			let trigger2 = document.querySelector('[data-testid="trigger-2"]') as HTMLElement;
			await trigger2.click();
			await expect.poll(() => document.querySelector('[data-testid="content-2"]')).toBeTruthy();

			let trigger3 = document.querySelector('[data-testid="trigger-3"]') as HTMLElement;
			await trigger3.click();
			await expect.poll(() => document.querySelector('[data-testid="content-3"]')).toBeTruthy();

			// All three open
			expect(document.querySelectorAll('[role="dialog"]').length).toBe(3);

			// First Escape - closes dialog 3
			await userEvent.keyboard('{Escape}');
			await expect.poll(() => document.querySelector('[data-testid="content-3"]')).toBeNull();
			expect(document.querySelectorAll('[role="dialog"]').length).toBe(2);

			// Second Escape - closes dialog 2
			await userEvent.keyboard('{Escape}');
			await expect.poll(() => document.querySelector('[data-testid="content-2"]')).toBeNull();
			expect(document.querySelectorAll('[role="dialog"]').length).toBe(1);

			// Third Escape - closes dialog 1
			await userEvent.keyboard('{Escape}');
			await expect.poll(() => document.querySelector('[data-testid="content-1"]')).toBeNull();
			expect(document.querySelectorAll('[role="dialog"]').length).toBe(0);
		});
	});

	describe('Z-index layering', () => {
		it('nested dialog overlay is above parent content', async () => {
			const screen = render(NestedDialogTest);

			// Open both dialogs
			await screen.getByTestId('trigger-1').click();
			await expect.poll(() => document.querySelector('[data-testid="content-1"]')).toBeTruthy();

			const trigger2 = document.querySelector('[data-testid="trigger-2"]') as HTMLElement;
			await trigger2.click();
			await expect.poll(() => document.querySelector('[data-testid="content-2"]')).toBeTruthy();

			const overlay1 = document.querySelector('[data-testid="overlay-1"]') as HTMLElement;
			const content1 = document.querySelector('[data-testid="content-1"]') as HTMLElement;
			const overlay2 = document.querySelector('[data-testid="overlay-2"]') as HTMLElement;
			const content2 = document.querySelector('[data-testid="content-2"]') as HTMLElement;

			const z1Overlay = parseInt(overlay1.style.zIndex);
			const z1Content = parseInt(content1.style.zIndex);
			const z2Overlay = parseInt(overlay2.style.zIndex);
			const z2Content = parseInt(content2.style.zIndex);

			// Overlay 2 should be above content 1
			expect(z2Overlay).toBeGreaterThan(z1Content);
			// Content 2 should be above overlay 2
			expect(z2Content).toBeGreaterThan(z2Overlay);
		});

		it('each level has increasing z-index', async () => {
			const screen = render(NestedDialogTest);

			// Open all three dialogs
			await screen.getByTestId('trigger-1').click();
			await expect.poll(() => document.querySelector('[data-testid="content-1"]')).toBeTruthy();

			let trigger2 = document.querySelector('[data-testid="trigger-2"]') as HTMLElement;
			await trigger2.click();
			await expect.poll(() => document.querySelector('[data-testid="content-2"]')).toBeTruthy();

			let trigger3 = document.querySelector('[data-testid="trigger-3"]') as HTMLElement;
			await trigger3.click();
			await expect.poll(() => document.querySelector('[data-testid="content-3"]')).toBeTruthy();

			const content1 = document.querySelector('[data-testid="content-1"]') as HTMLElement;
			const content2 = document.querySelector('[data-testid="content-2"]') as HTMLElement;
			const content3 = document.querySelector('[data-testid="content-3"]') as HTMLElement;

			const z1 = parseInt(content1.style.zIndex);
			const z2 = parseInt(content2.style.zIndex);
			const z3 = parseInt(content3.style.zIndex);

			expect(z2).toBeGreaterThan(z1);
			expect(z3).toBeGreaterThan(z2);
		});
	});

	describe('Click outside handling', () => {
		it('clicking outside nested dialog closes only that dialog', async () => {
			const onDialog2Close = vi.fn();
			const onDialog1Close = vi.fn();

			const screen = render(NestedDialogTest, {
				onDialog1Close,
				onDialog2Close
			});

			// Open both dialogs
			await screen.getByTestId('trigger-1').click();
			await expect.poll(() => document.querySelector('[data-testid="content-1"]')).toBeTruthy();

			const trigger2 = document.querySelector('[data-testid="trigger-2"]') as HTMLElement;
			await trigger2.click();
			await expect.poll(() => document.querySelector('[data-testid="content-2"]')).toBeTruthy();

			// Click outside dialog 2 (on body)
			document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

			// Wait for dialog 2 to close
			await expect.poll(() => document.querySelector('[data-testid="content-2"]')).toBeNull();

			// Dialog 1 should still be open
			expect(document.querySelector('[data-testid="content-1"]')).toBeTruthy();
		});
	});

	describe('Close button handling', () => {
		it('close button of nested dialog only closes that dialog', async () => {
			const screen = render(NestedDialogTest);

			// Open both dialogs
			await screen.getByTestId('trigger-1').click();
			await expect.poll(() => document.querySelector('[data-testid="content-1"]')).toBeTruthy();

			const trigger2 = document.querySelector('[data-testid="trigger-2"]') as HTMLElement;
			await trigger2.click();
			await expect.poll(() => document.querySelector('[data-testid="content-2"]')).toBeTruthy();

			// Click close button of dialog 2
			const closeBtn2 = document.querySelector('[data-testid="close-2"]') as HTMLElement;
			await closeBtn2.click();

			// Wait for dialog 2 to close
			await expect.poll(() => document.querySelector('[data-testid="content-2"]')).toBeNull();

			// Dialog 1 should still be open
			expect(document.querySelector('[data-testid="content-1"]')).toBeTruthy();
		});
	});
});
