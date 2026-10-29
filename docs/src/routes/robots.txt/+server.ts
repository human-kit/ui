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

# The raw-markdown twin of every docs page stays crawlable on purpose: /llms.txt
# links to it for AI tools. It is not indexed, because it answers with
# X-Robots-Tag: noindex, and a crawler must fetch it to see that header.

Sitemap: ${SITE_URL}/sitemap.xml
`;

export const GET: RequestHandler = () =>
	new Response(body, {
		headers: { 'content-type': 'text/plain; charset=utf-8' }
	});
