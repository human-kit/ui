<script lang="ts">
	import { onDestroy } from 'svelte';

	type Props = {
		/** Shared log, so the parent can assert who tore down first. */
		record: (step: string) => void;
	};

	let { record }: Props = $props();

	// Stands in for `Toggle.Root`, which unregisters from `onDestroy`.
	onDestroy(() => record('child-destroy'));
</script>
