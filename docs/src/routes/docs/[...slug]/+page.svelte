<script lang="ts">
	import DocToolbar from '$lib/docs/components/doc-toolbar/doc-toolbar.svelte';
	import CodeCopy from '$lib/docs/components/code-copy/code-copy.svelte';

	let { data } = $props();
</script>

<!-- This page declares no head tags on purpose: they are rendered once, in the
     root layout, from the `seo` this page's load returns. -->

<article class="hd-prose relative mx-auto">
	<!-- Pinned top-right so it sits beside the page title (the first block the
	     markdown renders); positioned against the relative article. -->
	<DocToolbar />
	<data.content />
	<!-- Renders nothing: hangs a copy button on each code block this page rendered. -->
	<CodeCopy />
</article>
