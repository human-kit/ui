import { describe, expect, it } from 'vitest';
import { createToggleGroupContext, type ToggleGroupValue } from './context.svelte.js';

function createGroup() {
	const changes: ToggleGroupValue[][] = [];
	const group = createToggleGroupContext({
		initialValue: ['bold'],
		disallowEmptySelection: true,
		onValueChange: (value) => changes.push(value)
	});

	group.registerToggle('bold', {});
	group.registerToggle('italic', {});

	return { group, changes };
}

describe('createToggleGroupContext', () => {
	it('reports a removed toggle only while the group is live', () => {
		const { group, changes } = createGroup();

		// Before the root marks itself live — which on the server never happens — an
		// unregistration is the group being built or thrown away, not a selection changing.
		group.unregisterToggle('bold');
		expect(changes).toEqual([]);

		group.registerToggle('bold', {});
		group.setLive(true);
		group.unregisterToggle('bold');

		expect(changes).toEqual([['italic']]);
		expect(group.isSelected('italic')).toBe(true);
	});

	it('goes quiet again once the group stops being live', () => {
		const { group, changes } = createGroup();

		group.setLive(true);
		group.setLive(false);
		group.unregisterToggle('bold');

		expect(changes).toEqual([]);
	});
});
