import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ComboBoxTest from '../root/combobox-test.svelte';

describe('ComboBox.List', () => {
	describe('Accessibility', () => {
		it('has role="listbox"', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open the popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			const listbox = screen.getByRole('listbox');
			await expect.element(listbox).toBeInTheDocument();
		});

		it('has aria-label', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open the popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			const listbox = screen.getByRole('listbox');
			const ariaLabel = listbox.element().getAttribute('aria-label');
			expect(ariaLabel).toBeTruthy();
		});
	});

	describe('Empty state', () => {
		it('displays empty placeholder when no items match', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open and type something that won't match
			await input.click();
			await userEvent.type(input.element(), 'zzzzzzz');

			// Check for empty placeholder text
			const emptyText = screen.getByText('No countries found');
			await expect.element(emptyText).toBeVisible();
		});
	});

	describe('Selection behavior', () => {
		it('contains options matching data', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open the popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			// Check that options are rendered
			const listbox = screen.getByRole('listbox').element();
			const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
			expect(options.length).toBeGreaterThan(0);
		});

		it('supports Enter to select focused item', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open and navigate
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');

			// Select
			await userEvent.keyboard('{Enter}');

			// Popover should close after selection
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			// Input should have selected value
			const inputValue = (input.element() as HTMLInputElement).value;
			expect(inputValue).toBeTruthy();
		});
	});
});
