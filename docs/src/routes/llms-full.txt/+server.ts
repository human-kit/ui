import type { RequestHandler } from './$types';
import { llmsFull } from '$lib/docs/llms.js';

export const prerender = true;

export const GET: RequestHandler = () =>
	new Response(llmsFull(), {
		headers: { 'content-type': 'text/plain; charset=utf-8' }
	});
