// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import TreeSsrTest from './tree-ssr-test.svelte';
import TreeStaticSsrTest from './tree-static-ssr-test.svelte';
import TreeLabelFallbackTest from './tree-label-fallback-test.svelte';
import TreeSectionTest from '../section/tree-section-test.svelte';

function getOpeningTag(source: string, id: string) {
	const start = source.indexOf(`id="${id}"`);
	if (start === -1) return '';
	const tagStart = source.lastIndexOf('<', start);
	const tagEnd = source.indexOf('>', start);
	if (tagStart === -1 || tagEnd === -1) return '';
	return source.slice(tagStart, tagEnd + 1);
}

describe('Tree.Root SSR', () => {
	it('renders checked checkboxes on the server render pass', () => {
		const { body } = render(TreeSsrTest);

		expect(body).toContain('data-testid="checkbox-weekly-report"');
		expect(body).toContain('aria-checked="true"');
		expect(body).toContain('data-checked="true"');
		expect(body).toContain('data-testid="indicator-weekly-report"');
	});

	it('does not render trigger semantics for known leaf items on the server render pass', () => {
		const { body } = render(TreeSsrTest);

		expect(body).toContain('data-testid="trigger-documents"');
		expect(body).toContain('data-testid="trigger-reports"');
		expect(body).not.toContain('data-testid="trigger-weekly-report"');
	});

	it('does not render ancestor mixed states in flat selection mode', () => {
		const { body } = render(TreeSsrTest);

		expect(body).not.toContain('aria-checked="mixed"');
		expect(body).not.toContain('data-indeterminate="true"');
	});

	it('renders expanded static descendants on the server render pass before hydration', () => {
		const { body } = render(TreeStaticSsrTest);
		const documentsTag = getOpeningTag(body, 'tree-item-documents');
		const reportsTag = getOpeningTag(body, 'tree-item-reports');

		expect(documentsTag).toContain('aria-expanded="true"');
		expect(body).toContain('data-testid="trigger-documents"');
		expect(reportsTag).not.toContain('aria-expanded');
		expect(body).not.toContain('data-testid="trigger-reports"');
	});

	it('renders section headers on the server render pass before hydration', () => {
		const { body } = render(TreeSectionTest);
		const headerId = body.match(/id="(tree-header-\d+)"/)?.[1];

		expect(body).toContain('Files');
		expect(headerId).toBeDefined();
		expect(body).toContain(`aria-labelledby="${headerId}"`);
		expect(body).not.toContain('aria-label="Primary files"');
	});

	it('renders Tree.Label ids and checkbox labelling on the server render pass', () => {
		const { body } = render(TreeLabelFallbackTest);

		expect(body).toContain('data-tree-label="true"');
		expect(body).toContain('Documents');
		expect(body).toMatch(/id="tree-item-label-\d+"/);
		expect(body).toMatch(/aria-labelledby="tree-item-label-\d+"/);
	});

	it('renders composed Tree.Label content on the server render pass', () => {
		const { body } = render(TreeSsrTest);

		expect(body).toContain('Documents');
		expect(body).toContain('Reports');
		expect(body).toContain('Weekly report');
	});
});
