import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TableTest from '../root/table-test.svelte';

describe('Table.Cell', () => {
	it('renders row-header semantics for the first body column', async () => {
		render(TableTest);
		expect(document.querySelector('tbody [role="rowheader"]')?.textContent).toContain(
			'danilo@example.com'
		);
	});
});
