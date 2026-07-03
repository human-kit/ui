import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import DialogTest from '../root/dialog-test.svelte';

describe('Dialog.Trigger', () => {
	function cleanupDialogTestDom() {
		const dialogs = document.querySelectorAll('[role="dialog"]');
		dialogs.forEach((d) => d.remove());
		const overlays = document.querySelectorAll('[data-dialog-overlay]');
		overlays.forEach((o) => o.remove());
		document.body.style.overflow = '';
		document.body
			.querySelectorAll('[inert]')
			.forEach((element) => element.removeAttribute('inert'));
		document.body
			.querySelectorAll('[aria-hidden="true"]')
			.forEach((element) => element.removeAttribute('aria-hidden'));
	}

	beforeEach(() => {
		document.body.replaceChildren();
		cleanupDialogTestDom();
	});

	afterEach(cleanupDialogTestDom);

	describe('Accessibility', () => {
		it('trigger button has aria-haspopup="dialog"', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await expect.element(trigger).toHaveAttribute('aria-haspopup', 'dialog');
			expect(trigger.element()?.getAttribute('data-dialog-trigger')).toBe('true');
			expect(trigger.element()?.querySelector('button')).toBeNull();
		});

		it('trigger has aria-expanded="false" when closed', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
		});

		it('trigger has aria-expanded="true" when open', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			// Get trigger directly from DOM since it may be in an inert container
			const triggerEl = document.querySelector('button[aria-haspopup="dialog"]');
			expect(triggerEl?.getAttribute('aria-expanded')).toBe('true');
		});
	});

	describe('Interaction', () => {
		it('toggles dialog on click', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			// Initially closed
			expect(document.querySelector('[role="dialog"]')).toBeNull();

			// Click to open
			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			// Get trigger from DOM (may be inert now)
			const triggerEl = document.querySelector('button[aria-haspopup="dialog"]') as HTMLElement;

			// Click again to close - need to use native click since element is inert
			triggerEl.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		});

		it('opens on Enter key when trigger is focused', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.element().focus();
			await userEvent.keyboard('{Enter}');

			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		});

		it('opens on Space key when trigger is focused', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.element().focus();
			await userEvent.keyboard(' ');

			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		});
	});

	describe('Controlled Mode', () => {
		it('trigger reflects controlled open state', async () => {
			render(DialogTest, { open: true });
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			const trigger = document.querySelector('button[aria-haspopup="dialog"]');
			expect(trigger?.getAttribute('aria-expanded')).toBe('true');
		});

		it('triggers onOpenChange when clicked', async () => {
			const { vi } = await import('vitest');
			const onOpenChangeMock = vi.fn();

			const screen = render(DialogTest, { onOpenChange: onOpenChangeMock });
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.click();
			expect(onOpenChangeMock).toHaveBeenCalledWith(true);
		});
	});

	describe('Default Open State', () => {
		it('respects defaultOpen prop', async () => {
			render(DialogTest, { defaultOpen: true });
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			const trigger = document.querySelector('button[aria-haspopup="dialog"]');
			expect(trigger?.getAttribute('aria-expanded')).toBe('true');
		});
	});
});
