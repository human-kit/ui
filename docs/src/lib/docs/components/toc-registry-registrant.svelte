<script lang="ts">
	// Test double for a content component (e.g. ApiReference) that surfaces its own
	// headings: registers during init and unregisters on effect teardown — the exact
	// lifecycle that made the registry drop entries on client-side page swaps.
	import { untrack } from 'svelte';
	import { registerHeadings, type RegisteredHeading } from './toc-registry.svelte.js';

	let { headings }: { headings: RegisteredHeading[] } = $props();

	const unregister = untrack(() => registerHeadings(headings));
	$effect(() => unregister);
</script>
