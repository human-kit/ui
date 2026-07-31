<script lang="ts">
	import type { Snippet } from 'svelte';
	import Header from '../header/header.svelte';
	import Sidebar from '../sidebar/sidebar.svelte';
	import Toc from '../toc/toc.svelte';
	import MobileNav from '../mobile-nav/mobile-nav.svelte';
	import MobileToc from '../mobile-nav/mobile-toc.svelte';
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
		<!-- Both rails collapse on narrow screens (the sidebar below `md`, the outline
		     below `xl`), so each gets a drawer standing in for it at exactly the width
		     where it disappears. The triggers carry their own breakpoint classes. -->
		<Header {title} {badge} {githubUrl} {homeHref} {brand} {actions}>
			{#snippet navTrigger()}
				<MobileNav {nav} {basePath} {actions} {githubUrl} />
			{/snippet}
			{#snippet tocTrigger()}
				<MobileToc {headings} />
			{/snippet}
		</Header>
	{/if}

	<Frame.Body>
		<!--
			Left rail: primary navigation.

			Both rails share one sizing recipe on purpose: `basis-60` is the size they
			want, `flex-1` lets them split whatever the reading pane leaves over, and
			`max-w-72` stops a single rail from swallowing all of it in the range where
			its opposite number is hidden. Fixed widths — what these used to be — meant
			the leftover piled up past the right rail instead, so the right column read
			as much wider than the left even though it was 16px narrower.
		-->
		<Frame.Sidebar class="docs-scrollbar hidden min-w-56 flex-1 basis-60 md:block md:max-w-72">
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

		<!-- Right rail: "on this page" outline. Same sizing as the left one; `px-2` is
		     inner padding for the outline, so it does not change the column's width. -->
		<Frame.Sidebar class="docs-scrollbar hidden min-w-56 flex-1 basis-60 px-2 xl:block xl:max-w-72">
			{#if toc}
				{@render toc()}
			{:else}
				<Toc {headings} />
			{/if}
		</Frame.Sidebar>
	</Frame.Body>
</Frame.Root>
