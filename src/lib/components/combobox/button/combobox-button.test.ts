import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ComboBoxTest from '../root/combobox-test.svelte';

describe('ComboBox.Button', () => {
	describe('Accessibility', () => {
		it('has correct aria-label when closed', async () => {
			const screen = render(ComboBoxTest);
			const button = screen.getByRole('button', { name: 'Open menu' });

			await expect.element(button).toBeInTheDocument();
			await expect.element(button).toHaveAttribute('aria-label', 'Open menu');
		});

		it('has correct aria-label when open', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open the popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			const button = screen.getByRole('button', { name: 'Close menu' });
			await expect.element(button).toHaveAttribute('aria-label', 'Close menu');
		});

		it('has aria-expanded attribute matching open state', async () => {
			const screen = render(ComboBoxTest);
			const button = screen.getByRole('button', { name: 'Open menu' });

			// Closed state
			await expect.element(button).toHaveAttribute('aria-expanded', 'false');

			// Open the popover
			const input = screen.getByRole('combobox');
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			// Button now has 'Close menu' label, need to re-query
			const openButton = screen.getByRole('button', { name: 'Close menu' });
			await expect.element(openButton).toHaveAttribute('aria-expanded', 'true');
		});
	});

	describe('Interaction', () => {
		it('toggles popover on mouse down', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Initially closed
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			// Click to open
			const openButton = screen.getByRole('button', { name: 'Open menu' });
			await openButton.click();
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');

			// Click again to close (button now has 'Close menu' label)
			const closeButton = screen.getByRole('button', { name: 'Close menu' });
			await closeButton.click();
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');
		});

		it('has tabindex -1 by default (not keyboard focusable)', async () => {
			const screen = render(ComboBoxTest);
			const button = screen.getByRole('button', { name: 'Open menu' });

			await expect.element(button).toHaveAttribute('tabindex', '-1');
		});
	});

	describe('Visual State', () => {
		it('has data-pressed attribute when open', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open the popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			// Button now has 'Close menu' label
			const button = screen.getByRole('button', { name: 'Close menu' });
			await expect.element(button).toHaveAttribute('data-pressed', 'true');
		});
	});
});
