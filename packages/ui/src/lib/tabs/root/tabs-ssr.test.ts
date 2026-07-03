// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import TabsTest from './tabs-test.svelte';

function getTag(source: string, marker: string) {
	const markerIndex = source.indexOf(marker);
	if (markerIndex === -1) return '';
	const tagStart = source.lastIndexOf('<', markerIndex);
	const tagEnd = source.indexOf('>', markerIndex);
	if (tagStart === -1 || tagEnd === -1) return '';
	return source.slice(tagStart, tagEnd + 1);
}

describe('Tabs SSR', () => {
	it('renders the default first tab and panel before hydration', () => {
		const { body } = render(TabsTest);

		const overviewTab = getTag(body, 'data-testid="tab-overview"');
		const billingTab = getTag(body, 'data-testid="tab-billing"');
		const overviewPanel = getTag(body, 'data-testid="panel-overview"');
		const billingPanel = getTag(body, 'data-testid="panel-billing"');

		expect(overviewTab).toContain('aria-selected="true"');
		expect(overviewTab).toContain('tabindex="0"');
		expect(billingTab).toContain('aria-selected="false"');
		expect(billingTab).toContain('tabindex="-1"');
		expect(overviewPanel).toContain('role="tabpanel"');
		expect(overviewPanel).toContain('tabindex="0"');
		expect(overviewPanel).not.toContain('hidden');
		expect(body).toContain('Overview panel');
		expect(billingPanel).toContain('hidden');
		expect(billingPanel).toContain('inert');
		expect(body).not.toContain('Billing panel');
	});
});
