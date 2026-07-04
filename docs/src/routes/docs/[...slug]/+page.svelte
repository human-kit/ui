<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.meta.title} · human-kit</title>
	{#if data.meta.description}
		<meta name="description" content={data.meta.description} />
	{/if}
</svelte:head>

<article class="prose-docs mx-auto max-w-3xl">
	<data.content />
</article>
