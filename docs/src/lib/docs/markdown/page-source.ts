/**
 * The first pass over a docs page's markdown source, shared by everything that
 * reads `/src/content/**\/index.md` as text rather than as a component.
 *
 * Two readers need it — the plain-markdown view (`markdown-view.ts`) and the
 * search index (`search/build-index.ts`) — and both of them work off `\n`
 * anchored patterns. A Windows checkout hands them CRLF, and then the
 * frontmatter and the `<script>` block survive into the output as if they were
 * page content. Normalising in one place keeps that bug fixed for both.
 */

export interface PageSource {
	/** The `title` from the frontmatter. */
	title: string;
	/** The `description` from the frontmatter, when the page sets one. */
	description: string | null;
	/** The page body: no frontmatter, no `<script>` block, no `<PageActions />`. */
	body: string;
}

/** Reads one `key: value` line out of a frontmatter block. */
function field(frontmatter: string, key: string): string | null {
	const match = frontmatter.match(new RegExp(`^${key}:[ \t]*(.*)$`, 'm'));
	if (!match) return null;
	return match[1].trim().replace(/^['"]|['"]$/g, '') || null;
}

export function parsePageSource(raw: string): PageSource {
	const source = raw.replace(/\r\n/g, '\n');
	const frontmatter = source.match(/^---\n([\s\S]*?)\n---\n/);

	const body = source
		.replace(/^---\n[\s\S]*?\n---\n/, '')
		.replace(/<script[\s\S]*?<\/script>\s*/, '')
		// Renders the "view as markdown" links, which are page chrome rather than content.
		.replace(/^[ \t]*<PageActions\s*\/>[ \t]*\n?/m, '');

	return {
		title: (frontmatter && field(frontmatter[1], 'title')) ?? '',
		description: frontmatter ? field(frontmatter[1], 'description') : null,
		body
	};
}
