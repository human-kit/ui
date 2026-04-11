import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TableTest from '../root/table-test.svelte';

describe('Table.Column', () => {
	it('registers column metadata without rendering an extra wrapper element', async () => {
		render(TableTest);
		expect(document.querySelectorAll('thead [role="columnheader"]').length).toBe(2);
		expect(document.querySelector('[data-table-column]')).toBeFalsy();
	});
});
