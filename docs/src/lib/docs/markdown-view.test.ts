import { describe, expect, it } from 'vitest';
import { markdownSlugs, pageMarkdown } from './markdown-view.js';

const slugs = markdownSlugs();

/**
 * Page text with code removed. Fenced blocks are demo sources and anatomy
 * snippets — they are supposed to contain markup — and inline spans hold the
 * API tables' types, where a generic (`Iterable<T>`) reads like a tag.
 */
function prose(markdown: string): string {
	return markdown.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
}

describe('pageMarkdown', () => {
	it('covers every content page', () => {
		expect(slugs.length).toBeGreaterThan(20);
		expect(slugs).toContain('button');
	});

	it('returns null for a slug with no markdown source', () => {
		expect(pageMarkdown('releases')).toBeNull();
		expect(pageMarkdown('nope')).toBeNull();
	});

	// The point of the whole module: a reader (or an LLM) following the .md link
	// must never be handed markup where content should be. A new docs component
	// used in markdown fails here until markdown-view.ts knows how to expand it.
	it('leaves no unexpanded component tag on any page', () => {
		for (const slug of slugs) {
			expect(prose(pageMarkdown(slug) as string), slug).not.toMatch(/<[A-Z][A-Za-z]*[\s/>]/);
		}
	});

	it('drops the frontmatter and the script block', () => {
		const markdown = pageMarkdown('button') as string;
		expect(markdown.startsWith('# Button')).toBe(true);
		expect(prose(markdown)).not.toContain('<script');
	});

	it('expands a demo into its source, fenced', () => {
		const markdown = pageMarkdown('button') as string;
		expect(markdown).toContain('```svelte');
		expect(markdown).toContain("import { Button } from '@human-kit/ui'");
	});

	it('expands the API reference into tables, one heading per part', () => {
		const markdown = pageMarkdown('button') as string;
		expect(markdown).toContain('### Root');
		expect(markdown).toContain('| Prop | Type | Default | Description |');
		expect(markdown).toContain('| Data attribute | Description |');
		// A union type would otherwise open a new cell.
		expect(markdown).toContain('`boolean \\| null`');
	});

	it('expands the install card to a single pnpm command', () => {
		const markdown = pageMarkdown('quick-start') as string;
		expect(markdown).toContain('```bash\npnpm add @human-kit/ui\n```');
	});
});
