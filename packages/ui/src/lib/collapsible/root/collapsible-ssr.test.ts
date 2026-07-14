// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import CollapsibleTest from './collapsible-test.svelte';

function getTag(source: string, marker: string) {
	const markerIndex = source.indexOf(marker);
	if (markerIndex === -1) return '';
	const tagStart = source.lastIndexOf('<', markerIndex);
	const tagEnd = source.indexOf('>', markerIndex);
	if (tagStart === -1 || tagEnd === -1) return '';
	return source.slice(tagStart, tagEnd + 1);
}

describe('Collapsible SSR', () => {
	it('renders the open panel before hydration', () => {
		const { body } = render(CollapsibleTest, { props: { defaultOpen: true } });

		const trigger = getTag(body, 'data-testid="trigger"');
		const panel = getTag(body, 'data-testid="panel"');

		expect(trigger).toContain('aria-expanded="true"');
		expect(panel).not.toContain('hidden');
		expect(body).toContain('Panel content');
	});

	it('renders the collapsed panel hidden and inert before hydration', () => {
		const { body } = render(CollapsibleTest, { props: { defaultOpen: false } });

		const trigger = getTag(body, 'data-testid="trigger"');
		const panel = getTag(body, 'data-testid="panel"');

		expect(trigger).toContain('aria-expanded="false"');
		expect(panel).toContain('hidden');
		expect(panel).toContain('inert');
		expect(body).not.toContain('Panel content');
	});
});
