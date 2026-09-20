// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import SelectSsrTest from './select-ssr-test.svelte';

function getTag(source: string, marker: string) {
	const start = source.indexOf(marker);
	if (start === -1) return '';
	const tagStart = source.lastIndexOf('<', start);
	const tagEnd = source.indexOf('>', start);
	return source.slice(tagStart, tagEnd + 1);
}

describe('Select SSR', () => {
	it('renders the closed combobox with its ids during the server render pass', () => {
		const { body } = render(SelectSsrTest);
		const trigger = getTag(body, 'data-select-trigger');

		expect(trigger).toContain('role="combobox"');
		expect(trigger).toContain('aria-haspopup="listbox"');
		expect(trigger).toContain('aria-expanded="false"');
		expect(trigger).toContain('aria-required="true"');
		expect(trigger).toContain('id="select-trigger-fruit"');
		expect(trigger).not.toContain('aria-controls');
		expect(body).not.toContain('role="listbox"');
	});

	it('shows the text of the default value from items before hydration', () => {
		const { body } = render(SelectSsrTest);
		const value = getTag(body, 'data-select-value');

		expect(value).toContain('id="select-value-fruit"');
		expect(value).not.toContain('data-placeholder');
		expect(body).toContain('Banana');
	});

	it('points the label at the trigger', () => {
		const { body } = render(SelectSsrTest);
		const label = getTag(body, 'data-select-label');

		expect(label).toContain('for="select-trigger-fruit"');
		expect(label).toContain('id="select-label-fruit"');
	});

	it('renders the native control with the selected option', () => {
		const { body } = render(SelectSsrTest);

		expect(body).toContain('name="fruit"');
		expect(body).toMatch(/<option value="banana"[^>]*selected/);
	});
});
