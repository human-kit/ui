import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import PopoverTest from './popover-test.svelte';
import { expectNoFalseFocusAttributes } from '../../test-utils/focus-contract';

describe('Popover', () => {
	// Clean up any portaled content after each test
	afterEach(() => {
		const dialogs = document.querySelectorAll('[role="dialog"]');
		dialogs.forEach((d) => d.remove());
	});

	describe('Visibility', () => {
		it('is hidden by default', async () => {
			render(PopoverTest);

			// Popover should not be visible initially
			const dialog = document.querySelector('[role="dialog"]');
			expect(dialog).toBeNull();
		});

		it('opens when clicking the trigger', async () => {
			const screen = render(PopoverTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();

			// Use expect.poll for Portal content
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		});

		it('closes when pressing Escape', async () => {
			const screen = render(PopoverTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			// Open popover
			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			// Press Escape
			await userEvent.keyboard('{Escape}');

			// Wait for popover to close
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
			await expect.poll(() => trigger.element()?.getAttribute('data-focused')).toBe('true');
			await expect.poll(() => trigger.element()?.getAttribute('data-focus-visible')).toBe('true');
			await expect.poll(() => document.activeElement).toBe(trigger.element());
		});

		it('closes on outside click and marks trigger as focused only', async () => {
			const screen = render(PopoverTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });
			const outside = document.createElement('button');
			document.body.appendChild(outside);

			try {
				await trigger.click();
				await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

				outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));

				await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
				await expect.poll(() => trigger.element()?.getAttribute('data-focused')).toBe('true');
				expect(trigger.element()?.getAttribute('data-focus-visible')).toBeNull();
				await expect.poll(() => document.activeElement).toBe(trigger.element());
			} finally {
				outside.remove();
			}
		});

		it('respects shouldCloseOnEscape=false', async () => {
			const screen = render(PopoverTest, { shouldCloseOnEscape: false });
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			// Open popover
			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			// Press Escape - should NOT close
			await userEvent.keyboard('{Escape}');

			// Small delay then check it's still there
			await new Promise((r) => setTimeout(r, 100));
			const dialog = document.querySelector('[role="dialog"]');
			expect(dialog).toBeTruthy();
		});

		it('closes on blur in non-modal mode and restores focus to trigger', async () => {
			const externalButton = document.createElement('button');
			externalButton.textContent = 'External Button';
			document.body.appendChild(externalButton);

			try {
				const screen = render(PopoverTest, { nonModal: true });
				const trigger = screen.getByRole('button', { name: 'Open Popover' });

				await trigger.click();
				await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

				externalButton.focus();

				await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
				await expect.poll(() => document.activeElement).toBe(trigger.element());
			} finally {
				externalButton.remove();
			}
		});

		it('cleans transient trigger focus attrs on blur after restore', async () => {
			const screen = render(PopoverTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });
			const outside = document.createElement('button');
			document.body.appendChild(outside);

			try {
				await trigger.click();
				await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

				await userEvent.keyboard('{Escape}');
				await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
				await expect.poll(() => trigger.element()?.getAttribute('data-focused')).toBe('true');
				await expect.poll(() => trigger.element()?.getAttribute('data-focus-visible')).toBe('true');

				outside.focus();

				await expect.poll(() => trigger.element()?.getAttribute('data-focused')).toBeNull();
				await expect.poll(() => trigger.element()?.getAttribute('data-focus-visible')).toBeNull();
			} finally {
				outside.remove();
			}
		});

		it('never serializes false focus-state attributes', async () => {
			const screen = render(PopoverTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			expectNoFalseFocusAttributes();

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
			expectNoFalseFocusAttributes();

			await userEvent.keyboard('{Escape}');
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
			expectNoFalseFocusAttributes();
		});
	});

	describe('Accessibility', () => {
		it('has role="dialog"', async () => {
			const screen = render(PopoverTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		});

		it('has aria-modal="true" for modal popovers', async () => {
			const screen = render(PopoverTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();
			await expect
				.poll(() => document.querySelector('[role="dialog"]')?.getAttribute('aria-modal'))
				.toBe('true');
		});

		it('has aria-modal="false" for non-modal popovers', async () => {
			const screen = render(PopoverTest, { nonModal: true });
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();
			await expect
				.poll(() => document.querySelector('[role="dialog"]')?.getAttribute('aria-modal'))
				.toBe('false');
		});

		it('returns focus to trigger when closed', async () => {
			const screen = render(PopoverTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			// Open popover
			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			// Press Escape to close
			await userEvent.keyboard('{Escape}');
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();

			// Focus should return to trigger - use document.activeElement since trigger may be the same element
			await expect.poll(() => document.activeElement?.textContent).toContain('Open Popover');
		});
	});

	describe('Controlled Mode', () => {
		it('respects controlled open prop', async () => {
			render(PopoverTest, { open: true });

			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		});

		it('calls onOpenChange callback', async () => {
			const { vi } = await import('vitest');
			const onOpenChangeMock = vi.fn();

			const screen = render(PopoverTest, { onOpenChange: onOpenChangeMock });
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();

			expect(onOpenChangeMock).toHaveBeenCalledWith(
				true,
				expect.objectContaining({ reason: 'trigger-press' })
			);

			await userEvent.keyboard('{Escape}');
			expect(onOpenChangeMock).toHaveBeenLastCalledWith(
				false,
				expect.objectContaining({ reason: 'escape-key' })
			);
		});

		it('allows cancel() to prevent opening while uncontrolled', async () => {
			const screen = render(PopoverTest, {
				onOpenChange: (nextOpen, details) => {
					if (nextOpen) details.cancel();
				}
			});
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		});
	});

	describe('Positioning', () => {
		it('is positioned near the trigger', async () => {
			const screen = render(PopoverTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
			const dialogRect = dialog.getBoundingClientRect();

			// Dialog should be positioned (has some position)
			expect(dialogRect.top).toBeGreaterThan(0);
		});
	});
});
