// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import ToggleTest from './toggle-test.svelte';
import ToggleUncontrolledTest from './toggle-uncontrolled-test.svelte';

function getToggleTag(source: string) {
	const markerIndex = source.indexOf('data-toggle-root="true"');
	const tagStart = source.lastIndexOf('<', markerIndex);
	const tagEnd = source.indexOf('>', markerIndex);

	if (markerIndex === -1 || tagStart === -1 || tagEnd === -1) return '';
	return source.slice(tagStart, tagEnd + 1);
}

describe('Toggle SSR', () => {
	it('renders defaultSelected state before hydration', () => {
		const { body } = render(ToggleUncontrolledTest, { props: { defaultSelected: true } });
		const toggle = getToggleTag(body);

		expect(toggle).toContain('aria-pressed="true"');
		expect(toggle).toContain('data-selected="true"');
		expect(toggle).not.toContain('data-unselected');
	});

	it('renders unselected state before hydration by default', () => {
		const { body } = render(ToggleUncontrolledTest);
		const toggle = getToggleTag(body);

		expect(toggle).toContain('aria-pressed="false"');
		expect(toggle).toContain('data-unselected="true"');
	});
});
