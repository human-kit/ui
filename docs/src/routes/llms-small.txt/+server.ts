import type { RequestHandler } from './$types';
import { llmsSmall } from '$lib/docs/llms.js';

// Not prerendered and `noindex`, for the same reasons as `/llms-full.txt`: it is
// the text of the docs pages again, and a prerendered file has no headers.
export const prerender = false;

export const GET: RequestHandler = () =>
	new Response(llmsSmall(), {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'x-robots-tag': 'noindex'
		}
	});
