// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import ColorPickerTest from './color-picker-test.svelte';

function getTag(source: string, marker: string) {
	const markerIndex = source.indexOf(marker);
	if (markerIndex === -1) return '';
	const tagStart = source.lastIndexOf('<', markerIndex);
	const tagEnd = source.indexOf('>', markerIndex);
	if (tagStart === -1 || tagEnd === -1) return '';
	return source.slice(tagStart, tagEnd + 1);
}

describe('ColorPicker SSR', () => {
	it('renders the color, the position of each thumb and the fields before hydration', () => {
		const { body } = render(ColorPickerTest, { props: { defaultValue: '#3366cc' } });

		const root = getTag(body, 'data-testid="root"');
		expect(root).toContain('role="group"');
		expect(root).toContain('--color-picker-hue: 220');
		expect(getTag(body, 'data-testid="area"')).toContain('--color-picker-area-x: 75%');
		expect(getTag(body, 'data-testid="area-thumb"')).toContain('left: 75%');
		expect(getTag(body, 'data-testid="hue-thumb"')).toContain('left: 61.11%');
		expect(getTag(body, 'data-testid="hex"')).toContain('value="#3366cc"');
		expect(getTag(body, 'data-testid="red"')).toContain('value="51"');
	});

	it('marks the swatch of the color before hydration', () => {
		const { body } = render(ColorPickerTest, { props: { defaultValue: '#00ff00' } });

		expect(getTag(body, 'data-testid="swatch-1"')).toContain('aria-selected="true"');
		expect(getTag(body, 'data-testid="swatch-0"')).toContain('aria-selected="false"');
	});

	it('reports nothing while rendering', () => {
		const changes: unknown[] = [];

		render(ColorPickerTest, {
			props: { defaultValue: '#3366cc', onChange: (value: unknown) => changes.push(value) }
		});

		expect(changes).toEqual([]);
	});
});
