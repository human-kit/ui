// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import AccordionTest from './accordion-test.svelte';

function getTag(source: string, marker: string) {
	const markerIndex = source.indexOf(marker);
	if (markerIndex === -1) return '';
	const tagStart = source.lastIndexOf('<', markerIndex);
	const tagEnd = source.indexOf('>', markerIndex);
	if (tagStart === -1 || tagEnd === -1) return '';
	return source.slice(tagStart, tagEnd + 1);
}

describe('Accordion SSR', () => {
	it('renders the default open panel before hydration', () => {
		const { body } = render(AccordionTest, { props: { defaultValue: ['overview'] } });

		const overviewTrigger = getTag(body, 'data-testid="trigger-overview"');
		const billingTrigger = getTag(body, 'data-testid="trigger-billing"');
		const overviewPanel = getTag(body, 'data-testid="panel-overview"');
		const billingPanel = getTag(body, 'data-testid="panel-billing"');

		expect(overviewTrigger).toContain('aria-expanded="true"');
		expect(billingTrigger).toContain('aria-expanded="false"');

		expect(overviewPanel).toContain('role="region"');
		expect(overviewPanel).not.toContain('hidden');
		expect(body).toContain('Overview panel');

		expect(billingPanel).toContain('hidden');
		expect(billingPanel).toContain('inert');
		expect(body).not.toContain('Billing panel');
	});

	it('renders headings around the triggers', () => {
		const { body } = render(AccordionTest, { props: { defaultValue: ['overview'] } });
		const header = getTag(body, 'data-testid="header-overview"');
		expect(header).toContain('<h3');
	});
});
