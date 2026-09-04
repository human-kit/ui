import { error } from '@sveltejs/kit';
import { pageMarkdown } from '$lib/docs/markdown-view.js';
import type { RequestHandler } from './$types';

// Kept out of the prerender pass so the `X-Robots-Tag` below survives: a
// prerendered endpoint is written to disk as a plain file and serves without
// response headers.
export const prerender = false;

// Serves `/docs/<slug>.md` — the page as plain markdown, opened in the browser
// (like the "View as Markdown" links point to). `text/markdown` renders inline.
// The docs plumbing is expanded rather than stripped; see markdown-view.ts.
//
// `noindex` because this is the same text as `/docs/<slug>`, in a form no reader
// searches for. Indexed, it would be a duplicate of every page on the site.
export const GET: RequestHandler = ({ params }) => {
	const markdown = pageMarkdown(params.slug);
	if (markdown === null) error(404, 'Not found');

	return new Response(markdown, {
		headers: {
			'content-type': 'text/markdown; charset=utf-8',
			'x-robots-tag': 'noindex'
		}
	});
};
