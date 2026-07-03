import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TreeSectionTest from './tree-section-test.svelte';

describe('Tree.Section', () => {
	it('labels the section group from its header when present', async () => {
		const screen = render(TreeSectionTest);
		const group = screen.getByRole('group');
		const header = screen.getByText('Files');

		await expect.element(group).toBeInTheDocument();
		await expect.element(screen.getByText('Documents')).toBeInTheDocument();
		await expect.element(group).toHaveAttribute('aria-labelledby', header.element()?.id ?? '');
		await expect.element(group).not.toHaveAttribute('aria-label');
	});
});
