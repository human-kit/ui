// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import RatingTest from './rating-test.svelte';

function getTag(source: string, marker: string) {
	const markerIndex = source.indexOf(marker);
	if (markerIndex === -1) return '';
	const tagStart = source.lastIndexOf('<', markerIndex);
	const tagEnd = source.indexOf('>', markerIndex);
	if (tagStart === -1 || tagEnd === -1) return '';
	return source.slice(tagStart, tagEnd + 1);
}

describe('Rating SSR', () => {
	it('renders the radio group, the value and the fill before hydration', () => {
		const { body } = render(RatingTest, { props: { defaultValue: 3 } });

		const root = getTag(body, 'data-testid="root"');
		expect(root).toContain('role="radiogroup"');
		expect(root).toContain('--rating-value: 3');
		expect(getTag(body, 'data-testid="item-2"')).toContain('aria-checked="true"');
		expect(getTag(body, 'data-testid="item-2"')).toContain('--rating-item-fill: 1');
		expect(getTag(body, 'data-testid="item-3"')).toContain('--rating-item-fill: 0');
		expect(body).toContain('3 of 5');
	});

	it('renders the slider of a half rating before hydration', () => {
		const { body } = render(RatingTest, { props: { defaultValue: 2.5, precision: 0.5 } });

		const root = getTag(body, 'data-testid="root"');
		expect(root).toContain('role="slider"');
		expect(root).toContain('aria-valuenow="2.5"');
		expect(root).toContain('aria-valuetext="2.5 of 5"');
	});

	it('reports nothing while rendering', () => {
		const changes: unknown[] = [];

		render(RatingTest, {
			props: { defaultValue: 3, onChange: (value: unknown) => changes.push(value) }
		});

		expect(changes).toEqual([]);
	});
});
