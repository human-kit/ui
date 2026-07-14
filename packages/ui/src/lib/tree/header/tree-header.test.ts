import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TreeHeaderTest from './tree-header-test.svelte';

describe('Tree.Header', () => {
	it('renders a section label that can label its parent section', async () => {
		const screen = render(TreeHeaderTest);
		const header = screen.getByText('Files');
		const group = screen.getByRole('group');

		await expect.element(header).toBeInTheDocument();
		await expect.element(header).toHaveAttribute('id');
		await expect.element(group).toHaveAttribute('aria-labelledby', header.element()?.id ?? '');
	});
});
