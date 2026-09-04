import type { RequestHandler } from './$types';
import { SITE_URL } from '$lib/docs/site.js';

// A route rather than a file in `static/` so the sitemap URL comes from the same
// constant the canonical tags do — a domain move can't leave a stale absolute
// URL behind here.
export const prerender = true;

const body = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Measurement harness: no prose to index, and it competes for crawl budget.
Disallow: /bench/

# The raw-markdown twin of every docs page (also served with X-Robots-Tag: noindex).
Disallow: /docs/*.md$

Sitemap: ${SITE_URL}/sitemap.xml
`;

export const GET: RequestHandler = () =>
	new Response(body, {
		headers: { 'content-type': 'text/plain; charset=utf-8' }
	});
