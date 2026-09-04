import type { RequestHandler } from './$types';
import { absolute } from '$lib/docs/site.js';
import { nav } from '$lib/docs/nav.js';

export const prerender = true;

// Discovered from the content folder, not from a hand-kept list, so a new page
// is in the sitemap the moment it exists. `eager: false` is enough — only the
// keys are read.
const contentPages = import.meta.glob('/src/content/**/index.md');

/** Routes with real pages but no markdown file behind them. */
const standalone = ['/', '/docs/releases'];

/**
 * Sitemap order follows the sidebar, then anything the nav hasn't listed yet.
 * Order carries no ranking weight, but a diffable, human-readable file is worth
 * the two lines it costs.
 */
function paths(): string[] {
	const fromContent = Object.keys(contentPages).map(
		(path) => `/docs/${path.replace('/src/content/', '').replace('/index.md', '')}`
	);
	const all = new Set([...standalone, ...fromContent]);

	const ordered = nav
		.flatMap((group) => group.items.map((item) => `/docs/${item.slug}`))
		.filter((path) => all.has(path));

	return ['/', ...ordered, ...[...all].filter((p) => p !== '/' && !ordered.includes(p))];
}

export const GET: RequestHandler = () => {
	const urls = paths()
		.map((path) => `\t<url>\n\t\t<loc>${absolute(path)}</loc>\n\t</url>`)
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

	return new Response(xml, {
		headers: { 'content-type': 'application/xml; charset=utf-8' }
	});
};
