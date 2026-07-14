import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DataAttributesTable from './data-attributes-table.svelte';
import type { ApiDataAttribute } from '../../api-types.js';

const ATTRS: ApiDataAttribute[] = [
	{ name: 'data-disabled', description: 'Present when disabled.' },
	{ name: 'data-pressed', description: 'Present while pressed.' }
];

describe('DataAttributesTable', () => {
	it('renders every attribute name with its description in-column', () => {
		render(DataAttributesTable, { attributes: ATTRS });
		const text = document.body.textContent ?? '';
		for (const attr of ATTRS) {
			expect(text).toContain(attr.name);
			expect(text).toContain(attr.description);
		}
	});

	it('renders one row per attribute plus the header row', () => {
		render(DataAttributesTable, { attributes: ATTRS });
		// Header cell "Data attribute" is present.
		expect(document.body.textContent).toContain('Data attribute');
		// Each attribute name renders in its own mono chip.
		const chips = [...document.querySelectorAll('span')].filter((s) =>
			/^data-/.test(s.textContent ?? '')
		);
		expect(chips).toHaveLength(ATTRS.length);
	});
});
