import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TableTest from '../root/table-test.svelte';
import TableBodyItemsTest from './table-body-items-test.svelte';

describe('Table.Body', () => {
	it('marks the body as empty when there are no rows', async () => {
		render(TableTest, { rows: [] });
		expect(document.querySelector('tbody[data-empty]')).toBeTruthy();
	});

	it('supports item-driven virtualization with typed items and a fixed default overscan', async () => {
		render(TableBodyItemsTest);

		await expect
			.poll(() => document.querySelector('[role="grid"]')?.getAttribute('aria-rowcount'))
			.toBe('121');
		// 240px viewport / 32px rows = 8 visible, + 18 overscan = index 25, snapped
		// up to the next multiple of the 5-row block = index 29 (row-030).
		await expect.poll(() => document.querySelectorAll('tbody tr').length).toBeLessThan(35);
		expect(document.querySelector('tbody [data-item-id="row-001"]')).toBeTruthy();
		await expect
			.poll(() => Boolean(document.querySelector('tbody [data-item-id="row-030"]')))
			.toBe(true);
		await expect
			.poll(() => Boolean(document.querySelector('tbody [data-item-id="row-031"]')))
			.toBe(false);
	});

	it('keeps aria-rowindex aligned with the logical row index while virtualizing', async () => {
		render(TableBodyItemsTest);

		// Header rows are numbered first (1-based), body rows continue after them.
		await expect
			.poll(() => document.querySelector('thead tr')?.getAttribute('aria-rowindex'))
			.toBe('1');
		await expect
			.poll(() =>
				document.querySelector('tbody [data-item-id="row-001"]')?.getAttribute('aria-rowindex')
			)
			.toBe('2');

		const scroller = document.querySelector('table')?.parentElement;
		expect(scroller).toBeTruthy();
		scroller!.scrollTop = 40 * 32;
		scroller!.dispatchEvent(new Event('scroll'));

		// rowHeight 32, scrollTop 1280 → start index 40, minus the default overscan
		// of 18 = 22, snapped down to the 5-row block boundary = logical index 20
		// (row-021) → aria-rowindex 1 (header) + 20 + 1 = 22.
		await expect
			.poll(() => document.querySelector('tbody tr[data-item-id]')?.getAttribute('data-item-id'))
			.toBe('row-021');
		expect(document.querySelector('tbody tr[data-item-id]')?.getAttribute('aria-rowindex')).toBe(
			'22'
		);
	});
});
