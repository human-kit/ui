import { error } from '@sveltejs/kit';
import type { Component } from 'svelte';

interface MarkdownModule {
	default: Component;
	metadata: { title: string; description?: string; category?: string };
}

const pages = import.meta.glob('/src/content/**/index.md');

export const load = async ({ params }) => {
	const loader = pages[`/src/content/${params.slug}/index.md`];
	if (!loader) error(404, 'Not found');

	const mod = (await loader()) as MarkdownModule;
	return {
		content: mod.default,
		meta: mod.metadata
	};
};
