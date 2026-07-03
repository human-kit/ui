import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TableTest from '../root/table-test.svelte';

describe('Table.ColumnHeaderCell', () => {
	it('reflects sortable state on sortable columns', async () => {
		render(TableTest);
		const headers = document.querySelectorAll<HTMLElement>('thead [role="columnheader"]');
		expect(headers[1]?.getAttribute('data-sortable')).toBe('true');
	});
});
