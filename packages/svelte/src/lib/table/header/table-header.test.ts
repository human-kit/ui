import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TableTest from '../root/table-test.svelte';

describe('Table.Header', () => {
	it('renders a table head section', async () => {
		render(TableTest);
		expect(document.querySelector('thead[data-table-header]')).toBeTruthy();
	});
});
