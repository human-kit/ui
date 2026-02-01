import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DialogTest from '../root/dialog-test.svelte';

describe('Dialog.Overlay', () => {
	// Clean up any portaled content after each test
	afterEach(() => {
		const dialogs = document.querySelectorAll('[role="dialog"]');
		dialogs.forEach((d) => d.remove());
		const overlays = document.querySelectorAll('[data-dialog-overlay]');
		overlays.forEach((o) => o.remove());
	});

	describe('Visibility', () => {
		it('is not visible when dialog is closed', async () => {
			render(DialogTest);

			const overlay = document.querySelector('[data-dialog-overlay]');
			expect(overlay).toBeNull();
		});

		it('is visible when dialog is open', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[data-dialog-overlay]')).toBeTruthy();
		});

		it('disappears when dialog is closed', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			// Open
			await trigger.click();
			await expect.poll(() => document.querySelector('[data-dialog-overlay]')).toBeTruthy();

			// Close via snippet close function
			const closeBtn = document.querySelector('.close-btn') as HTMLElement;
			closeBtn.click();

			await expect.poll(() => document.querySelector('[data-dialog-overlay]')).toBeNull();
		});
	});

	describe('Styling', () => {
		it('has fixed positioning', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[data-dialog-overlay]')).toBeTruthy();

			const overlay = document.querySelector('[data-dialog-overlay]') as HTMLElement;
			const style = window.getComputedStyle(overlay);

			expect(style.position).toBe('fixed');
		});

		it('covers the full viewport with inset: 0', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[data-dialog-overlay]')).toBeTruthy();

			const overlay = document.querySelector('[data-dialog-overlay]') as HTMLElement;
			const style = window.getComputedStyle(overlay);

			expect(style.inset).toBe('0px');
		});

		it('has lower z-index than content', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[data-dialog-overlay]')).toBeTruthy();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			const overlay = document.querySelector('[data-dialog-overlay]') as HTMLElement;
			const content = document.querySelector('[role="dialog"]') as HTMLElement;

			const overlayZIndex = parseInt(window.getComputedStyle(overlay).zIndex);
			const contentZIndex = parseInt(window.getComputedStyle(content).zIndex);

			expect(overlayZIndex).toBeLessThan(contentZIndex);
		});

		it('has semi-transparent background', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[data-dialog-overlay]')).toBeTruthy();

			const overlay = document.querySelector('[data-dialog-overlay]') as HTMLElement;
			const style = window.getComputedStyle(overlay);

			// Background should have some alpha value (not fully opaque or transparent)
			expect(style.backgroundColor).toContain('rgba');
		});
	});
});
