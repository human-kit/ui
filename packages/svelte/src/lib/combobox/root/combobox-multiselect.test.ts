import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ComboBoxMultiselectTest from './combobox-multiselect-test.svelte';

describe('ComboBox Multi-Select', () => {
	describe('Selection', () => {
		it('allows selecting multiple items', async () => {
			const onValueChange = vi.fn();
			const screen = render(ComboBoxMultiselectTest, { onValueChange });
			const input = screen.getByRole('combobox');

			// Open and select first item (Apple)
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			expect(onValueChange).toHaveBeenLastCalledWith(['apple']);

			// Popover is still open (closeOnSelect=false by default in multiple mode)
			// Navigate to second item and select it (Banana)
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			// Should have called onValueChange with both items
			expect(onValueChange).toHaveBeenLastCalledWith(['apple', 'banana']);
		});

		it('toggles item selection when clicking same item twice', async () => {
			const onValueChange = vi.fn();
			const screen = render(ComboBoxMultiselectTest, { onValueChange });
			const input = screen.getByRole('combobox');

			// Open and select first item
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			expect(onValueChange).toHaveBeenLastCalledWith(['apple']);

			// Select same item again (Apple is still focused since input was cleared)
			await userEvent.keyboard('{Enter}');

			// Item should be deselected
			expect(onValueChange).toHaveBeenLastCalledWith([]);
		});

		it('clears input after selection in multi mode', async () => {
			const screen = render(ComboBoxMultiselectTest);
			const input = screen.getByRole('combobox');

			// Type to filter
			await input.click();
			await userEvent.type(input.element() as Element, 'ap');

			// Select item
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			// Input should be cleared
			await expect.element(input).toHaveValue('');
		});

		it('keeps popover open after selection when closeOnSelect is false', async () => {
			const screen = render(ComboBoxMultiselectTest, { closeOnSelect: false });
			const input = screen.getByRole('combobox');

			// Open and select item
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			// Popover should still be open
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');
		});

		it('closes popover after selection when closeOnSelect is true', async () => {
			const screen = render(ComboBoxMultiselectTest, { closeOnSelect: true });
			const input = screen.getByRole('combobox');

			// Open and select item
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			// Popover should be closed
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');
		});
	});

	describe('Tags Display', () => {
		it('renders tags for selected values', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple', 'banana'] });

			// Should show tags for selected items
			const appleTag = screen.getByText('Apple');
			const bananaTag = screen.getByText('Banana');

			await expect.element(appleTag).toBeInTheDocument();
			await expect.element(bananaTag).toBeInTheDocument();
		});

		it('removes tag when clicking remove button', async () => {
			const onValueChange = vi.fn();
			const screen = render(ComboBoxMultiselectTest, {
				value: ['apple', 'banana'],
				onValueChange
			});

			// Find and click remove button for Apple
			const removeButtons = screen.getByRole('button', { name: 'Remove Apple' });
			await removeButtons.click();

			// Should have removed Apple
			expect(onValueChange).toHaveBeenCalledWith(['banana']);
		});
	});

	describe('Backspace Behavior', () => {
		it('removes last tag when pressing Backspace with empty input', async () => {
			const onValueChange = vi.fn();
			const screen = render(ComboBoxMultiselectTest, {
				value: ['apple', 'banana'],
				onValueChange
			});
			const input = screen.getByRole('combobox');

			// Focus input and press Backspace
			await input.click();
			await userEvent.keyboard('{Backspace}');

			// Should have removed last item (banana)
			expect(onValueChange).toHaveBeenCalledWith(['apple']);
		});

		it('does not remove tag when pressing Backspace with input text', async () => {
			const onValueChange = vi.fn();
			const screen = render(ComboBoxMultiselectTest, {
				value: ['apple', 'banana'],
				onValueChange
			});
			const input = screen.getByRole('combobox');

			// Type something first
			await input.click();
			await userEvent.type(input.element() as Element, 'abc');

			// Clear onValueChange calls from typing
			onValueChange.mockClear();

			// Now press Backspace - should only delete character, not remove tag
			await userEvent.keyboard('{Backspace}');

			// onValueChange should not have been called
			expect(onValueChange).not.toHaveBeenCalled();
		});

		it('does nothing when pressing Backspace with no selections', async () => {
			const onValueChange = vi.fn();
			const screen = render(ComboBoxMultiselectTest, {
				value: [],
				onValueChange
			});
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{Backspace}');

			expect(onValueChange).not.toHaveBeenCalled();
		});
	});

	describe('Aria Attributes', () => {
		it('marks selected items with aria-selected', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple'] });
			const input = screen.getByRole('combobox');

			// Open popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			// Find Apple item
			const appleItem = screen.getByRole('option', { name: 'Apple' });
			await expect.element(appleItem).toHaveAttribute('aria-selected', 'true');

			// Banana should not be selected
			const bananaItem = screen.getByRole('option', { name: 'Banana' });
			await expect.element(bananaItem).toHaveAttribute('aria-selected', 'false');
		});

		it('has multiselectable listbox', async () => {
			const screen = render(ComboBoxMultiselectTest);
			const input = screen.getByRole('combobox');

			// Open popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			const listbox = screen.getByRole('listbox');
			await expect.element(listbox).toHaveAttribute('aria-multiselectable', 'true');
		});
	});
});
