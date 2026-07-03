// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import ListBoxSsrTest from './listbox-ssr-test.svelte';

function getOptionTag(source: string, itemId: string) {
	const start = source.indexOf(`data-item-id="${itemId}"`);
	if (start === -1) return '';
	const tagStart = source.lastIndexOf('<', start);
	const tagEnd = source.indexOf('>', start);
	if (tagStart === -1 || tagEnd === -1) return '';
	return source.slice(tagStart, tagEnd + 1);
}

describe('ListBox.Root SSR', () => {
	it('renders controlled selected items during the server render pass', () => {
		const { body } = render(ListBoxSsrTest);
		const argentinaTags = [...body.matchAll(/<div[^>]*data-item-id="ar"[^>]*>/g)].map(
			(match) => match[0]
		);
		const mexicoTags = [...body.matchAll(/<div[^>]*data-item-id="mx"[^>]*>/g)].map(
			(match) => match[0]
		);
		const brazilTag = getOptionTag(body, 'br');

		expect(argentinaTags.length).toBe(2);
		expect(argentinaTags.every((tag) => tag.includes('aria-selected="true"'))).toBe(true);
		expect(argentinaTags.every((tag) => tag.includes('data-selected="true"'))).toBe(true);
		expect(mexicoTags.some((tag) => tag.includes('aria-selected="true"'))).toBe(true);
		expect(brazilTag).toContain('aria-selected="false"');
	});

	it('renders dynamic empty state during the server render pass', () => {
		const { body } = render(ListBoxSsrTest);

		expect(body).toContain('data-empty-placeholder');
		expect(body).toContain('Sin coincidencias');
	});

	it('renders static empty children state during the server render pass', () => {
		const { body } = render(ListBoxSsrTest);

		expect(body).toContain('Sin coincidencias static');
	});
});
