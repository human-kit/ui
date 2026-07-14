<script lang="ts">
	import DocToolbar from '$lib/docs/components/doc-toolbar/doc-toolbar.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.meta.title} · @human-kit/ui</title>
	{#if data.meta.description}
		<meta name="description" content={data.meta.description} />
	{/if}
</svelte:head>

<article class="hd-prose mx-auto max-w-3xl">
	<!-- Floated top-right so it sits beside the page title (the first block the
	     markdown renders); the title flows to its left. -->
	<DocToolbar />
	<data.content />
</article>
