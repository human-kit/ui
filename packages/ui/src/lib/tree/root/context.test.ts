import { describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { createTreeContext, type TreeNodeId } from './context';

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

		const selectionVersionBefore = get(ctx.selectionVersion);
		const expansionVersionBefore = get(ctx.expansionVersion);

		ctx.unregisterNode('reports');
		await flushMicrotasks();

		expect(selectionChanges).toEqual([new Set()]);
		expect(expansionChanges).toEqual([new Set()]);
		expect([...ctx.getSelectedKeys()]).toEqual([]);
		expect(get(ctx.selectionVersion)).toBeGreaterThan(selectionVersionBefore);
		expect(get(ctx.expansionVersion)).toBeGreaterThan(expansionVersionBefore);
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
