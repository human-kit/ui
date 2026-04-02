import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TableTest from '../root/table-test.svelte';

describe('Table.Footer', () => {
	it('renders footer summary content', async () => {
		render(TableTest);
		expect(document.querySelector('tfoot')?.textContent).toContain('3 users');
	});
});
