import { describe, expect, it } from 'vitest';
import { llmsFull, llmsIndex, llmsSmall, packageDocs } from './llms.js';
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

describe('llms-small.txt', () => {
	const small = llmsSmall();

	it('has a section for every content page, with a link to the full page', () => {
		for (const slug of markdownSlugs()) {
			expect(small, slug).toContain(`Full page: ${SITE_URL}/docs/${slug}.md`);
		}
	});

	it('keeps the anatomy and the props, and drops the prop descriptions', () => {
		const dialog = small.slice(small.indexOf('## Dialog\n'), small.indexOf('## Drawer\n'));
		expect(dialog).toContain('<Dialog.Root>');
		expect(dialog).toContain('`shouldCloseOnEscape?: boolean = true`');
		expect(dialog).not.toContain('| Prop |');
	});

	it('is a small part of the full text', () => {
		expect(small.length).toBeLessThan(llmsFull().length / 4);
	});
});

describe('package docs', () => {
	const files = packageDocs('9.9.9');

	it('has an index and one file for every content page', () => {
		expect(files['README.md']).toContain('`@human-kit/ui` 9.9.9');
		for (const slug of markdownSlugs()) {
			expect(files[`${slug}.md`], slug).toBeDefined();
			expect(files['README.md'], slug).toContain(`](./${slug}.md)`);
		}
	});

	it('points the links between pages at the files next to them', () => {
		const all = Object.values(files).join('\n');
		expect(all).toContain('](./chart.md)');
		expect(all).not.toMatch(/\]\(\/[^)]*\)/);
		expect(files['ai-agents.md']).toContain('](./dialog.md)');
		expect(files['ai-agents.md']).toContain('](https://ui.human-kit.com/llms.txt)');
	});
});
