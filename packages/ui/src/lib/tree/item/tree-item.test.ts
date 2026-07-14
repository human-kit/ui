import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import TreeItemTest from './tree-item-test.svelte';
import TreeItemDisabledTest from './tree-item-disabled-test.svelte';

describe('Tree.Item', () => {
	it('renders expansion semantics and nested levels', async () => {
		const screen = render(TreeItemTest);
		const documents = screen.getByText('Documents').element()?.closest('[role="treeitem"]');
		const reports = screen.getByText('Reports').element()?.closest('[role="treeitem"]');

		expect(documents?.getAttribute('aria-expanded')).toBe('true');
		expect(documents?.getAttribute('aria-level')).toBe('1');
		expect(reports?.getAttribute('aria-level')).toBe('2');
	});

	it('does not render collapsed descendants until the parent expands', async () => {
		render(TreeItemTest, { defaultExpandedKeys: [] });
		expect(document.body.textContent?.includes('Reports')).toBe(false);
	});

	it('selects a branch instead of expanding it when selection is enabled', async () => {
		const screen = render(TreeItemTest, { defaultExpandedKeys: [] });
		const documents = screen
			.getByText('Documents')
			.element()
			?.closest('[role="treeitem"]') as HTMLElement | null;

		expect(documents?.getAttribute('aria-expanded')).toBe('false');
		if (!documents) throw new Error('Documents treeitem not found');

		await userEvent.click(documents);

		await expect.element(documents).toHaveAttribute('data-selected', 'true');
		expect(documents.getAttribute('aria-expanded')).toBe('false');
		expect(document.body.textContent?.includes('Reports')).toBe(false);
	});

	it('runs action instead of selecting on click when selection and action are enabled', async () => {
		const onAction = vi.fn();
		const screen = render(TreeItemTest, { defaultExpandedKeys: [], onAction });
		const documents = screen
			.getByText('Documents')
			.element()
			?.closest('[role="treeitem"]') as HTMLElement | null;

		if (!documents) throw new Error('Documents treeitem not found');

		await userEvent.click(documents);

		expect(onAction).toHaveBeenCalledWith('documents');
		expect(documents.getAttribute('data-selected')).toBeNull();
		expect(documents.getAttribute('aria-expanded')).toBe('false');
	});

	it('expands a branch on click when selectionMode is none', async () => {
		const screen = render(TreeItemTest, {
			defaultExpandedKeys: [],
			selectionMode: 'none'
		});
		const documents = screen
			.getByText('Documents')
			.element()
			?.closest('[role="treeitem"]') as HTMLElement | null;

		if (!documents) throw new Error('Documents treeitem not found');

		await userEvent.click(documents);

		await expect
			.poll(() => screen.getByText('Reports').element()?.closest('[hidden]') === null)
			.toBe(true);
		expect(documents.getAttribute('aria-expanded')).toBe('true');
	});

	it('runs action instead of expanding on click when selectionMode is none and action is enabled', async () => {
		const onAction = vi.fn();
		const screen = render(TreeItemTest, {
			defaultExpandedKeys: [],
			selectionMode: 'none',
			onAction
		});
		const documents = screen
			.getByText('Documents')
			.element()
			?.closest('[role="treeitem"]') as HTMLElement | null;

		if (!documents) throw new Error('Documents treeitem not found');

		await userEvent.click(documents);

		expect(onAction).toHaveBeenCalledWith('documents');
		expect(documents.getAttribute('aria-expanded')).toBe('false');
	});

	it('exposes pressed state during pointer interaction', async () => {
		const screen = render(TreeItemTest);
		const documents = screen
			.getByText('Documents')
			.element()
			?.closest('[role="treeitem"]') as HTMLElement | null;

		if (!documents) throw new Error('Documents treeitem not found');

		documents.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		await expect.element(documents).toHaveAttribute('data-pressed', 'true');

		documents.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0 }));
		await expect.element(documents).not.toHaveAttribute('data-pressed');
	});

	it('updates disabled semantics when the disabled prop changes after mount', async () => {
		const screen = render(TreeItemDisabledTest);
		const reports = document.querySelector<HTMLElement>(
			'[role="treeitem"][id$="tree-item-reports"]'
		);

		if (!reports) throw new Error('Reports treeitem not found');
		expect(reports.getAttribute('aria-disabled')).toBeNull();
		expect(reports.getAttribute('data-disabled')).toBeNull();

		await userEvent.click(screen.getByRole('button', { name: 'Disable reports' }));

		await expect.element(reports).toHaveAttribute('aria-disabled', 'true');
		await expect.element(reports).toHaveAttribute('data-disabled', 'true');
	});

	it('does not move focus when a row is only hovered', async () => {
		const screen = render(TreeItemTest, { selectionMode: 'none' });
		const tree = screen.getByRole('tree');
		const documents = screen
			.getByText('Documents')
			.element()
			?.closest('[role="treeitem"]') as HTMLElement | null;
		const reports = screen
			.getByText('Reports')
			.element()
			?.closest('[role="treeitem"]') as HTMLElement | null;

		if (!documents || !reports) throw new Error('Tree item test elements not found');

		tree.element().focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => document.activeElement).toBe(reports);

		documents.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));

		expect(document.activeElement).toBe(reports);
		await expect.element(reports).toHaveAttribute('data-focused', 'true');
		expect(documents.getAttribute('data-focused')).toBeNull();
	});
});
