import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CheckboxTest from '../checkbox/table-checkbox-test.svelte';

describe('Table.CheckboxIndicator', () => {
	it('renders indicator content when the table checkbox is checked', async () => {
		render(CheckboxTest, {
			selectionMode: 'multiple',
			initialSelectedKeys: ['danilo']
		});

		expect(document.querySelector('[data-testid="row-checkbox-danilo"] svg')).toBeTruthy();
	});
});
