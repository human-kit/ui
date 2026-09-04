import releases from '$lib/docs/releases-data.json';
import { releaseAnchor } from '$lib/docs/releases.js';
import { guideTitle, type Seo } from '$lib/docs/seo.js';
import { breadcrumbJsonLd, techArticleJsonLd } from '$lib/docs/structured-data.js';
import { packageName } from '$lib/docs/package-meta.js';

export const prerender = true;

const description = `Changelog for ${packageName} — every released version of the Svelte 5 component library, with the changes that shipped in it.`;

const seo: Seo = {
	title: guideTitle('Releases'),
	ogTitle: 'Releases',
	description,
	type: 'article',
	jsonLd: [
		techArticleJsonLd({ title: 'Releases', description, path: '/docs/releases' }),
		breadcrumbJsonLd([
			{ name: 'Home', path: '/' },
			{ name: 'Overview' },
			{ name: 'Releases', path: '/docs/releases' }
		])
	]
};

// Hand the TOC the same `meta.headings` outline the markdown pipeline produces
// for every other page, so "On this page" renders during SSR. Without it the TOC
// would still fill in — it falls back to scanning the DOM — but only after
// hydration, so the rail would pop in a frame late.
export const load = () => ({
	seo,
	meta: {
		headings: (releases as { version: string }[]).map((release) => ({
			id: releaseAnchor(release.version),
			text: release.version,
			depth: 2
		}))
	}
});
