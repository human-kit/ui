import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import TreeTriggerTest from './tree-trigger-test.svelte';
import TreeTriggerLeafTest from './tree-trigger-leaf-test.svelte';

describe('Tree.Trigger', () => {
	it('toggles branch expansion without selecting the item in selection mode', async () => {
		const screen = render(TreeTriggerTest, { defaultExpandedKeys: [] });
		const trigger = document.querySelector<HTMLElement>('[data-tree-trigger]');
		const documents = screen.getByText('Documents').element()?.closest('[role="treeitem"]');

		if (!trigger || !documents) throw new Error('Tree trigger or item not found');

		expect(documents.getAttribute('aria-expanded')).toBe('false');
		await userEvent.click(trigger);

		await expect
			.poll(() => screen.getByText('Reports').element()?.closest('[hidden]') === null)
			.toBe(true);
		expect(documents.getAttribute('data-selected')).toBeNull();
	});

	it('reflects branch expansion on the trigger button', async () => {
		const screen = render(TreeTriggerTest, { defaultExpandedKeys: ['documents'] });
		const trigger = document.querySelector<HTMLElement>('[data-tree-trigger]');

		if (!trigger) throw new Error('Tree trigger not found');

		await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
		await expect.element(screen.getByText('Reports')).toBeInTheDocument();
	});

	it('toggles on Enter and Space when the trigger receives focus', async () => {
		render(TreeTriggerTest, { defaultExpandedKeys: ['documents'] });

		const documents = document.querySelector<HTMLElement>('[role="treeitem"][id="tree-item-documents"]');
		const trigger = documents?.querySelector<HTMLElement>('[data-tree-trigger="true"]');

		if (!documents || !trigger) {
			throw new Error('Tree trigger test elements not found');
		}

		trigger.focus();
		await expect.poll(() => document.activeElement).toBe(trigger);

		trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		trigger.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
		await expect.element(documents).toHaveAttribute('aria-expanded', 'false');

		trigger.focus();
		await expect.poll(() => document.activeElement).toBe(trigger);

		trigger.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
		trigger.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }));
		await expect.element(documents).toHaveAttribute('aria-expanded', 'true');
	});

	it('does not render a trigger for leaf items', async () => {
		const screen = render(TreeTriggerLeafTest);
		const budget = screen.getByText('Budget').element()?.closest('[role="treeitem"]');

		if (!budget) throw new Error('Budget treeitem not found');

		expect(budget.getAttribute('aria-expanded')).toBeNull();
		expect(budget.querySelector('[data-tree-trigger="true"]')).toBeNull();
	});
});
