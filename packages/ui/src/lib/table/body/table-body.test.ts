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
		await expect.poll(() => document.querySelectorAll('tbody tr').length).toBeLessThan(30);
		expect(document.querySelector('tbody [data-item-id="row-001"]')).toBeTruthy();
		await expect
			.poll(() => Boolean(document.querySelector('tbody [data-item-id="row-026"]')))
			.toBe(true);
		await expect
			.poll(() => Boolean(document.querySelector('tbody [data-item-id="row-027"]')))
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

		// rowHeight 32, scrollTop 1280 → start index 40, default overscan 18 → first
		// rendered logical index 22 (row-023) → aria-rowindex 1 (header) + 22 + 1 = 24.
		await expect
			.poll(() =>
				document.querySelector('tbody tr[data-item-id]')?.getAttribute('data-item-id')
			)
			.toBe('row-023');
		expect(
			document.querySelector('tbody tr[data-item-id]')?.getAttribute('aria-rowindex')
		).toBe('24');
	});
});
