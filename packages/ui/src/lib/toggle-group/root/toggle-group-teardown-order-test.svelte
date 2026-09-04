<script lang="ts">
	import { onDestroy } from 'svelte';
	import TeardownOrderChild from './toggle-group-teardown-order-child.svelte';

	type Props = {
		/** Shared log, so the test can assert who tore down first. */
		record: (step: string) => void;
	};

	let { record }: Props = $props();

	// The ordering `ToggleGroup.Root` depends on, isolated from the group so a regression in
	// Svelte shows up here as a failing assumption rather than as a mystery in the group.
	// `$effect.pre` is created while this script runs — before anything below it exists — so
	// it is the first child effect and its cleanup runs first. `onDestroy` is this
	// component's own teardown, which Svelte runs only after every child is gone.
	$effect.pre(() => () => record('root-pre-cleanup'));
	onDestroy(() => record('root-destroy'));
</script>

<TeardownOrderChild {record} />
