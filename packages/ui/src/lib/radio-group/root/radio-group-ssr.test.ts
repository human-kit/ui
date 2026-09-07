// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import RadioGroupTest from './radio-group-test.svelte';

function getTag(source: string, marker: string) {
	const markerIndex = source.indexOf(marker);
	if (markerIndex === -1) return '';
	const tagStart = source.lastIndexOf('<', markerIndex);
	const tagEnd = source.indexOf('>', markerIndex);
	if (tagStart === -1 || tagEnd === -1) return '';
	return source.slice(tagStart, tagEnd + 1);
}

describe('RadioGroup SSR', () => {
	it('renders defaultValue selection before hydration', () => {
		const { body } = render(RadioGroupTest, { props: { defaultValue: 'medium' } });

		const group = getTag(body, 'data-testid="radio-group"');
		const small = getTag(body, 'data-testid="radio-small"');
		const medium = getTag(body, 'data-testid="radio-medium"');

		expect(group).toContain('role="radiogroup"');
		expect(group).toContain('aria-orientation="vertical"');
		expect(small).toContain('aria-checked="false"');
		expect(medium).toContain('aria-checked="true"');
	});

	it('renders the single tab stop before hydration', () => {
		const { body } = render(RadioGroupTest, { props: { defaultValue: 'large' } });

		expect(getTag(body, 'data-testid="radio-small"')).toContain('tabindex="-1"');
		expect(getTag(body, 'data-testid="radio-large"')).toContain('tabindex="0"');
	});

	it('reports nothing while rendering', () => {
		const changes: string[] = [];

		render(RadioGroupTest, {
			props: { value: 'small', onChange: (value: string) => changes.push(value) }
		});

		// The radios unregister as the markup closes, and a change reported there would reach a
		// consumer whose HTML is already written.
		expect(changes).toEqual([]);
	});
});
