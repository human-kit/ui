/**
 * Builds the search index from the docs content at build time.
 *
 * The site is fully prerendered, so there is no server to ask at run time: the
 * index is a static JSON file (see `routes/search-index.json`) that the client
 * downloads the first time the reader opens the search dialog.
 *
 * Everything is bundled through `import.meta.glob`, the same way
 * `markdown-view.ts` reads the pages, so this works with no filesystem access.
 */
import GithubSlugger from 'github-slugger';
import type { ComponentApi } from '../api-types.js';
import { parsePageSource } from '../markdown/page-source.js';
import { groupOf, isComponentSlug } from '../seo.js';
import type { SearchRecord } from './types.js';

const pages = import.meta.glob('/src/content/**/index.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const apis = import.meta.glob('/src/content/**/api.json', { eager: true }) as Record<
	string,
	{ default: ComponentApi }
>;

/**
 * Markdown to plain words.
 *
 * Fenced code goes first, and it goes for two reasons: a `#` comment inside a
 * fence would open a section that does not exist, and the API names a reader
 * searches for are already indexed from `api.json` with their descriptions
 * attached — indexing them a second time as sample code only adds noise.
 */
function plainText(markdown: string): string {
	return (
		markdown
			.replace(/```[\s\S]*?```/g, ' ')
			.replace(/<Demo[\s\S]*?<\/Demo>/g, ' ')
			// Inline code before the tags: half of it is markup (`<button>`), and the
			// tag pass below would take the one word the sentence was about with it.
			.replace(/`([^`]*)`/g, (_whole, code: string) => ` ${code.replace(/[<>/]/g, ' ')} `)
			.replace(/<[^>]+>/g, ' ')
			.replace(/!\[([^\]]*)\]\([^)]*\)/g, ' ')
			.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
			.replace(/[*_~|]/g, ' ')
			.replace(/^\s*[-+]\s+/gm, ' ')
			.replace(/\s+/g, ' ')
			// Unpadding what the passes above padded, so the text does not read
			// "the modal prop , which".
			.replace(/\s+([,.;:!?)\]])/g, '$1')
			.replace(/([([])\s+/g, '$1')
			.trim()
	);
}

/** The heading text as a reader sees it — what rehype-slug slugs. */
function headingText(markdown: string): string {
	return plainText(markdown);
}

interface Section {
	heading: string;
	hash: string;
	depth: number;
	lines: string[];
}

/**
 * Splits a page body into its headed sections.
 *
 * The hashes come from the same slugger rehype-slug uses, fed the headings in
 * document order, so a result links to an id that exists on the page. A slugger
 * per page, because that is the scope rehype-slug dedupes in.
 */
function sectionsOf(body: string): Section[] {
	const slugger = new GithubSlugger();
	const withoutCode = body.replace(/```[\s\S]*?```/g, '');
	const sections: Section[] = [];

	for (const line of withoutCode.split('\n')) {
		const heading = line.match(/^(#{1,6})\s+(.*?)\s*$/);
		if (heading) {
			const text = headingText(heading[2]);
			sections.push({
				heading: text,
				hash: slugger.slug(text),
				depth: heading[1].length,
				lines: []
			});
		} else if (sections.length > 0) {
			sections[sections.length - 1].lines.push(line);
		}
	}

	return sections;
}

function apiRecords(slug: string, page: string, group: string | null, api: ComponentApi) {
	return api.parts.map((part): SearchRecord => {
		const text = plainText(
			[
				part.description,
				...part.props.map((prop) =>
					[prop.name, prop.type, prop.default ?? '', prop.description].join(' ')
				),
				...part.dataAttributes.map((attribute) => `${attribute.name} ${attribute.description}`)
			].join(' ')
		);

		return {
			id: `${slug}#api-${part.name.toLowerCase()}`,
			slug,
			group,
			page,
			heading: part.name,
			// The id <ApiReference> gives each part's heading.
			hash: `api-${part.name.toLowerCase()}`,
			kind: 'api',
			text
		};
	});
}

export function buildSearchIndex(): SearchRecord[] {
	const records: SearchRecord[] = [];

	for (const [path, raw] of Object.entries(pages)) {
		const slug = path.slice('/src/content/'.length, -'/index.md'.length);
		const { title, description, body } = parsePageSource(raw);
		const group = groupOf(slug);
		const sections = sectionsOf(body);

		// The h1 opens the page, so its section is the page record: it is what a
		// reader means by "the Button page", and it links to the page with no hash.
		const [intro, ...rest] = sections;
		const introText = plainText(intro?.lines.join('\n') ?? '');
		records.push({
			id: slug,
			slug,
			group,
			page: title,
			heading: title,
			hash: '',
			// A component page and a guide answer different questions, and the dialog
			// files them under headings of their own.
			kind: isComponentSlug(slug) ? 'component' : 'guide',
			text: [description ?? '', introText].join(' ').trim()
		});

		for (const section of rest) {
			const text = plainText(section.lines.join('\n'));
			// A heading with nothing under it still names a real destination, so it
			// stays: the heading itself is the part that matches.
			records.push({
				id: `${slug}#${section.hash}`,
				slug,
				group,
				page: title,
				heading: section.heading,
				hash: section.hash,
				kind: 'section',
				text
			});
		}

		const api = apis[`/src/content/${slug}/api.json`]?.default;
		if (api) records.push(...apiRecords(slug, title, group, api));
	}

	return records;
}
