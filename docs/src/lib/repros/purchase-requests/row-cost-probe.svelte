<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		rowId: string | number;
		onMeasure?: (rowId: string | number, timestamp: number) => void;
	};

	let { rowId, onMeasure }: Props = $props();

	onMount(() => {
		onMeasure?.(rowId, performance.now());
	});
</script>
