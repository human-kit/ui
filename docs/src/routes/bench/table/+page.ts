import type { Seo } from '$lib/docs/seo.js';

// The benchmark measures client-side interaction cost only; server rendering
// and prerendering would just add noise to the mount scenario.
export const ssr = false;
export const prerender = false;
export const csr = true;

// A harness, not a document: it has no prose to rank and would only compete with
// the docs for crawl budget. `robots.txt` disallows /bench/ as well — this tag
// only exists for a crawler that reaches the page from a link.
export const load = () =>
	({
		seo: {
			title: 'Table benchmark · human-kit',
			description: 'Internal interaction-cost benchmark harness for the Table component.',
			noindex: true
		} satisfies Seo
	}) as { seo: Seo };
