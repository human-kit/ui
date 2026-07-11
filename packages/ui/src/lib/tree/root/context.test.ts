import { describe, expect, it, vi } from 'vitest';
import { createTreeContext, type TreeNodeId } from './context.svelte';

function flushMicrotasks() {
	return new Promise<void>((resolve) => {
		queueMicrotask(() => queueMicrotask(resolve));
	});
}

describe('createTreeContext', () => {
	it('applies descendant propagation to initial selected keys', () => {
		const ctx = createTreeContext({
			selectionMode: 'multiple',
			selectionPropagation: 'descendants',
			initialSelectedKeys: ['documents']
		});

		ctx.registerNode({
			id: 'documents',
			parentId: null,
			sectionId: null,
			level: 1,
			textValue: 'Documents',
			disabled: false,
			hasChildren: true
		});
		ctx.registerNode({
			id: 'reports',
			parentId: 'documents',
			sectionId: null,
			level: 2,
			textValue: 'Reports',
			disabled: false,
			hasChildren: true
		});
		ctx.registerNode({
			id: 'weekly-report',
			parentId: 'reports',
			sectionId: null,
			level: 3,
			textValue: 'Weekly report',
			disabled: false,
			hasChildren: false
		});

		expect([...ctx.getSelectedKeys()]).toEqual(['documents', 'reports', 'weekly-report']);
		expect(ctx.getSelectionState('documents')).toBe('all');
		expect(ctx.isSelected('weekly-report')).toBe(true);
	});

	it('removes stale parent buckets when a node is re-registered elsewhere', () => {
		const ctx = createTreeContext();

		ctx.registerNode({
			id: 'documents',
			parentId: null,
			sectionId: null,
			level: 1,
			textValue: 'Documents',
			disabled: false,
			hasChildren: true
		});
		ctx.registerNode({
			id: 'reports',
			parentId: 'documents',
			sectionId: null,
			level: 2,
			textValue: 'Reports',
			disabled: false,
			hasChildren: false
		});
		ctx.registerNode({
			id: 'archive',
			parentId: null,
			sectionId: null,
			level: 1,
			textValue: 'Archive',
			disabled: false,
			hasChildren: true
		});

		ctx.registerNode({
			id: 'reports',
			parentId: 'archive',
			sectionId: null,
			level: 2,
			textValue: 'Reports',
			disabled: false,
			hasChildren: false
		});

		expect(ctx.getFirstChildId('documents')).toBe(null);
		expect(ctx.getFirstChildId('archive')).toBe('reports');
	});

	it('emits selection and expansion changes when an active node unregisters', async () => {
		const selectionChanges: Array<Set<TreeNodeId>> = [];
		const expansionChanges: Array<Set<TreeNodeId>> = [];
		const ctx = createTreeContext({
			selectionMode: 'multiple',
			initialSelectedKeys: ['reports'],
			initialExpandedKeys: ['reports'],
			onSelectionChange: (keys) => selectionChanges.push(keys),
			onExpandedKeysChange: (keys) => expansionChanges.push(keys)
		});

		ctx.registerNode({
			id: 'documents',
			parentId: null,
			sectionId: null,
			level: 1,
			textValue: 'Documents',
			disabled: false,
			hasChildren: true
		});
		ctx.registerNode({
			id: 'reports',
			parentId: 'documents',
			sectionId: null,
			level: 2,
			textValue: 'Reports',
			disabled: false,
			hasChildren: false
		});

		ctx.unregisterNode('reports');
		await flushMicrotasks();

		expect(selectionChanges).toEqual([new Set()]);
		expect(expansionChanges).toEqual([new Set()]);
		expect([...ctx.getSelectedKeys()]).toEqual([]);
		expect([...ctx.getExpandedKeys()]).toEqual([]);
	});

	it('normalizes mixed numeric and string keys to the same identity', () => {
		// Numeric item ids + string keys (or vice versa) must resolve to the same
		// key: all keys are normalized to strings at the context boundary.
		const ctx = createTreeContext({
			selectionMode: 'multiple',
			initialExpandedKeys: ['1'],
			disabledKeys: [3]
		});

		ctx.registerNode({
			id: 1,
			parentId: null,
			sectionId: null,
			level: 1,
			textValue: 'One',
			disabled: false,
			hasChildren: true
		});
		ctx.registerNode({
			id: 2,
			parentId: 1,
			sectionId: null,
			level: 2,
			textValue: 'Two',
			disabled: false,
			hasChildren: false
		});
		ctx.registerNode({
			id: '3',
			parentId: null,
			sectionId: null,
			level: 1,
			textValue: 'Three',
			disabled: false,
			hasChildren: false
		});

		// String key '1' expands the node registered with numeric id 1.
		expect(ctx.isExpanded(1)).toBe(true);
		expect(ctx.isExpanded('1')).toBe(true);
		expect(ctx.getVisibleNodes().map((node) => node.id)).toEqual(['1', '2', '3']);

		// Numeric disabled key 3 disables the node registered with string id '3'.
		expect(ctx.isDisabled('3')).toBe(true);

		// Selection works with either representation and emits normalized keys.
		ctx.setSelectedKeys([2]);
		expect(ctx.isSelected('2')).toBe(true);
		expect(ctx.isSelected(2)).toBe(true);
		expect(ctx.getSelectedKeys()).toEqual(new Set(['2']));
	});

	it('warns in dev when an id is re-registered with a different connected element', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const first = document.createElement('div');
		const second = document.createElement('div');
		document.body.append(first, second);

		try {
			const ctx = createTreeContext();
			const base = {
				parentId: null,
				sectionId: null,
				level: 1,
				textValue: 'Duplicate',
				disabled: false,
				hasChildren: false
			};

			ctx.registerNode({ ...base, id: 'dup', element: first });
			expect(warn).not.toHaveBeenCalled();

			// Same id, same element: a legit re-registration must stay silent.
			ctx.registerNode({ ...base, id: 'dup', element: first });
			expect(warn).not.toHaveBeenCalled();

			// Same id, different mounted element: duplicate ids in the same tree.
			ctx.registerNode({ ...base, id: 'dup', element: second });
			expect(warn).toHaveBeenCalledTimes(1);
			expect(String(warn.mock.calls[0]?.[0])).toContain('Duplicate item id "dup"');
		} finally {
			warn.mockRestore();
			first.remove();
			second.remove();
		}
	});

	it('does not emit unregister changes once teardown has begun', async () => {
		const selectionChanges: Array<Set<TreeNodeId>> = [];
		const expansionChanges: Array<Set<TreeNodeId>> = [];
		const ctx = createTreeContext({
			selectionMode: 'multiple',
			initialSelectedKeys: ['documents'],
			initialExpandedKeys: ['documents'],
			onSelectionChange: (keys) => selectionChanges.push(keys),
			onExpandedKeysChange: (keys) => expansionChanges.push(keys)
		});

		ctx.registerNode({
			id: 'documents',
			parentId: null,
			sectionId: null,
			level: 1,
			textValue: 'Documents',
			disabled: false,
			hasChildren: false
		});

		ctx.beginTeardown();
		ctx.unregisterNode('documents');
		await flushMicrotasks();

		expect(selectionChanges).toEqual([]);
		expect(expansionChanges).toEqual([]);
	});
});
