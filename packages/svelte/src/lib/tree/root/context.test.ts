import { describe, expect, it } from 'vitest';
import { createTreeContext } from './context';

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
});
