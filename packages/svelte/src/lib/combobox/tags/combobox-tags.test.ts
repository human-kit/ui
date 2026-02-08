import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ComboBoxMultiselectTest from '../root/combobox-multiselect-test.svelte';

describe('ComboBox.Tags', () => {
	describe('Rendering', () => {
		it('renders tags for selected items', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple', 'banana'] });

			// Should have a tags container
			const tagsContainer = screen.getByRole('list', { name: 'Selected values' });
			await expect.element(tagsContainer).toBeInTheDocument();

			// Should have 2 tags
			const tags = tagsContainer.element().querySelectorAll('[data-tag-id]');
			expect(tags.length).toBe(2);
		});

		it('does not render when no items are selected', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: [] });

			// Tags container should not exist
			const tagsContainer = screen.container.querySelector(
				'[role="list"][aria-label="Selected values"]'
			);
			expect(tagsContainer).toBeNull();
		});

		it('provides correct item data to children snippet', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: [] });
			const input = screen.getByRole('combobox');

			// Open popover to register items (so labels are available)
			await input.click();

			// Select Apple
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			// Tag should display the label
			const tag = screen.getByRole('listitem');
			await expect.element(tag).toHaveTextContent('Apple');
		});
	});

	describe('Accessibility', () => {
		it('has role="list" with aria-label', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple'] });

			const tagsContainer = screen.getByRole('list', { name: 'Selected values' });
			await expect.element(tagsContainer).toBeInTheDocument();
		});
	});
});
