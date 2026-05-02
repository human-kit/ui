import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TableTest from '../root/table-test.svelte';
import TableBodyItemsTest from './table-body-items-test.svelte';

describe('Table.Body', () => {
	it('marks the body as empty when there are no rows', async () => {
		render(TableTest, { rows: [] });
		expect(document.querySelector('tbody[data-empty]')).toBeTruthy();
	});

	it('supports item-driven virtualization with logical row counts', async () => {
		render(TableBodyItemsTest);

		await expect
			.poll(() => document.querySelector('[role="grid"]')?.getAttribute('aria-rowcount'))
			.toBe('121');
		await expect.poll(() => document.querySelectorAll('tbody tr').length).toBeLessThan(40);
		expect(document.querySelector('tbody [data-item-id="row-001"]')).toBeTruthy();
	});
});
