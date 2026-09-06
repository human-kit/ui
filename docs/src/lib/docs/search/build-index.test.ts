import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { Component } from 'svelte';
import { buildSearchIndex } from './build-index.js';

const records = buildSearchIndex();

/** The rendered page, to check the index against what the reader actually gets. */
const pageModules = import.meta.glob('/src/content/**/index.md') as Record<
	string,
	() => Promise<{ default: Component }>
>;

async function renderedIds(slug: string): Promise<Set<string>> {
	const module = await pageModules[`/src/content/${slug}/index.md`]();
	const { container } = render(module.default);
	return new Set(Array.from(container.querySelectorAll('[id]')).map((element) => element.id));
}

describe('buildSearchIndex', () => {
	it('gives every content page one page record', () => {
		const pageRecords = records.filter(
			(record) => record.kind === 'component' || record.kind === 'guide'
		);
		expect(pageRecords.length).toBeGreaterThan(20);
		expect(new Set(pageRecords.map((record) => record.slug)).size).toBe(pageRecords.length);
		expect(pageRecords.every((record) => record.hash === '')).toBe(true);
	});

	it('titles the page record from the frontmatter, and says what kind of page it is', () => {
		const button = records.find((record) => record.id === 'button');
		expect(button?.page).toBe('Button');
		expect(button?.group).toBe('Form');
		expect(button?.kind).toBe('component');
		expect(records.find((record) => record.id === 'quick-start')?.kind).toBe('guide');
	});

	it('keeps the frontmatter, the script block and the code fences out of the text', () => {
		for (const record of records) {
			expect(record.text).not.toContain('import ');
			expect(record.text).not.toContain('</script>');
			expect(record.text).not.toContain('```');
			expect(record.text).not.toMatch(/^title:/m);
		}
	});

	// Rendering a docs page pulls in its demos and the syntax highlighter, so the
	// first transform of it is slow. It is worth it: nothing else proves the
	// hashes in the index are ids that exist.
	it('keeps the word an inline code span is about', () => {
		// The sentence is "The part makes a native `<button>` element". Stripping the
		// markup before the backticks took `button` out of it with the tag.
		expect(records.find((record) => record.id === 'button#anatomy')?.text).toContain('button');
	});

	it('sends every section of a page to an id that page renders', { timeout: 60_000 }, async () => {
		const ids = await renderedIds('button');
		const hashes = records
			.filter((record) => record.slug === 'button' && record.hash !== '')
			.map((record) => record.hash);

		expect(hashes.length).toBeGreaterThan(3);
		for (const hash of hashes) expect(ids).toContain(hash);
	});

	it('indexes an API part under the id <ApiReference> renders for it', () => {
		const root = records.find((record) => record.id === 'button#api-root');
		expect(root?.kind).toBe('api');
		expect(root?.heading).toBe('Root');
		// The props and their descriptions are what a reader searches the API for.
		expect(root?.text).toContain('pending');
	});
});
