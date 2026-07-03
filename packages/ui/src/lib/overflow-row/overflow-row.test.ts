import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import OverflowRowTest from './overflow-row-test.svelte';

const ALL = ['apple', 'banana', 'cherry', 'date', 'elderberry'];

describe('OverflowRow', () => {
	it('renders nothing when there are no items', async () => {
		const screen = render(OverflowRowTest, { items: [], width: 1000 });
		expect(
			screen.container.querySelector('[role="list"][aria-label="Selected values"]')
		).toBeNull();
	});

	describe('without an overflow snippet', () => {
		it('renders every item and no mirror/indicator', async () => {
			const screen = render(OverflowRowTest, { width: 90, withOverflow: false });
			const list = screen.getByRole('list', { name: 'Selected values' }).element();

			expect(list.querySelectorAll('[data-tag-id]').length).toBe(ALL.length);
			expect(screen.container.querySelector('[data-testid="overflow"]')).toBeNull();
		});
	});

	describe('overflow (single-line) mode', () => {
		it('renders every item and no indicator when they all fit', async () => {
			const screen = render(OverflowRowTest, { width: 1000 });
			const list = screen.getByRole('list', { name: 'Selected values' }).element();

			await vi.waitFor(() => {
				expect(list.querySelectorAll('[data-tag-id]').length).toBe(ALL.length);
			});
			expect(list.querySelector('[data-testid="overflow"]')).toBeNull();
		});

		it('hides items that do not fit and shows the hidden count', async () => {
			const screen = render(OverflowRowTest, { width: 90 });
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
			const screen = render(OverflowRowTest, { width: 24 });
			const list = screen.getByRole('list', { name: 'Selected values' }).element();

			await vi.waitFor(() => {
				expect(list.querySelectorAll('[data-tag-id]').length).toBe(0);
				const indicator = list.querySelector('[data-testid="overflow"]');
				expect(indicator?.getAttribute('data-summary')).toBe('true');
				expect(indicator?.textContent).toBe(`${ALL.length} selected`);
			});
		});

		it('reveals more items as the row grows', async () => {
			const { container, rerender } = render(OverflowRowTest, { width: 90 });
			const list = () =>
				container.querySelector('[role="list"][aria-label="Selected values"]') as HTMLElement;

			let narrowVisible = 0;
			await vi.waitFor(() => {
				expect(list().querySelector('[data-testid="overflow"]')).not.toBeNull();
				narrowVisible = list().querySelectorAll('[data-tag-id]').length;
				expect(narrowVisible).toBeLessThan(ALL.length);
			});

			await rerender({ width: 1000 });
			await vi.waitFor(() => {
				expect(list().querySelectorAll('[data-tag-id]').length).toBeGreaterThan(narrowVisible);
			});
		});

		it('keeps free space for a sibling via `reserve`', async () => {
			// At width 1000 everything fits; reserving almost the whole width forces overflow.
			const screen = render(OverflowRowTest, { width: 1000, reserve: 960 });
			const list = screen.getByRole('list', { name: 'Selected values' }).element();

			await vi.waitFor(() => {
				expect(list.querySelector('[data-testid="overflow"]')).not.toBeNull();
				expect(list.querySelectorAll('[data-tag-id]').length).toBeLessThan(ALL.length);
			});
		});
	});
});
