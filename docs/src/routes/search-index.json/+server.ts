import { buildSearchIndex } from '$lib/docs/search/build-index.js';

// The docs are prerendered, so the index is written once at build time and
// served as a static file. The search dialog fetches it on first open, which
// keeps it out of every page's bundle.
export const prerender = true;

export function GET() {
	return new Response(JSON.stringify(buildSearchIndex()), {
		headers: { 'content-type': 'application/json' }
	});
}
