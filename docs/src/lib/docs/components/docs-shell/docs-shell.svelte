<script lang="ts">
	import type { Snippet } from 'svelte';
	import Header from '../header/header.svelte';
	import Sidebar from '../sidebar/sidebar.svelte';
	import Toc from '../toc/toc.svelte';
	import { Frame } from '../frame/index.js';
	import { provideTocRegistry } from '../toc/toc-registry.svelte.js';
	import type { NavGroup } from '../../nav.js';

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

<!-- Frame layout: the chrome (header + side rails) sits at level 1, the reading
     pane at level 0. See ./frame/recipe.ts for the structure and sticky math. -->
<Frame.Root>
	{#if header}
		{@render header()}
	{:else}
		<Header {title} {badge} {githubUrl} {homeHref} {brand} {actions} />
	{/if}

	<Frame.Body>
		<!-- Left rail: primary navigation. -->
		<Frame.Sidebar class="docs-scrollbar hidden w-60 md:block">
			{#if sidebar}
				{@render sidebar()}
			{:else}
				<Sidebar {nav} {basePath} />
			{/if}
		</Frame.Sidebar>

		<!-- Center: the reading pane (level 0). -->
		<Frame.Content>
			{@render children()}
		</Frame.Content>

		<!-- Right rail: "on this page" outline. -->
		<Frame.Sidebar class="docs-scrollbar hidden w-56 px-2 xl:block mx-1">
			{#if toc}
				{@render toc()}
			{:else}
				<Toc {headings} />
			{/if}
		</Frame.Sidebar>
	</Frame.Body>
</Frame.Root>
