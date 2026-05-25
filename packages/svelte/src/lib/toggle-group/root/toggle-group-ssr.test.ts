// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import ToggleGroupTest from './toggle-group-test.svelte';

function getTag(source: string, marker: string) {
	const markerIndex = source.indexOf(marker);
	if (markerIndex === -1) return '';
	const tagStart = source.lastIndexOf('<', markerIndex);
	const tagEnd = source.indexOf('>', markerIndex);
	if (tagStart === -1 || tagEnd === -1) return '';
	return source.slice(tagStart, tagEnd + 1);
}

describe('ToggleGroup SSR', () => {
	it('renders defaultValue selection before hydration', () => {
		const { body } = render(ToggleGroupTest, {
			props: { selectionMode: 'multiple', defaultValue: ['bold', 'underline'] }
		});

		const group = getTag(body, 'data-testid="toggle-group"');
		const bold = getTag(body, 'data-testid="toggle-bold"');
		const italic = getTag(body, 'data-testid="toggle-italic"');
		const underline = getTag(body, 'data-testid="toggle-underline"');

		expect(group).toContain('role="group"');
		expect(group).toContain('data-orientation="horizontal"');
		expect(group).toContain('data-multiple="true"');
		expect(bold).toContain('aria-pressed="true"');
		expect(italic).toContain('aria-pressed="false"');
		expect(underline).toContain('aria-pressed="true"');
	});

	it('renders empty default state before hydration', () => {
		const { body } = render(ToggleGroupTest);
		const bold = getTag(body, 'data-testid="toggle-bold"');
		const italic = getTag(body, 'data-testid="toggle-italic"');

		expect(bold).toContain('aria-pressed="false"');
		expect(bold).toContain('data-unselected="true"');
		expect(italic).toContain('aria-pressed="false"');
	});
});
