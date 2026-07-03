import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import DialogTest from '../root/dialog-test.svelte';
import DialogWithComboboxTest from '../root/dialog-with-combobox-test.svelte';

describe('Dialog.Content', () => {
	// Clean up any portaled content after each test
	afterEach(() => {
		const dialogs = document.querySelectorAll('[role="dialog"]');
		dialogs.forEach((d) => d.remove());
		const overlays = document.querySelectorAll('[data-dialog-overlay]');
		overlays.forEach((o) => o.remove());
	});

	describe('Visibility', () => {
		it('is hidden by default', async () => {
			render(DialogTest);

			// Dialog should not be visible initially
			const dialog = document.querySelector('[role="dialog"]');
			expect(dialog).toBeNull();
		});

		it('opens when trigger is clicked', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.click();

			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		});

		it('closes when pressing Escape', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			await userEvent.keyboard('{Escape}');

			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		});

		it('respects shouldCloseOnEscape=false', async () => {
			const screen = render(DialogTest, { shouldCloseOnEscape: false });
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			await userEvent.keyboard('{Escape}');

			// Small delay then check it's still there
			await new Promise((r) => setTimeout(r, 100));
			const dialog = document.querySelector('[role="dialog"]');
			expect(dialog).toBeTruthy();
		});
	});

	describe('Accessibility', () => {
		it('has role="dialog"', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		});

		it('has aria-modal="true"', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.click();
			await expect
				.poll(() => document.querySelector('[role="dialog"]')?.getAttribute('aria-modal'))
				.toBe('true');
		});

		it('has data-dialog-content attribute', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[data-dialog-content]')).toBeTruthy();
		});
	});

	describe('Focus Management', () => {
		it('traps focus within the dialog', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			// Tab should stay within dialog (focus trap)
			await userEvent.keyboard('{Tab}');
			await new Promise((r) => setTimeout(r, 100));

			// Focus should still be within the dialog
			const dialog = document.querySelector('[role="dialog"]');
			expect(dialog?.contains(document.activeElement)).toBe(true);
		});

		it('returns focus to trigger when closed', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			await userEvent.keyboard('{Escape}');
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();

			// Focus should return to trigger
			await expect.poll(() => document.activeElement?.textContent).toContain('Open Dialog');
		});
	});

	describe('Positioning', () => {
		it('places the panel inside a fixed positioning layer', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			const positioner = document.querySelector('[data-dialog-positioner]') as HTMLElement;
			expect(positioner).toBeTruthy();
			expect(positioner.contains(document.querySelector('[role="dialog"]'))).toBe(true);
			expect(window.getComputedStyle(positioner).position).toBe('fixed');
		});

		it('centers the panel via grid, leaving the panel transform free for animations', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
			const positioner = dialog.parentElement as HTMLElement;
			const positionerStyle = window.getComputedStyle(positioner);

			// Centering lives on the layer (grid), not as a transform on the panel — so zoom/slide
			// enter/exit animations don't fight an inline centering transform.
			expect(positionerStyle.display).toBe('grid');
			expect(positionerStyle.placeItems).toContain('center');
			expect(dialog.style.transform).toBe('');
		});

		it('has z-index for stacking on the positioning layer', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			const positioner = document.querySelector('[data-dialog-positioner]') as HTMLElement;
			expect(parseInt(window.getComputedStyle(positioner).zIndex)).toBeGreaterThan(0);
		});
	});

	describe('ComboBox Inside Dialog', () => {
		it('does not close dialog when selecting a combobox option', async () => {
			const screen = render(DialogWithComboboxTest, { comboboxTrigger: 'input' });
			const trigger = screen.getByTestId('dialog-trigger');

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			// Wait for the ComboBox input to be available inside the portal
			await expect
				.poll(() => document.querySelector('[data-testid="combobox-input"]'))
				.toBeTruthy();

			// Focus and type to open the ComboBox
			const comboboxInput = document.querySelector(
				'[data-testid="combobox-input"]'
			) as HTMLInputElement;
			await comboboxInput.focus();
			comboboxInput.value = 'a';
			comboboxInput.dispatchEvent(new InputEvent('input', { bubbles: true }));

			// Wait for combobox popover to appear
			await expect.poll(() => document.querySelector('[role="option"]')).toBeTruthy();

			// Click on an option
			const option = document.querySelector('[role="option"]') as HTMLElement;
			option.click();

			// Wait a bit for any potential close to happen
			await new Promise((r) => setTimeout(r, 200));

			// The Dialog should still be open
			const dialog = document.querySelector('[role="dialog"]');
			expect(dialog).toBeTruthy();
		});

		it('ComboBox with trigger="focus" works when opened manually', async () => {
			const screen = render(DialogWithComboboxTest, {
				comboboxTrigger: 'focus',
				comboboxAutofocus: false
			});
			const trigger = screen.getByTestId('dialog-trigger');

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			// Wait for the ComboBox input to be available
			await expect
				.poll(() => document.querySelector('[data-testid="combobox-input"]'))
				.toBeTruthy();

			// Focus the combobox input to open it (trigger="focus")
			const comboboxInput = document.querySelector('[data-testid="combobox-input"]') as HTMLElement;
			comboboxInput.focus();

			// Wait for focus and popover to open
			await expect
				.poll(() => document.querySelector('[data-testid="combobox-item-ar"]'), { timeout: 2000 })
				.toBeTruthy();

			// Click on an option
			const option = document.querySelector('[data-testid="combobox-item-ar"]') as HTMLElement;
			option.click();

			// Wait for selection
			await new Promise((r) => setTimeout(r, 100));

			// The value should be selected
			await expect
				.poll(() => document.querySelector('[data-testid="selected-value"]')?.textContent)
				.toBe('ar');

			// The Dialog should still be open
			const dialog = document.querySelector('[role="dialog"]');
			expect(dialog).toBeTruthy();
		});
	});
});
