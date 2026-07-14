import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TableTest from '../root/table-test.svelte';

describe('Table.EmptyState', () => {
	it('renders a single semantic row when the body is empty', async () => {
		render(TableTest, { rows: [] });
		expect(document.querySelectorAll('tbody tr[data-empty]').length).toBe(1);
	});
});
