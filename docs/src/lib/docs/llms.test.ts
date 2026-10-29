import { describe, expect, it } from 'vitest';
import { llmsFull, llmsIndex } from './llms.js';
import { markdownSlugs } from './markdown-view.js';
import { SITE_URL } from './site.js';

describe('llms.txt', () => {
	const index = llmsIndex();

	it('starts with the brand as an h1 and a summary as a blockquote', () => {
		expect(index.startsWith('# human-kit\n\n> ')).toBe(true);
	});

	it('names the one-word spelling that people search for', () => {
		expect(index).toContain('"humankit"');
	});

	it('links every content page to its markdown twin', () => {
		for (const slug of markdownSlugs()) {
			expect(index, slug).toContain(`](${SITE_URL}/docs/${slug}.md)`);
		}
	});

	it('gives each link the description of its page', () => {
		expect(index).toMatch(/- \[Button\]\([^)]+\): \S/);
	});
});

describe('llms-full.txt', () => {
	const full = llmsFull();

	it('contains the text of every content page', () => {
		for (const slug of markdownSlugs()) {
			expect(full, slug).toContain(`<!-- ${SITE_URL}/docs/${slug} -->`);
		}
		expect(full).toContain('# Button');
	});

	it('contains no unexpanded component tag', () => {
		const prose = full.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
		expect(prose).not.toMatch(/<[A-Z][A-Za-z]*[\s/>]/);
	});
});
