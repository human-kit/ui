// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import SearchFieldTest from './search-field-test.svelte';

function getTag(source: string, marker: string) {
	const markerIndex = source.indexOf(marker);
	if (markerIndex === -1) return '';
	const tagStart = source.lastIndexOf('<', markerIndex);
	const tagEnd = source.indexOf('>', markerIndex);
	if (tagStart === -1 || tagEnd === -1) return '';
	return source.slice(tagStart, tagEnd + 1);
}

describe('SearchField SSR', () => {
	it('renders the text, the label link and the clear button before hydration', () => {
		const { body } = render(SearchFieldTest, { props: { defaultValue: 'cats', name: 'q' } });

		const input = getTag(body, 'data-search-field-input');
		const label = getTag(body, 'data-search-field-label');
		const clear = getTag(body, 'data-search-field-clear');
		const inputId = input.match(/ id="([^"]+)"/)?.[1];

		expect(input).toContain('type="search"');
		expect(input).toContain('value="cats"');
		expect(input).toContain('name="q"');
		expect(inputId).toBeTruthy();
		expect(label).toContain(`for="${inputId}"`);
		expect(clear).toContain(`aria-controls="${inputId}"`);
		expect(clear).toContain('aria-label="Clear search"');
		expect(clear).toContain('tabindex="-1"');
		expect(getTag(body, 'data-search-field-root')).not.toContain('data-empty');
	});
});
