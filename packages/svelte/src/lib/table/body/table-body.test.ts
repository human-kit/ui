import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TableTest from '../root/table-test.svelte';

describe('Table.Body', () => {
	it('marks the body as empty when there are no rows', async () => {
		render(TableTest, { rows: [] });
		expect(document.querySelector('tbody[data-empty]')).toBeTruthy();
	});
});
