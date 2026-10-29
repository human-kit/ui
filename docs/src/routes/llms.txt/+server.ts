import type { RequestHandler } from './$types';
import { llmsIndex } from '$lib/docs/llms.js';

export const prerender = true;

export const GET: RequestHandler = () =>
	new Response(llmsIndex(), {
		headers: { 'content-type': 'text/plain; charset=utf-8' }
	});
