import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TreeSectionTest from './tree-section-test.svelte';
import TreeSectionMixedTest from './tree-section-mixed-test.svelte';

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

	it('renders top-level items declared outside sections alongside section items', async () => {
		let treeContext: import('../index').TreeContext | undefined;
		const screen = render(TreeSectionMixedTest, {
			onContext: (context) => {
				treeContext = context;
			}
		});
		const tree = screen.getByRole('tree');

		await expect.element(tree.getByText('Documents')).toBeInTheDocument();
		await expect.element(tree.getByText('Archive')).toBeInTheDocument();
		expect(treeContext?.getVisibleNodes().map((node) => node.id)).toEqual(['documents', 'archive']);

		// The loose item is rendered outside any section group.
		const archive = screen
			.getByText('Archive')
			.element()
			?.closest('[role="treeitem"]') as HTMLElement | null;
		expect(archive?.closest('[role="group"]')).toBeNull();
	});
});
