import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import TableTest from '../root/table-test.svelte';
import TableCellColumnIndexTest from './table-cell-column-index-test.svelte';

describe('Table.Cell', () => {
	it('renders row-header semantics for the first body column', async () => {
		render(TableTest);
		expect(document.querySelector('tbody [role="rowheader"]')?.textContent).toContain(
			'danilo@example.com'
		);
	});

	// The modality can change while the element already holds focus, and no focus event fires
	// to report it. A key that the component ignores must bring the ring back, the same as in
	// React Aria and Base UI.
	it('shows the focus ring when a key press follows a pointer press', async () => {
		render(TableTest);
		const cell = document.querySelector<HTMLElement>('tbody [role="rowheader"]')!;

		await userEvent.click(cell);
		await expect.poll(() => cell.getAttribute('data-focused')).toBe('true');
		expect(cell.getAttribute('data-focus-visible')).toBeNull();

		await userEvent.keyboard('{F9}');
		await expect.poll(() => cell.getAttribute('data-focus-visible')).toBe('true');
	});

	it('uses columnIndex, and not its place in the row, to find its column', async () => {
		render(TableCellColumnIndexTest);

		const last = document.querySelector<HTMLElement>('[data-testid="last"]')!;
		await expect.poll(() => last.getAttribute('data-column-index')).toBe('3');
		expect(
			document
				.querySelector('tr[data-row="filler"] [role="rowheader"]')
				?.getAttribute('data-column-index')
		).toBe('0');
	});

	it('counts the cells of the row when columnIndex is not set', async () => {
		render(TableCellColumnIndexTest);

		const query = () => document.querySelectorAll('tr[data-row="plain"] [data-column-index]');
		await expect.poll(() => query().length).toBe(4);
		expect([...query()].map((cell) => cell.getAttribute('data-column-index'))).toEqual([
			'0',
			'1',
			'2',
			'3'
		]);
	});
});
