import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import PopoverContentTest from './popover-content-test.svelte';
import PopoverContentControlledCloseTest from './popover-content-controlled-close-test.svelte';
import PopoverContentStandaloneTest from './popover-content-standalone-test.svelte';
import { expectNoFalseFocusAttributes } from '../../test-utils/focus-contract';

describe('Popover.Content', () => {
	// Clean up any portaled content after each test
	afterEach(() => {
		const dialogs = document.querySelectorAll('[role="dialog"]');
		dialogs.forEach((d) => d.remove());
	});

	describe('Visibility', () => {
		it('is hidden by default', async () => {
			render(PopoverContentTest);

			// Popover should not be visible initially
			const dialog = document.querySelector('[role="dialog"]');
			expect(dialog).toBeNull();
		});

		it('opens when trigger is clicked', async () => {
			const screen = render(PopoverContentTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();

			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		});

		it('exposes RAC-style presence data attributes while entering', async () => {
			const screen = render(PopoverContentTest, { class: 'presence-animation' });
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
			expect(dialog.getAttribute('data-state')).toBe('open');
			expect(dialog.getAttribute('data-entering')).toBe('true');
			expect(dialog.getAttribute('data-placement')).toMatch(/^(top|right|bottom|left)$/);

			dialog.dispatchEvent(new AnimationEvent('animationend', { bubbles: true }));
			await expect.poll(() => dialog.getAttribute('data-entering')).toBeNull();
		});

		it('closes when pressing Escape', async () => {
			const screen = render(PopoverContentTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			await userEvent.keyboard('{Escape}');

			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
			await expect.poll(() => trigger.element()?.getAttribute('data-focused')).toBe('true');
			await expect.poll(() => trigger.element()?.getAttribute('data-focus-visible')).toBe('true');
			await expect.poll(() => document.activeElement).toBe(trigger.element());
		});

		it('closes on outside click and marks trigger focused without focus-visible', async () => {
			const screen = render(PopoverContentTest);
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
			const screen = render(PopoverContentTest, { shouldCloseOnEscape: false });
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			await userEvent.keyboard('{Escape}');

			// Small delay then check it's still there
			await new Promise((r) => setTimeout(r, 100));
			const dialog = document.querySelector('[role="dialog"]');
			expect(dialog).toBeTruthy();
		});

		it('allows cancel() to prevent close in standalone mode', async () => {
			render(PopoverContentStandaloneTest);
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			await userEvent.keyboard('{Escape}');
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		});

		it('restores standalone trigger focus attrs by close reason and clears on blur', async () => {
			render(PopoverContentStandaloneTest, { preventClose: false });
			const trigger = document.querySelector('button[type="button"]') as HTMLElement | null;
			expect(trigger).toBeTruthy();

			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			const outside = document.createElement('button');
			document.body.appendChild(outside);
			try {
				await userEvent.keyboard('{Escape}');
				await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
				await expect.poll(() => trigger?.getAttribute('data-focused')).toBe('true');
				await expect.poll(() => trigger?.getAttribute('data-focus-visible')).toBe('true');

				outside.focus();
				await expect.poll(() => trigger?.getAttribute('data-focused')).toBeNull();
				await expect.poll(() => trigger?.getAttribute('data-focus-visible')).toBeNull();
			} finally {
				outside.remove();
			}
		});

		it('never serializes false focus-state attributes', async () => {
			render(PopoverContentStandaloneTest, { preventClose: false });
			expectNoFalseFocusAttributes();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
			expectNoFalseFocusAttributes();

			await userEvent.keyboard('{Escape}');
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
			expectNoFalseFocusAttributes();
		});

		it('keeps the popover mounted while exiting and unmounts after motion ends', async () => {
			const screen = render(PopoverContentTest, { class: 'presence-animation' });
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
			dialog.dispatchEvent(new AnimationEvent('animationend', { bubbles: true }));

			await userEvent.keyboard('{Escape}');
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			const exitingDialog = document.querySelector('[role="dialog"]') as HTMLElement;
			expect(exitingDialog.getAttribute('data-state')).toBe('closed');
			expect(exitingDialog.getAttribute('data-exiting')).toBe('true');
			expect(exitingDialog.getAttribute('aria-hidden')).toBe('true');

			exitingDialog.dispatchEvent(new TransitionEvent('transitionend', { bubbles: true }));
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		});

		it('moves focus back to the trigger before an internally closed popover becomes aria-hidden', async () => {
			const screen = render(PopoverContentControlledCloseTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			const applyButton = screen.getByRole('button', { name: 'Apply' });
			applyButton.element().focus();
			await expect.poll(() => document.activeElement).toBe(applyButton.element());

			await applyButton.click();

			const exitingDialog = document.querySelector('[role="dialog"]') as HTMLElement;
			await expect.poll(() => exitingDialog?.getAttribute('data-exiting')).toBe('true');
			expect(exitingDialog.contains(document.activeElement)).toBe(false);
			expect(exitingDialog.getAttribute('aria-hidden')).toBe('true');

			exitingDialog.dispatchEvent(new TransitionEvent('transitionend', { bubbles: true }));
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		});
	});

	describe('Modal vs Non-Modal', () => {
		it('has aria-modal="true" for modal popovers', async () => {
			const screen = render(PopoverContentTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();
			await expect
				.poll(() => document.querySelector('[role="dialog"]')?.getAttribute('aria-modal'))
				.toBe('true');
		});

		it('has aria-modal="false" for non-modal popovers', async () => {
			const screen = render(PopoverContentTest, { isNonModal: true });
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();
			await expect
				.poll(() => document.querySelector('[role="dialog"]')?.getAttribute('aria-modal'))
				.toBe('false');
		});
	});

	describe('Close on Blur', () => {
		it('shouldCloseOnBlur defaults to false for modal popovers', async () => {
			const screen = render(PopoverContentTest, { isNonModal: false });
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			// Tab to an element outside - should NOT close for modal
			await userEvent.keyboard('{Tab}');
			await new Promise((r) => setTimeout(r, 100));

			// Modal popover traps focus, so it should still be open
			const dialog = document.querySelector('[role="dialog"]');
			expect(dialog).toBeTruthy();
		});

		it('shouldCloseOnBlur defaults to true for non-modal popovers', async () => {
			// Create an external button to focus on
			const externalButton = document.createElement('button');
			externalButton.textContent = 'External Button';
			document.body.appendChild(externalButton);

			try {
				const screen = render(PopoverContentTest, { isNonModal: true });
				const trigger = screen.getByRole('button', { name: 'Open Popover' });

				await trigger.click();
				await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

				// Focus the external button to trigger blur
				externalButton.focus();

				// Non-modal with shouldCloseOnBlur should close
				await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
				await expect.poll(() => document.activeElement).toBe(trigger.element());
			} finally {
				externalButton.remove();
			}
		});
	});

	describe('Positioning', () => {
		it('is positioned with fixed positioning', async () => {
			const screen = render(PopoverContentTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
			const style = window.getComputedStyle(dialog);

			expect(style.position).toBe('fixed');
		});

		it('has z-index for stacking', async () => {
			const screen = render(PopoverContentTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
			const style = window.getComputedStyle(dialog);

			expect(parseInt(style.zIndex)).toBeGreaterThan(0);
		});
	});

	describe('CSS Custom Properties', () => {
		it('exposes --trigger-width matching the trigger width', async () => {
			const screen = render(PopoverContentTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			// Get trigger width before clicking
			const triggerElement = trigger.element() as HTMLElement;
			const triggerWidth = triggerElement.offsetWidth;

			await trigger.click();

			// Wait for the popover to appear and CSS vars to be applied
			// Use approximate matching due to floating point precision
			await expect
				.poll(
					() => {
						const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
						if (!dialog) return false;
						const triggerWidthValue = dialog.style.getPropertyValue('--trigger-width');
						if (!triggerWidthValue) return false;
						const value = parseFloat(triggerWidthValue);
						return Math.abs(value - triggerWidth) < 1; // Within 1px tolerance
					},
					{ timeout: 2000 }
				)
				.toBe(true);
		});

		it('exposes --trigger-height matching the trigger height', async () => {
			const screen = render(PopoverContentTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			const triggerElement = trigger.element() as HTMLElement;
			const triggerHeight = triggerElement.offsetHeight;

			await trigger.click();

			await expect
				.poll(
					() => {
						const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
						if (!dialog) return null;
						return dialog.style.getPropertyValue('--trigger-height');
					},
					{ timeout: 2000 }
				)
				.toBe(`${triggerHeight}px`);
		});

		it('exposes --available-width as a positive pixel value', async () => {
			const screen = render(PopoverContentTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();

			await expect
				.poll(
					() => {
						const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
						if (!dialog) return null;
						const value = dialog.style.getPropertyValue('--available-width');
						return value && value.match(/^\d+(\.\d+)?px$/) && parseFloat(value) > 0;
					},
					{ timeout: 2000 }
				)
				.toBe(true);
		});

		it('exposes --available-height as a positive pixel value', async () => {
			const screen = render(PopoverContentTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();

			await expect
				.poll(
					() => {
						const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
						if (!dialog) return null;
						const value = dialog.style.getPropertyValue('--available-height');
						return value && value.match(/^\d+(\.\d+)?px$/) && parseFloat(value) > 0;
					},
					{ timeout: 2000 }
				)
				.toBe(true);
		});

		it('applies max-height based on the available viewport space', async () => {
			const screen = render(PopoverContentTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();

			await expect
				.poll(
					() => {
						const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
						if (!dialog) return null;

						const availableHeight = dialog.style.getPropertyValue('--available-height');
						return dialog.style.maxHeight && dialog.style.maxHeight === availableHeight
							? dialog.style.maxHeight
							: null;
					},
					{ timeout: 2000 }
				)
				.toMatch(/^\d+(\.\d+)?px$/);
		});

		it('exposes --transform-origin for animations', async () => {
			const screen = render(PopoverContentTest);
			const trigger = screen.getByRole('button', { name: 'Open Popover' });

			await trigger.click();

			await expect
				.poll(
					() => {
						const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
						if (!dialog) return null;
						const value = dialog.style.getPropertyValue('--transform-origin');
						return (
							value &&
							value.match(/^(center|left|right|top|bottom)\s+(center|top|bottom|left|right)$/)
						);
					},
					{ timeout: 2000 }
				)
				.toBeTruthy();
		});
	});
});
