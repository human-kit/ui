import { error } from '@sveltejs/kit';
import type { Component } from 'svelte';
import { componentTitle, groupOf, guideTitle, isComponentSlug, type Seo } from '$lib/docs/seo.js';
import { breadcrumbJsonLd, techArticleJsonLd } from '$lib/docs/structured-data.js';
import { SITE_DESCRIPTION } from '$lib/docs/site.js';

interface MarkdownModule {
	default: Component;
	metadata: { title: string; description?: string; category?: string };
}

const pages = import.meta.glob('/src/content/**/index.md');

// Every docs page is static markdown, so all of them are built ahead of time
// instead of rendered per request. `entries` lists them from the same glob the
// loader uses, rather than relying on the prerenderer finding every slug by
// following links.
export const prerender = true;

export function entries() {
	return Object.keys(pages).map((path) => ({
		slug: path.replace('/src/content/', '').replace('/index.md', '')
	}));
}

export const load = async ({ params }) => {
	const loader = pages[`/src/content/${params.slug}/index.md`];
	if (!loader) error(404, 'Not found');

	const mod = (await loader()) as MarkdownModule;
	const meta = mod.metadata;
	const slug = params.slug;
	const path = `/docs/${slug}`;
	const description = meta.description ?? SITE_DESCRIPTION;

	// Component pages get a title built around the words a reader searches for
	// ("svelte drawer component"); guides keep their own name up front.
	const title = isComponentSlug(slug) ? componentTitle(meta.title) : guideTitle(meta.title);
	const group = groupOf(slug);

	const seo: Seo = {
		title,
		ogTitle: meta.title,
		description,
		type: 'article',
		jsonLd: [
			techArticleJsonLd({ title: meta.title, description, path }),
			breadcrumbJsonLd([
				{ name: 'Home', path: '/' },
				...(group ? [{ name: group }] : []),
				{ name: meta.title, path }
			])
		]
	};

	return {
		content: mod.default,
		meta,
		seo
	};
};
