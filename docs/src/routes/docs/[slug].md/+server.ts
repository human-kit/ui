import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Raw source of every docs page, bundled at build time (?raw) so the endpoint
// works on the serverless adapter without filesystem access.
const sources = import.meta.glob('/src/content/**/index.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

/**
 * Strip the docs plumbing so the served text reads as plain markdown: the
 * frontmatter block, the `<script>` import block, and the `<PageActions />`
 * marker (which only renders these very links). Everything else — headings,
 * prose, code fences, demo/API tags — is left intact.
 */
function toPlainMarkdown(source: string): string {
	return source
		.replace(/^---\n[\s\S]*?\n---\n/, '') // frontmatter
		.replace(/<script[\s\S]*?<\/script>\s*/, '') // script block
		.replace(/^[ \t]*<PageActions\s*\/>[ \t]*\n?/m, '') // the marker
		.replace(/\n{3,}/g, '\n\n') // collapse gaps left behind
		.trimStart();
}

// Serves `/docs/<slug>.md` — the page's raw markdown, opened in the browser
// (like the "View as Markdown" links point to). `text/markdown` renders inline.
export const GET: RequestHandler = ({ params }) => {
	const source = sources[`/src/content/${params.slug}/index.md`];
	if (!source) error(404, 'Not found');

	return new Response(toPlainMarkdown(source), {
		headers: { 'content-type': 'text/markdown; charset=utf-8' }
	});
};
