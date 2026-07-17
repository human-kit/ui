<script lang="ts">
	import DocToolbar from '$lib/docs/components/doc-toolbar/doc-toolbar.svelte';
	import CodeCopy from '$lib/docs/components/code-copy/code-copy.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.meta.title} · @human-kit/ui</title>
	{#if data.meta.description}
		<meta name="description" content={data.meta.description} />
	{/if}
</svelte:head>

<article class="hd-prose relative mx-auto">
	<!-- Pinned top-right so it sits beside the page title (the first block the
	     markdown renders); positioned against the relative article. -->
	<DocToolbar />
	<data.content />
	<!-- Renders nothing: hangs a copy button on each code block this page rendered. -->
	<CodeCopy />
</article>
