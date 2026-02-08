import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import PopoverTest from '../root/popover-test.svelte';
import PopoverTriggerInDialogTest from './popover-trigger-in-dialog-test.svelte';

describe('Popover.Trigger', () => {
	// Clean up any portaled content after each test
	afterEach(() => {
		const dialogs = document.querySelectorAll('[role="dialog"]');
		dialogs.forEach((d) => d.remove());
	});

	describe('Accessibility', () => {
		it('trigger button has aria-haspopup="dialog"', async () => {
			const screen = render(PopoverTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await expect.element(trigger).toHaveAttribute('aria-haspopup', 'dialog');
		});

		it('trigger has aria-expanded="false" when closed', async () => {
			const screen = render(PopoverTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
		});

		it('trigger has aria-expanded="true" when open', async () => {
			const screen = render(PopoverTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			// Get trigger directly from DOM since it may be in an inert container
			const triggerEl = document.querySelector('button[aria-haspopup="dialog"]');
			expect(triggerEl?.getAttribute('aria-expanded')).toBe('true');
		});
	});

	describe('Interaction', () => {
		it('toggles popover on click', async () => {
			const screen = render(PopoverTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

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
			const screen = render(PopoverTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.element().focus();
			await userEvent.keyboard('{Enter}');

			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		});

		it('opens on Space key when trigger is focused', async () => {
			const screen = render(PopoverTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.element().focus();
			await userEvent.keyboard(' ');

			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		});

		it('opens when used inside Dialog content', async () => {
			const screen = render(PopoverTriggerInDialogTest);
			const openDialog = screen.getByRole('button', { name: 'Open Dialog' });

			await openDialog.click();
			await expect.poll(() => document.querySelector('[data-dialog-content]')).toBeTruthy();

			const nestedTrigger = Array.from(document.querySelectorAll('button')).find(
				(button) => button.textContent?.trim() === 'Open Nested Popover'
			) as HTMLButtonElement | undefined;

			expect(nestedTrigger).toBeTruthy();
			nestedTrigger?.click();

			await expect.poll(() => document.querySelector('.nested-popover-content')).toBeTruthy();
			expect(document.querySelector('.nested-popover-content')?.textContent).toContain(
				'Nested popover content'
			);
		});
	});

	describe('Controlled Mode', () => {
		it('trigger reflects controlled open state', async () => {
			render(PopoverTest, { open: true });
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			const trigger = document.querySelector('button[aria-haspopup="dialog"]');
			expect(trigger?.getAttribute('aria-expanded')).toBe('true');
		});

		it('triggers onOpenChange when clicked', async () => {
			const { vi } = await import('vitest');
			const onOpenChangeMock = vi.fn();

			const screen = render(PopoverTest, { onOpenChange: onOpenChangeMock });
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();
			expect(onOpenChangeMock).toHaveBeenCalledWith(true);
		});
	});

	describe('Default Open State', () => {
		it('respects defaultOpen prop', async () => {
			render(PopoverTest, { defaultOpen: true });
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			const trigger = document.querySelector('button[aria-haspopup="dialog"]');
			expect(trigger?.getAttribute('aria-expanded')).toBe('true');
		});
	});
});
