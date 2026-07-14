<script lang="ts">
	import { DocsShell } from '$lib/docs/components/index.js';
	import { nav } from '$lib/docs/nav.js';

	let { children } = $props();
</script>

<DocsShell {nav} title="@human-kit/ui" badge="beta" githubUrl="https://github.com/human-kit/ui">
	{@render children()}
</DocsShell>
