<script lang="ts">
	import '@fontsource-variable/geist';
	import '@fontsource-variable/roboto-serif';
	import '../app.css';
	import { dev } from '$app/environment';
	import { page } from '$app/state';
	import { RenderScan } from 'svelte-render-scan';
	let { children } = $props();

	// The render overlay repaints on every DOM mutation, which would dominate
	// any measurement taken under /bench.
	const isBench = $derived(page.url.pathname.startsWith('/bench'));

	/** The published address of the current page, whatever host served it. */
	const SITE = 'https://ui.human-kit.com';
	const canonical = $derived(`${SITE}${page.url.pathname}`.replace(/\/$/, '') || SITE);
</script>

<!--
	Fallback head for any page that does not set its own. The docs pages override
	the title (`Drawer · @human-kit/ui`); this is what everything else gets.

	`canonical` and `og:url` are built from the current path against the real
	domain, so a page shared from a preview deployment still points readers at the
	published site instead of a build-specific hostname.
-->
<svelte:head>
	<title>@human-kit/ui</title>
	<meta
		name="description"
		content="Accessible, typed UI components for Svelte 5, shipped as native ESM with per-component subpath exports."
	/>
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="@human-kit/ui" />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content="@human-kit/ui" />
	<meta
		property="og:description"
		content="Accessible, typed UI components for Svelte 5, shipped as native ESM with per-component subpath exports."
	/>
	<meta name="twitter:card" content="summary" />
</svelte:head>

{#if dev && !isBench}
	<RenderScan />
{/if}

{@render children()}
