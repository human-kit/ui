<script lang="ts">
	import '@fontsource-variable/geist';
	import '@fontsource-variable/roboto-serif';
	import '../app.css';
	import { dev } from '$app/environment';
	import { page } from '$app/state';
	import { RenderScan } from 'svelte-render-scan';
	import Seo from '$lib/docs/components/seo/seo.svelte';
	let { children } = $props();

	// The render overlay repaints on every DOM mutation, which would dominate
	// any measurement taken under /bench.
	const isBench = $derived(page.url.pathname.startsWith('/bench'));
</script>

<!-- The site's only head block. Routes describe themselves by returning `seo`
     from their `load` (see $lib/docs/seo.ts); pages never emit <title>/<meta>
     of their own, because Svelte dedupes the former and not the latter. -->
<Seo />

{#if dev && !isBench}
	<RenderScan />
{/if}

{@render children()}
