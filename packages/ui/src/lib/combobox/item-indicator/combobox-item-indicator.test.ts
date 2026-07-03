import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ComboBoxMultiselectTest from '../root/combobox-multiselect-test.svelte';

describe('ComboBox.ItemIndicator', () => {
	describe('Rendering', () => {
		it('renders when item is selected', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple'] });
			const input = screen.getByRole('combobox');

			// Open popover
			await input.click();

			// Find the selected item
			const appleItem = screen.getByRole('option', { name: 'Apple' });

			// Should have the indicator (checkmark svg)
			const indicator = appleItem.element().querySelector('[data-state="checked"]');
			expect(indicator).not.toBeNull();
		});

		it('does not render when item is not selected', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple'] });
			const input = screen.getByRole('combobox');

			// Open popover
			await input.click();

			// Find non-selected item
			const bananaItem = screen.getByRole('option', { name: 'Banana' });

			// Should not have the indicator
			const indicator = bananaItem.element().querySelector('[data-state]');
			expect(indicator).toBeNull();
		});

		it('toggles when selection changes', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: [] });
			const input = screen.getByRole('combobox');

			// Open popover
			await input.click();

			// Initially no indicator on Apple
			let appleItem = screen.getByRole('option', { name: 'Apple' });
			let indicator = appleItem.element().querySelector('[data-state="checked"]');
			expect(indicator).toBeNull();

			// Select Apple
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			// Re-open popover (closed on selection for single mode, but we're in multi)
			// In multi mode with closeOnSelect=false, it stays open
			appleItem = screen.getByRole('option', { name: 'Apple' });
			indicator = appleItem.element().querySelector('[data-state="checked"]');
			expect(indicator).not.toBeNull();
		});

		it('has aria-hidden="true"', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple'] });
			const input = screen.getByRole('combobox');

			// Open popover
			await input.click();

			// Find the indicator
			const appleItem = screen.getByRole('option', { name: 'Apple' });
			const indicator = appleItem.element().querySelector('[data-state="checked"]');

			expect(indicator?.getAttribute('aria-hidden')).toBe('true');
		});

		it('has data-state attribute reflecting selection', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple'] });
			const input = screen.getByRole('combobox');

			// Open popover
			await input.click();

			// Find the indicator on selected item
			const appleItem = screen.getByRole('option', { name: 'Apple' });
			const indicator = appleItem.element().querySelector('[data-state]') as HTMLElement;

			expect(indicator.getAttribute('data-state')).toBe('checked');
		});
	});
});
