import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { collapseMotion } from '../../primitives/collapse-motion';
import type { TreeItemTransition } from '../types';
import TreeTest from './tree-test.svelte';
import TreeDisabledKeysTest from './tree-disabled-keys-test.svelte';
import TreeLabelFallbackTest from './tree-label-fallback-test.svelte';
import TreeTwoInstancesTest from './tree-two-instances-test.svelte';

function getSelectedLabels() {
	return Array.from(
		document.querySelectorAll('[role="treeitem"][data-selected] [data-tree-label]')
	).map((node) => node.textContent?.trim());
}

describe('Tree.Root', () => {
	it('renders a tree with an accessible label', async () => {
		const screen = render(TreeTest);
		const tree = screen.getByRole('tree');

		await expect.element(tree).toBeInTheDocument();
		await expect.element(tree).toHaveAttribute('aria-label', 'Files');
	});

	it('declares multiselectable semantics in multiple selection mode', async () => {
		const screen = render(TreeTest, { selectionMode: 'multiple' });
		const tree = screen.getByRole('tree');

		await expect.element(tree).toHaveAttribute('aria-multiselectable', 'true');
	});

	it('renders visible items and omits collapsed descendants from the DOM', async () => {
		let treeContext: import('../index').TreeContext | undefined;
		const screen = render(TreeTest, {
			onContext: (context) => {
				treeContext = context;
			}
		});
		const tree = screen.getByRole('tree');

		await expect.element(tree.getByText('Documents')).toBeInTheDocument();
		await expect.element(tree.getByText('Budget')).toBeInTheDocument();
		expect(document.body.textContent?.includes('Vacation')).toBe(false);
		expect(treeContext?.getVisibleNodes().map((node) => node.id)).toEqual([
			'documents',
			'reports',
			'budget',
			'photos',
			'archive'
		]);
	});

	it('moves focus with arrow keys across visible nodes', async () => {
		const screen = render(TreeTest);
		const tree = screen.getByRole('tree');

		tree.element().focus();
		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Documents');
		await userEvent.keyboard('{ArrowDown}');
		let focused = tree.element().querySelector('[data-focused]');
		expect(focused?.textContent).toContain('Reports');

		await userEvent.keyboard('{ArrowDown}');
		focused = tree.element().querySelector('[data-focused]');
		expect(focused?.textContent).toContain('Budget');
	});

	it('focuses the first selected visible node when entering the tree', async () => {
		const screen = render(TreeTest, { defaultSelectedKeys: ['budget'] });
		const tree = screen.getByRole('tree');

		tree.element().focus();

		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Budget');
	});

	it('skips fully disabled items during keyboard navigation', async () => {
		const screen = render(TreeTest, {
			disabledKeys: ['reports'],
			disabledBehavior: 'all'
		});
		const tree = screen.getByRole('tree');

		tree.element().focus();
		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Documents');

		await userEvent.keyboard('{ArrowDown}');

		const focused = tree.element().querySelector('[data-focused]');
		expect(focused?.textContent).toContain('Budget');
	});

	it('expands and collapses through a consumer-provided itemTransition', async () => {
		const screen = render(TreeTest, { defaultExpandedKeys: [], itemTransition: collapseMotion });
		const tree = screen.getByRole('tree');

		expect(document.body.textContent?.includes('Reports')).toBe(false);

		tree.element().focus();
		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Documents');

		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => document.body.textContent?.includes('Reports')).toBe(true);

		await userEvent.keyboard('{ArrowLeft}');
		await expect.poll(() => document.body.textContent?.includes('Reports')).toBe(false);
	});

	it('runs the itemTransition across the renderer boundary on expand and collapse, but not on initial mount', async () => {
		const directions: Array<'in' | 'out' | 'both'> = [];
		const spyTransition: TreeItemTransition = (_node, _params, options) => {
			directions.push(options.direction);
			return { duration: 0 };
		};

		// Rows present at mount (Documents + its expanded children) must NOT animate in.
		const screen = render(TreeTest, {
			defaultExpandedKeys: ['documents'],
			itemTransition: spyTransition
		});
		const tree = screen.getByRole('tree');

		await expect.element(tree.getByText('Reports')).toBeInTheDocument();
		expect(directions).toEqual([]);

		tree.element().focus();
		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Documents');

		// Expanding Reports reveals a new row: it animates in (this only fires with `|global`).
		await userEvent.keyboard('{ArrowDown}');
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => directions.includes('in')).toBe(true);

		directions.length = 0;
		await userEvent.keyboard('{ArrowLeft}');
		await expect.poll(() => directions.includes('out')).toBe(true);
	});

	it('expands and collapses branches with arrow keys', async () => {
		const screen = render(TreeTest, { defaultExpandedKeys: [] });
		const tree = screen.getByRole('tree');

		tree.element().focus();
		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Documents');
		const focused = tree.element().querySelector('[data-focused]') as HTMLElement | null;
		expect(focused?.textContent).toContain('Documents');

		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => tree.getByText('Reports').element()).not.toBeNull();

		await userEvent.keyboard('{ArrowLeft}');
		await expect.poll(() => document.body.textContent?.includes('Reports')).toBe(false);

		await userEvent.keyboard('{ArrowLeft}');
		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Documents');

		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => tree.getByText('Reports').element()).not.toBeNull();
	});

	it('supports flat selection in none propagation mode', async () => {
		const screen = render(TreeTest, {
			selectionMode: 'multiple',
			selectionPropagation: 'none'
		});
		const tree = screen.getByRole('tree');

		tree.element().focus();
		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Documents');
		await userEvent.keyboard(' ');

		const selectedItems = tree.element().querySelectorAll('[role="treeitem"][data-selected]');
		expect(selectedItems).toHaveLength(1);
		expect(selectedItems[0]?.querySelector('[data-tree-label]')?.textContent).toBe('Documents');
		expect(selectedItems[0]?.getAttribute('aria-checked')).toBe('true');
		// Inverted: the container is aria-multiselectable in multiple mode, so rows
		// must emit aria-selected too (aria-checked stays alongside carrying the
		// tri-state/mixed signal).
		expect(selectedItems[0]?.getAttribute('aria-selected')).toBe('true');
	});

	it('selects with Enter when selection is enabled and no action is provided', async () => {
		const screen = render(TreeTest, {
			selectionMode: 'multiple',
			selectionPropagation: 'none'
		});
		const tree = screen.getByRole('tree');

		tree.element().focus();
		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Documents');
		await userEvent.keyboard('{Enter}');

		const selectedItem = tree.element().querySelector('[role="treeitem"][data-selected]');
		expect(selectedItem?.querySelector('[data-tree-label]')?.textContent).toBe('Documents');
	});

	it('supports descendant propagation when selecting a parent', async () => {
		let treeContext: import('../index').TreeContext | undefined;
		const screen = render(TreeTest, {
			selectionMode: 'multiple',
			selectionPropagation: 'descendants',
			onContext: (context) => {
				treeContext = context;
			}
		});
		const tree = screen.getByRole('tree');

		tree.element().focus();
		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Documents');
		await userEvent.keyboard(' ');

		const selectedTexts = Array.from(
			tree.element().querySelectorAll('[role="treeitem"][data-selected] [data-tree-label]')
		).map((node) => node.textContent?.trim());
		expect(selectedTexts).toContain('Documents');
		expect(selectedTexts).toContain('Reports');
		expect(selectedTexts).toContain('Budget');
		expect(treeContext?.getSelectedKeys()).toEqual(
			new Set(['documents', 'reports', 'weekly-report', 'budget'])
		);
	});

	it('renders controlled expanded and selected state on first render', async () => {
		const screen = render(TreeTest, {
			selectionMode: 'multiple',
			selectionPropagation: 'descendants',
			expandedKeys: ['documents', 'reports'],
			selectedKeys: ['documents']
		});
		const tree = screen.getByRole('tree');

		await expect.element(screen.getByText('Weekly report')).toBeInTheDocument();
		const selectedTexts = Array.from(
			tree.element().querySelectorAll('[role="treeitem"][data-selected] [data-tree-label]')
		).map((node) => node.textContent?.trim());
		expect(selectedTexts).toContain('Documents');
		expect(selectedTexts).toContain('Reports');
		expect(selectedTexts).toContain('Budget');
		expect(selectedTexts).toContain('Weekly report');
	});

	it('reverts controlled selection when the parent callback does not accept the change', async () => {
		const onSelectionChange = vi.fn();
		const screen = render(TreeTest, {
			selectionMode: 'multiple',
			selectedKeys: ['budget'],
			// Opting in is now required: supplying the prop alongside a listener is exactly
			// what `bind:selectedKeys` plus a listener looks like, so it no longer implies
			// that the parent owns the state.
			controlledSelectedKeys: true,
			onSelectionChange
		});
		const documentsLabel = screen.getByText('Documents').element() as HTMLElement | null;

		if (!documentsLabel) throw new Error('Documents tree label not found');

		await userEvent.click(documentsLabel);

		expect(onSelectionChange).toHaveBeenCalledTimes(1);
		expect(onSelectionChange.mock.calls[0]?.[0]).toEqual(new Set(['budget', 'documents']));
		await expect
			.poll(() =>
				Array.from(
					document.querySelectorAll('[role="treeitem"][data-selected] [data-tree-label]')
				).map((node) => node.textContent?.trim())
			)
			.toEqual(['Budget']);
	});

	it('reverts controlled expansion when the parent callback does not accept the change', async () => {
		const onExpandedKeysChange = vi.fn();
		const screen = render(TreeTest, {
			selectionMode: 'none',
			expandedKeys: [],
			// See the selection case above: the parent must now say it owns the state.
			controlledExpandedKeys: true,
			onExpandedKeysChange
		});
		const documents = screen
			.getByText('Documents')
			.element()
			?.closest('[role="treeitem"]') as HTMLElement | null;

		if (!documents) throw new Error('Documents treeitem not found');

		await userEvent.click(documents);

		expect(onExpandedKeysChange).toHaveBeenCalledTimes(1);
		expect(onExpandedKeysChange.mock.calls[0]?.[0]).toEqual(new Set(['documents']));
		await expect.poll(() => document.body.textContent?.includes('Reports')).toBe(false);
	});

	it('fires onAction on Enter for the focused item', async () => {
		const onAction = vi.fn();
		const screen = render(TreeTest, { onAction });
		const tree = screen.getByRole('tree');

		tree.element().focus();
		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Documents');
		await userEvent.keyboard('{Enter}');

		expect(onAction).toHaveBeenCalledWith('documents');
	});

	it('selects with Space instead of firing action when both selection and action are enabled', async () => {
		const onAction = vi.fn();
		const screen = render(TreeTest, {
			selectionMode: 'multiple',
			onAction
		});
		const tree = screen.getByRole('tree');

		tree.element().focus();
		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Documents');
		await userEvent.keyboard(' ');

		expect(onAction).not.toHaveBeenCalled();
		expect(tree.element().querySelector('[role="treeitem"][data-selected]')).not.toBeNull();
	});

	it('does nothing on Space when selection is disabled', async () => {
		const screen = render(TreeTest, {
			selectionMode: 'none',
			defaultExpandedKeys: []
		});
		const tree = screen.getByRole('tree');

		tree.element().focus();
		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Documents');
		await userEvent.keyboard(' ');

		expect(tree.element().querySelector('[data-selected]')).toBeNull();
		expect(document.body.textContent?.includes('Reports')).toBe(false);
	});

	it('toggles expansion with Enter only when selection and action are disabled', async () => {
		const screen = render(TreeTest, {
			selectionMode: 'none',
			defaultExpandedKeys: []
		});
		const tree = screen.getByRole('tree');

		tree.element().focus();
		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Documents');
		await userEvent.keyboard('{Enter}');

		await expect
			.poll(() => screen.getByText('Reports').element()?.closest('[hidden]') === null)
			.toBe(true);
	});

	it('fires action with Enter without expanding when selection is disabled and action is enabled', async () => {
		const onAction = vi.fn();
		const screen = render(TreeTest, {
			selectionMode: 'none',
			defaultExpandedKeys: [],
			onAction
		});
		const tree = screen.getByRole('tree');

		tree.element().focus();
		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Documents');
		await userEvent.keyboard('{Enter}');

		expect(onAction).toHaveBeenCalledWith('documents');
		expect(document.body.textContent?.includes('Reports')).toBe(false);
	});

	it('keeps disabled selection items focusable when disabledBehavior is selection', async () => {
		const screen = render(TreeTest, {
			disabledKeys: ['documents'],
			disabledBehavior: 'selection'
		});
		const tree = screen.getByRole('tree');

		tree.element().focus();
		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Documents');
		const focused = tree.element().querySelector('[data-focused]');
		expect(focused?.textContent).toContain('Documents');

		await userEvent.keyboard(' ');
		expect(tree.element().querySelector('[data-selected]')).toBeNull();
	});

	it('reacts when disabledKeys changes after mount', async () => {
		const screen = render(TreeDisabledKeysTest);
		// Row ids are prefixed with a per-instance uid; match by suffix.
		const reports = document.querySelector<HTMLElement>(
			'[role="treeitem"][id$="tree-item-reports"]'
		);

		if (!reports) throw new Error('Reports treeitem not found');
		expect(reports.getAttribute('data-disabled')).toBeNull();

		await userEvent.click(screen.getByRole('button', { name: 'Disable reports' }));

		await expect.element(reports).toHaveAttribute('data-disabled', 'true');
	});

	it('does not steal focus from outside the tree when disabledKeys changes', async () => {
		const screen = render(TreeDisabledKeysTest);
		const tree = screen.getByRole('tree');
		const outsideInput = screen
			.getByRole('textbox', { name: 'Outside input' })
			.element() as HTMLInputElement;
		const disableButton = screen
			.getByRole('button', { name: 'Disable reports' })
			.element() as HTMLElement;

		tree.element().focus();
		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Documents');
		await userEvent.keyboard('{ArrowDown}');
		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Reports');

		outsideInput.focus();
		await expect.poll(() => document.activeElement).toBe(outsideInput);

		// Programmatic click keeps focus on the input while disabledKeys changes.
		disableButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		// The roving target relocates off the now-disabled row...
		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Budget');
		// ...but the document focus is left untouched.
		expect(document.activeElement).toBe(outsideInput);
	});

	it('uses Tree.Label text for typeahead when title is omitted', async () => {
		let treeContext: import('../index').TreeContext | undefined;
		const screen = render(TreeLabelFallbackTest, {
			onContext: (context) => {
				treeContext = context;
			}
		});
		const tree = screen.getByRole('tree');

		tree.element().focus();
		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Documents');

		await userEvent.keyboard('a');

		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Archive');
		expect(treeContext?.getNodeTextValue('node-archive')).toBe('Archive');
	});

	it('replaces selection on click when selectionBehavior is replace', async () => {
		const screen = render(TreeTest, {
			selectionMode: 'multiple',
			selectionBehavior: 'replace'
		});

		await userEvent.click(screen.getByText('Documents'));
		await userEvent.click(screen.getByText('Budget'));

		await expect.poll(getSelectedLabels).toEqual(['Budget']);
	});

	it('adds a non-contiguous item with Ctrl+click when selectionBehavior is replace', async () => {
		const screen = render(TreeTest, {
			selectionMode: 'multiple',
			selectionBehavior: 'replace'
		});
		const archive = screen.getByText('Archive').element()?.closest('[role="treeitem"]');

		await userEvent.click(screen.getByText('Documents'));
		archive?.dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));

		await expect.poll(getSelectedLabels).toEqual(['Documents', 'Archive']);
	});

	it('extends selection with Shift+click when selectionBehavior is replace', async () => {
		const screen = render(TreeTest, {
			selectionMode: 'multiple',
			selectionBehavior: 'replace'
		});
		const budget = screen.getByText('Budget').element()?.closest('[role="treeitem"]');

		await userEvent.click(screen.getByText('Documents'));
		budget?.dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));

		await expect.poll(getSelectedLabels).toEqual(['Documents', 'Reports', 'Budget']);
	});

	it('moves focus and selection together with vertical arrows in replace mode', async () => {
		const screen = render(TreeTest, {
			selectionMode: 'multiple',
			selectionBehavior: 'replace'
		});
		const tree = screen.getByRole('tree');

		tree.element().focus();
		await userEvent.keyboard('{ArrowDown}');

		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Reports');
		await expect.poll(getSelectedLabels).toEqual(['Reports']);
	});

	it('moves focus without changing selection with Ctrl+ArrowDown in replace mode', async () => {
		const screen = render(TreeTest, {
			selectionMode: 'multiple',
			selectionBehavior: 'replace'
		});
		const tree = screen.getByRole('tree');

		await userEvent.click(screen.getByText('Documents'));
		await userEvent.keyboard('{Control>}{ArrowDown}{/Control}');

		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Reports');
		await expect.poll(getSelectedLabels).toEqual(['Documents']);
	});

	it('extends selection from the original anchor with repeated Shift+ArrowDown in replace mode', async () => {
		const screen = render(TreeTest, {
			selectionMode: 'multiple',
			selectionBehavior: 'replace'
		});

		await userEvent.click(screen.getByText('Documents'));
		await userEvent.keyboard('{Shift>}{ArrowDown}{ArrowDown}{/Shift}');

		await expect.poll(getSelectedLabels).toEqual(['Documents', 'Reports', 'Budget']);
	});

	it('shrinks selection back toward the original anchor with Shift+ArrowUp in replace mode', async () => {
		const screen = render(TreeTest, {
			selectionMode: 'multiple',
			selectionBehavior: 'replace'
		});

		await userEvent.click(screen.getByText('Documents'));
		await userEvent.keyboard('{Shift>}{ArrowDown}{ArrowDown}{ArrowUp}{/Shift}');

		await expect.poll(getSelectedLabels).toEqual(['Documents', 'Reports']);
	});

	it('toggles the focused item with Space even when selectionBehavior is replace', async () => {
		const screen = render(TreeTest, {
			selectionMode: 'multiple',
			selectionBehavior: 'replace',
			defaultSelectedKeys: ['documents']
		});
		const tree = screen.getByRole('tree');

		tree.element().focus();
		await expect
			.poll(() => tree.element().querySelector('[data-focused]')?.textContent)
			.toContain('Documents');
		await userEvent.keyboard(' ');

		await expect.poll(getSelectedLabels).toEqual([]);
	});

	it('adds a non-contiguous item with Ctrl+Space when selectionBehavior is replace', async () => {
		const screen = render(TreeTest, {
			selectionMode: 'multiple',
			selectionBehavior: 'replace'
		});
		const archive = screen
			.getByText('Archive')
			.element()
			?.closest('[role="treeitem"]') as HTMLElement | null;

		await userEvent.click(screen.getByText('Documents'));
		archive?.focus();
		await userEvent.keyboard('{Control>} {/Control}');

		await expect.poll(getSelectedLabels).toEqual(['Documents', 'Archive']);
	});

	it('selects instead of firing action on click in replace mode', async () => {
		const onAction = vi.fn();
		const screen = render(TreeTest, {
			selectionMode: 'multiple',
			selectionBehavior: 'replace',
			onAction
		});

		await userEvent.click(screen.getByText('Documents'));

		expect(onAction).not.toHaveBeenCalled();
		await expect.poll(getSelectedLabels).toEqual(['Documents']);
	});

	it('extends selection with Shift+click instead of firing action when onAction is present', async () => {
		const onAction = vi.fn();
		const screen = render(TreeTest, {
			selectionMode: 'multiple',
			defaultSelectedKeys: ['documents'],
			onAction
		});
		const budget = screen.getByText('Budget').element()?.closest('[role="treeitem"]');

		budget?.dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));

		expect(onAction).not.toHaveBeenCalled();
		await expect.poll(getSelectedLabels).toEqual(['Documents', 'Reports', 'Budget']);
	});

	it('keeps DOM ids unique across two tree instances with the same item ids', async () => {
		render(TreeTwoInstancesTest);

		const trees = document.querySelectorAll('[role="tree"]');
		expect(trees).toHaveLength(2);

		// Same logical item id in both trees, but distinct DOM ids (uid prefix).
		const documentRows = document.querySelectorAll('[id$="tree-item-documents"]');
		expect(documentRows).toHaveLength(2);
		expect(documentRows[0]?.id).not.toBe(documentRows[1]?.id);

		// No duplicate ids anywhere (rows and generated label ids included).
		const allIds = Array.from(document.querySelectorAll('[id]')).map((node) => node.id);
		expect(new Set(allIds).size).toBe(allIds.length);
	});

	it('uses row selection instead of action once a toggle-mode selection is active', async () => {
		const onAction = vi.fn();
		const screen = render(TreeTest, {
			selectionMode: 'multiple',
			defaultSelectedKeys: ['documents'],
			onAction
		});

		await userEvent.click(screen.getByText('Budget'));

		expect(onAction).not.toHaveBeenCalled();
		await expect.poll(getSelectedLabels).toEqual(['Documents', 'Budget']);
	});
});
