import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ComboBoxMultiselectTest from '../root/combobox-multiselect-test.svelte';
import ComboBoxOverflowTest from '../root/combobox-overflow-test.svelte';

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

	describe('Overflow (single-line) mode', () => {
		const ALL = ['apple', 'banana', 'cherry', 'date', 'elderberry'];

		it('renders every tag and no indicator when they all fit', async () => {
			const screen = render(ComboBoxOverflowTest, { value: ALL, width: 1000 });
			const list = screen.getByRole('list', { name: 'Selected values' }).element();

			await vi.waitFor(() => {
				expect(list.querySelectorAll('[data-tag-id]').length).toBe(ALL.length);
			});
			expect(list.querySelector('[data-testid="overflow"]')).toBeNull();
		});

		it('hides tags that do not fit and shows the hidden count', async () => {
			const screen = render(ComboBoxOverflowTest, { value: ALL, width: 90 });
			const list = screen.getByRole('list', { name: 'Selected values' }).element();

			await vi.waitFor(() => {
				const indicator = list.querySelector('[data-testid="overflow"]');
				expect(indicator).not.toBeNull();

				const visible = list.querySelectorAll('[data-tag-id]').length;
				expect(visible).toBeLessThan(ALL.length);
				// The indicator always accounts for exactly the hidden remainder.
				expect(indicator?.textContent).toBe(`+${ALL.length - visible}`);
			});
		});

		it('shows a summary instead of a lonely indicator when nothing fits', async () => {
			const screen = render(ComboBoxOverflowTest, { value: ALL, width: 24 });
			const list = screen.getByRole('list', { name: 'Selected values' }).element();

			await vi.waitFor(() => {
				expect(list.querySelectorAll('[data-tag-id]').length).toBe(0);
				const indicator = list.querySelector('[data-testid="overflow"]');
				expect(indicator?.getAttribute('data-summary')).toBe('true');
				expect(indicator?.textContent).toBe(`${ALL.length} selected`);
			});
		});

		it('reveals more tags as the row grows', async () => {
			const { container, rerender } = render(ComboBoxOverflowTest, { value: ALL, width: 90 });
			const list = () =>
				container.querySelector('[role="list"][aria-label="Selected values"]') as HTMLElement;

			let narrowVisible = 0;
			await vi.waitFor(() => {
				expect(list().querySelector('[data-testid="overflow"]')).not.toBeNull();
				narrowVisible = list().querySelectorAll('[data-tag-id]').length;
				expect(narrowVisible).toBeLessThan(ALL.length);
			});

			await rerender({ value: ALL, width: 1000 });
			await vi.waitFor(() => {
				expect(list().querySelectorAll('[data-tag-id]').length).toBeGreaterThan(narrowVisible);
			});
		});
	});
});
