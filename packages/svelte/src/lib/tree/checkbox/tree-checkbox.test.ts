import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import TreeCheckboxTest from './tree-checkbox-test.svelte';
import TreeLabelFallbackTest from '../root/tree-label-fallback-test.svelte';

describe('Tree.Checkbox', () => {
	it('renders when selection is enabled', async () => {
		render(TreeCheckboxTest, { selectionMode: 'multiple' });
		expect(document.querySelector('[data-tree-checkbox="true"]')).toBeTruthy();
	});

	it('does not render when selection is disabled', async () => {
		render(TreeCheckboxTest, { selectionMode: 'none' });
		expect(document.querySelector('[data-tree-checkbox="true"]')).toBeNull();
	});

	it('toggles item selection explicitly without expanding the branch', async () => {
		render(TreeCheckboxTest, {
			selectionMode: 'multiple',
			defaultExpandedKeys: []
		});

		const checkbox = document.querySelector<HTMLElement>('[data-tree-checkbox="true"]');
		const documents = document.querySelector<HTMLElement>('[role="treeitem"][id="tree-item-documents"]');

		if (!checkbox || !documents) throw new Error('Tree checkbox or item not found');

		checkbox.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
		checkbox.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));

		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toBe('["documents"]');
		expect(documents.getAttribute('aria-expanded')).toBe('false');
	});

	it('reflects the indeterminate state for partially selected branches', async () => {
		render(TreeCheckboxTest, {
			selectionMode: 'multiple',
			selectionPropagation: 'descendants',
			defaultSelectedKeys: ['reports']
		});

		const checkbox = document.querySelector<HTMLElement>('[data-tree-checkbox="true"]');
		if (!checkbox) throw new Error('Tree checkbox not found');

		await expect.element(checkbox).toHaveAttribute('aria-checked', 'mixed');
	});

	it('keeps ancestor checkboxes unchecked in flat selection mode', async () => {
		render(TreeCheckboxTest, {
			selectionMode: 'multiple',
			selectionPropagation: 'none',
			defaultSelectedKeys: ['reports']
		});

		const documentsCheckbox = document.querySelector<HTMLElement>(
			'[role="treeitem"][id="tree-item-documents"] [data-tree-checkbox="true"]'
		);
		if (!documentsCheckbox) throw new Error('Documents tree checkbox not found');

		await expect.element(documentsCheckbox).toHaveAttribute('aria-checked', 'false');
		expect(documentsCheckbox.getAttribute('data-indeterminate')).toBeNull();
		expect(documentsCheckbox.querySelector('[data-tree-checkbox-indicator]')).toBeNull();
	});

	it('allows deselecting a child after selecting the parent branch in descendant mode', async () => {
		render(TreeCheckboxTest, {
			selectionMode: 'multiple',
			selectionPropagation: 'descendants',
			defaultExpandedKeys: ['documents']
		});

		const documentsCheckbox = document.querySelector<HTMLElement>(
			'[role="treeitem"][id="tree-item-documents"] [data-tree-checkbox="true"]'
		);
		const budgetCheckbox = document.querySelector<HTMLElement>(
			'[role="treeitem"][id="tree-item-budget"] [data-tree-checkbox="true"]'
		);

		if (!documentsCheckbox || !budgetCheckbox) {
			throw new Error('Tree branch checkboxes not found');
		}

		documentsCheckbox.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
		documentsCheckbox.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));

		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toBe('["documents","reports","budget"]');

		budgetCheckbox.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
		budgetCheckbox.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));

		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toBe('["reports"]');
		await expect.element(documentsCheckbox).toHaveAttribute('aria-checked', 'mixed');
		await expect.element(budgetCheckbox).toHaveAttribute('aria-checked', 'false');
	});

	it('keeps keyboard focus on the item while arrow keys expand and collapse', async () => {
		render(TreeCheckboxTest, {
			selectionMode: 'multiple',
			defaultExpandedKeys: ['documents']
		});

		const tree = document.querySelector<HTMLElement>('[role="tree"]');
		const documents = document.querySelector<HTMLElement>('[role="treeitem"][id="tree-item-documents"]');
		const reports = document.querySelector<HTMLElement>('[role="treeitem"][id="tree-item-reports"]');
		const checkbox = document.querySelector<HTMLElement>('[data-tree-checkbox="true"]');

		if (!tree || !documents || !reports || !checkbox) {
			throw new Error('Tree interactive elements not found');
		}

		tree.focus();

		await expect.poll(() => document.activeElement).toBe(documents);
		await expect.element(documents).toHaveAttribute('data-focused', 'true');
		await expect.element(documents).toHaveAttribute('data-focus-visible', 'true');

		await userEvent.keyboard('{ArrowLeft}');
		await expect.element(documents).toHaveAttribute('aria-expanded', 'false');
		expect(document.activeElement).toBe(documents);
		expect(document.activeElement).not.toBe(checkbox);
		expect(document.activeElement).not.toBe(reports);

		await userEvent.keyboard('{ArrowRight}');
		await expect.element(documents).toHaveAttribute('aria-expanded', 'true');
		expect(document.activeElement).toBe(documents);
		await expect.element(documents).toHaveAttribute('data-focused', 'true');
		expect(document.activeElement).not.toBe(reports);
	});

	it('toggles only once when pressing Space on the focused item even with a checkbox present', async () => {
		render(TreeCheckboxTest, {
			selectionMode: 'multiple',
			defaultExpandedKeys: ['documents']
		});

		const tree = document.querySelector<HTMLElement>('[role="tree"]');
		const documents = document.querySelector<HTMLElement>(
			'[role="treeitem"][id="tree-item-documents"]'
		);

		if (!tree || !documents) {
			throw new Error('Tree or item not found');
		}

		tree.focus();
		await expect.poll(() => document.activeElement).toBe(documents);

		await userEvent.keyboard(' ');

		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toBe('["documents"]');
		await expect.element(documents).toHaveAttribute('aria-checked', 'true');
	});

	it('does not expose expansion semantics for leaf items with a checkbox', async () => {
		render(TreeCheckboxTest, {
			selectionMode: 'multiple',
			defaultExpandedKeys: ['documents']
		});

		const tree = document.querySelector<HTMLElement>('[role="tree"]');
		const budget = document.querySelector<HTMLElement>('[role="treeitem"][id="tree-item-budget"]');
		const leafTrigger = budget?.querySelector<HTMLElement>('[data-tree-trigger="true"]');

		if (!tree || !budget) {
			throw new Error('Tree or budget item not found');
		}

		expect(budget.getAttribute('aria-expanded')).toBeNull();
		expect(leafTrigger).toBeNull();

		tree.focus();
		await userEvent.keyboard('{ArrowDown}');
		await userEvent.keyboard('{ArrowDown}');

		await expect.poll(() => document.activeElement).toBe(budget);
		await userEvent.keyboard('{ArrowRight}');

		expect(document.activeElement).toBe(budget);
		expect(budget.getAttribute('aria-expanded')).toBeNull();
	});

	it('uses the rendered Tree.Label as the checkbox accessible name by default', async () => {
		const screen = render(TreeLabelFallbackTest);

		await expect.element(screen.getByRole('checkbox', { name: 'Documents' })).toBeInTheDocument();
	});
});
