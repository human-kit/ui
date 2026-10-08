<script lang="ts">
	import '@fontsource-variable/geist';
	import '@fontsource-variable/roboto-serif';
	import '../app.css';
	import { dev } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { RenderScan } from 'svelte-render-scan';
	import Seo from '$lib/docs/components/seo/seo.svelte';
	import { startTelemetry, trackPageView } from '$lib/docs/telemetry';
	let { children } = $props();

	// The render overlay repaints on every DOM mutation, which would dominate
	// any measurement taken under /bench.
	const isBench = $derived(page.url.pathname.startsWith('/bench'));

	// `afterNavigate` also runs for the first page, so this is both the start of
	// the client and every view after it. The router swaps a prerendered page
	// without a load, so no script can see a view by itself.
	afterNavigate(() => {
		startTelemetry();
		trackPageView(page.url, page.route.id);
	});
</script>

<!-- The site's only head block. Routes describe themselves by returning `seo`
     from their `load` (see $lib/docs/seo.ts); pages never emit <title>/<meta>
     of their own, because Svelte dedupes the former and not the latter. -->
<Seo />

<!-- The button sits to the left of the corner: the toast demos put their viewport there, and a
     click on a close button must not land on it. -->
{#if dev && !isBench}
	<RenderScan offsetLeft={336} />
{/if}

{@render children()}
