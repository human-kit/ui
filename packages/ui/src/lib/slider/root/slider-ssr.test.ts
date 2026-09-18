// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import SliderTest from './slider-test.svelte';

function getTag(source: string, marker: string) {
	const markerIndex = source.indexOf(marker);
	if (markerIndex === -1) return '';
	const tagStart = source.lastIndexOf('<', markerIndex);
	const tagEnd = source.indexOf('>', markerIndex);
	if (tagStart === -1 || tagEnd === -1) return '';
	return source.slice(tagStart, tagEnd + 1);
}

describe('Slider SSR', () => {
	it('renders the value, the position and the ARIA state before hydration', () => {
		const { body } = render(SliderTest, { props: { defaultValue: 25 } });

		const root = getTag(body, 'data-testid="root"');
		const thumb = getTag(body, 'data-testid="thumb-0"');
		const inputTag = getTag(body, 'data-slider-input="true"');

		expect(root).toContain('role="group"');
		expect(root).toContain('data-orientation="horizontal"');
		expect(thumb).toContain('left: 25%');
		expect(inputTag).toContain('type="range"');
		expect(inputTag).toContain('value="25"');
		expect(inputTag).toContain('aria-valuenow="25"');
		expect(getTag(body, 'data-testid="fill"')).toContain('width: 25%');
	});

	it('names the thumbs of a range before hydration', () => {
		const { body } = render(SliderTest, { props: { defaultValue: [25, 45] } });

		expect(body).toContain('aria-label="Minimum"');
		expect(body).toContain('aria-label="Maximum"');
		expect(getTag(body, 'data-testid="output"')).toContain('for="');
	});

	it('reports nothing while rendering', () => {
		const changes: unknown[] = [];

		render(SliderTest, {
			props: { defaultValue: 25, onChange: (value: unknown) => changes.push(value) }
		});

		expect(changes).toEqual([]);
	});
});
