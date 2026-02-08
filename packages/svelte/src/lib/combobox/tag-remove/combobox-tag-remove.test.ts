import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ComboBoxMultiselectTest from '../root/combobox-multiselect-test.svelte';

describe('ComboBox.TagRemove', () => {
	describe('Rendering', () => {
		it('renders remove button inside tag', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple'] });

			// Find the remove button by its aria-label
			const removeButton = screen.getByRole('button', { name: 'Remove Apple' });
			await expect.element(removeButton).toBeInTheDocument();
		});

		it('has tabindex=-1 to not interfere with tag focus', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple'] });

			const removeButton = screen.getByRole('button', { name: 'Remove Apple' });
			await expect.element(removeButton).toHaveAttribute('tabindex', '-1');
		});

		it('has type="button"', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple'] });

			const removeButton = screen.getByRole('button', { name: 'Remove Apple' });
			await expect.element(removeButton).toHaveAttribute('type', 'button');
		});
	});

	describe('Behavior', () => {
		it('removes item when clicked', async () => {
			const onValueChange = vi.fn();
			const screen = render(ComboBoxMultiselectTest, {
				value: ['apple', 'banana'],
				onValueChange
			});

			// Click remove button on Apple
			const removeButton = screen.getByRole('button', { name: 'Remove Apple' });
			await removeButton.click();

			// Should have removed apple
			expect(onValueChange).toHaveBeenCalledWith(['banana']);
		});

		it('prevents default behavior', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple'] });

			// The remove button should not submit forms or cause page navigation
			const removeButton = screen.getByRole('button', { name: 'Remove Apple' });
			await expect.element(removeButton).toHaveAttribute('type', 'button');
		});
	});

	describe('Accessibility', () => {
		it('has aria-label with item name', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['banana'] });

			const removeButton = screen.getByRole('button', { name: 'Remove Banana' });
			await expect.element(removeButton).toBeInTheDocument();
		});
	});
});
