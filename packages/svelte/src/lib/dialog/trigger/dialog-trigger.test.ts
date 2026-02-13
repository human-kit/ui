import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import DialogTest from '../root/dialog-test.svelte';
import DialogTriggerMultiButtonTest from './dialog-trigger-multi-button-test.svelte';

describe('Dialog.Trigger', () => {
	// Clean up any portaled content after each test
	afterEach(() => {
		const dialogs = document.querySelectorAll('[role="dialog"]');
		dialogs.forEach((d) => d.remove());
		const overlays = document.querySelectorAll('[data-dialog-overlay]');
		overlays.forEach((o) => o.remove());
	});

	describe('Accessibility', () => {
		it('trigger button has aria-haspopup="dialog"', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await expect.element(trigger).toHaveAttribute('aria-haspopup', 'dialog');
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

		it('uses the clicked button as the active trigger when multiple trigger buttons are present', async () => {
			const screen = render(DialogTriggerMultiButtonTest);
			const secondTrigger = screen.getByRole('button', { name: 'Second Dialog Trigger' });

			await secondTrigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
			const firstButton = Array.from(document.querySelectorAll('button')).find(
				(button) => button.textContent?.trim() === 'First Dialog Trigger'
			);
			const secondButton = Array.from(document.querySelectorAll('button')).find(
				(button) => button.textContent?.trim() === 'Second Dialog Trigger'
			);

			expect(secondButton?.getAttribute('aria-expanded')).toBe('true');
			expect(secondButton?.getAttribute('aria-haspopup')).toBe('dialog');
			expect(firstButton?.getAttribute('aria-expanded')).toBe('false');

			await userEvent.keyboard('{Escape}');
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
			const secondButtonAfterClose = Array.from(document.querySelectorAll('button')).find(
				(button) => button.textContent?.trim() === 'Second Dialog Trigger'
			);
			expect(secondButtonAfterClose?.getAttribute('aria-expanded')).toBe('false');
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
