import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TreeCheckboxTest from '../checkbox/tree-checkbox-test.svelte';

describe('Tree.CheckboxIndicator', () => {
	it('renders indicator content when the tree checkbox is checked', async () => {
		render(TreeCheckboxTest, {
			selectionMode: 'multiple',
			defaultSelectedKeys: ['documents']
		});

		expect(document.querySelector('[data-tree-checkbox-indicator] svg')).toBeTruthy();
	});
});
