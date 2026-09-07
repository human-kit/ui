// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import CheckboxGroupTest from './checkbox-group-test.svelte';

function getTag(source: string, marker: string) {
	const markerIndex = source.indexOf(marker);
	if (markerIndex === -1) return '';
	const tagStart = source.lastIndexOf('<', markerIndex);
	const tagEnd = source.indexOf('>', markerIndex);
	if (tagStart === -1 || tagEnd === -1) return '';
	return source.slice(tagStart, tagEnd + 1);
}

describe('CheckboxGroup SSR', () => {
	it('renders defaultValue selection before hydration', () => {
		const { body } = render(CheckboxGroupTest, {
			props: { defaultValue: ['red', 'blue'] }
		});

		const group = getTag(body, 'data-testid="checkbox-group"');
		const red = getTag(body, 'data-testid="checkbox-red"');
		const green = getTag(body, 'data-testid="checkbox-green"');
		const blue = getTag(body, 'data-testid="checkbox-blue"');

		expect(group).toContain('role="group"');
		expect(group).toContain('data-orientation="vertical"');
		expect(red).toContain('aria-checked="true"');
		expect(green).toContain('aria-checked="false"');
		expect(blue).toContain('aria-checked="true"');
	});

	it('reports nothing while rendering', () => {
		const changes: unknown[] = [];

		render(CheckboxGroupTest, {
			props: {
				value: ['red'],
				onChange: (value) => changes.push(value)
			}
		});

		// The checkboxes unregister as the markup closes, and a value change reported there
		// would reach a consumer whose HTML is already written.
		expect(changes).toEqual([]);
	});

	it('renders empty default state before hydration', () => {
		const { body } = render(CheckboxGroupTest);
		const red = getTag(body, 'data-testid="checkbox-red"');

		expect(red).toContain('aria-checked="false"');
		expect(red).toContain('data-unchecked="true"');
	});
});
