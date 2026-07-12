<script lang="ts">
	import '@fontsource-variable/geist';
	import '@fontsource-variable/roboto-serif';
	import '../app.css';
	import { dev } from '$app/environment';
	import { RenderScan } from 'svelte-render-scan';
	let { children } = $props();
</script>

<svelte:head>
	<title>Svelte Components</title>
	<meta name="description" content="A collection of Svelte 5 UI components" />
</svelte:head>

{#if dev}
	<RenderScan />
{/if}

{@render children()}
