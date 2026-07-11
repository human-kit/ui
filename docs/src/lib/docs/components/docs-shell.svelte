<script lang="ts">
	import type { Snippet } from 'svelte';
	import Header from './header.svelte';
	import Sidebar from './sidebar.svelte';
	import Toc from './toc.svelte';
	import { provideTocRegistry } from './toc-registry.svelte.js';
	import type { NavGroup } from '../nav.js';

	// Lets content components (e.g. ApiReference) surface their own headings to
	// the TOC; see toc-registry.svelte.ts.
	provideTocRegistry();

	interface Heading {
		id: string;
		text: string;
		depth: number;
	}

	interface Props {
		nav: NavGroup[];
		basePath?: string;
		title?: string;
		badge?: string;
		githubUrl?: string;
		homeHref?: string;
		/**
		 * Page heading outline for the table of contents. Pass
		 * `data.meta.headings` so it renders during SSR; omit to let the TOC
		 * discover headings from the DOM after hydration.
		 */
		headings?: Heading[];
		/** Replaces the default title + badge brand block (e.g. a logo). */
		brand?: Snippet;
		/** Rendered in the header before the GitHub link and theme toggle. */
		actions?: Snippet;
		/** Replace the whole header region. */
		header?: Snippet;
		/** Replace the sidebar region. */
		sidebar?: Snippet;
		/** Replace the "on this page" region. */
		toc?: Snippet;
		children: Snippet;
	}

	let {
		nav,
		basePath = '/docs',
		title,
		badge,
		githubUrl,
		homeHref,
		headings,
		brand,
		actions,
		header,
		sidebar,
		toc,
		children
	}: Props = $props();
</script>

<div class="min-h-screen bg-background">
	{#if header}
		{@render header()}
	{:else}
		<Header {title} {badge} {githubUrl} {homeHref} {brand} {actions} />
	{/if}

	<div class="mx-auto flex w-full max-w-screen-2xl">
		<aside
			class="sticky top-10 hidden h-[calc(100vh-2.5rem)] w-60 shrink-0 overflow-y-auto border-r border-border md:block"
		>
			{#if sidebar}
				{@render sidebar()}
			{:else}
				<Sidebar {nav} {basePath} />
			{/if}
		</aside>

		<main class="min-w-0 flex-1 px-6 py-10 lg:px-12">
			{@render children()}
		</main>

		<aside
			class="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto px-4 py-10 xl:block"
		>
			{#if toc}
				{@render toc()}
			{:else}
				<Toc {headings} />
			{/if}
		</aside>
	</div>
</div>
