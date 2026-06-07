<script lang="ts">
	import { createCollapseTransition } from './collapse-transition.svelte';

	let { initialOpen = false, forceMount = false }: { initialOpen?: boolean; forceMount?: boolean } =
		$props();

	let open = $state((() => initialOpen)());
	let panelRef = $state<HTMLDivElement | null>(null);

	const collapse = createCollapseTransition(
		() => open,
		() => forceMount
	);

	$effect(() => {
		collapse.setPanel(panelRef);
	});
</script>

<button data-testid="toggle" type="button" onclick={() => (open = !open)}>toggle</button>

<div
	bind:this={panelRef}
	data-testid="panel"
	data-mounted={collapse.mounted}
	data-status={collapse.status ?? 'idle'}
	style="overflow: hidden; transition: height 120ms; height: {collapse.status === 'starting' ||
	collapse.status === 'ending'
		? 0
		: (collapse.height ?? 0)}px"
>
	{#if collapse.mounted}
		<div style="height: 40px">content</div>
	{/if}
</div>
