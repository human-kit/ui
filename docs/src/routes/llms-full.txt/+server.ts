import type { RequestHandler } from './$types';
import { llmsFull } from '$lib/docs/llms.js';

// Not prerendered, for the same reason as `/docs/<slug>.md`: a prerendered
// endpoint is served as a plain file, without the `X-Robots-Tag` header below.
export const prerender = false;

// `noindex` because this file is the text of every docs page in one document.
// Indexed, it is a duplicate of all of them, and a search engine can pick it as
// the source of the text instead of the page itself.
export const GET: RequestHandler = () =>
	new Response(llmsFull(), {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'x-robots-tag': 'noindex'
		}
	});
