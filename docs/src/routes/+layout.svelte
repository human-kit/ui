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
</script>

<svelte:head>
	<title>Svelte Components</title>
	<meta name="description" content="A collection of Svelte 5 UI components" />
</svelte:head>

{#if dev && !isBench}
	<RenderScan />
{/if}

{@render children()}
