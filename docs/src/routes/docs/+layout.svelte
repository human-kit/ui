<script lang="ts">
	import { DocsShell } from '$lib/docs/components/index.js';
	import { nav } from '$lib/docs/nav.js';

	let { children } = $props();
</script>

<DocsShell
	{nav}
	title="svelte-components"
	badge="beta"
	githubUrl="https://github.com/Agustin-Delgado/svelte-components"
>
	{@render children()}
</DocsShell>
