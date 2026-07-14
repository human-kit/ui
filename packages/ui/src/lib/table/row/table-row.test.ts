import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TableTest from '../root/table-test.svelte';

describe('Table.Row', () => {
	it('reflects selection state through data attributes', async () => {
		render(TableTest, { initialSelectedKeys: ['danilo'] });
		expect(document.querySelector('tbody tr')?.getAttribute('data-selected')).toBe('true');
	});
});
