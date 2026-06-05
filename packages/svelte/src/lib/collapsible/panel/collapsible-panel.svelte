<script lang="ts">
	import type { CollapsiblePanelProps } from '../types.js';
	import { useCollapsibleContext } from '../root/context';

	let {
		forceMount = false,
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		...restProps
	}: CollapsiblePanelProps = $props();

	const collapsible = useCollapsibleContext();

	let panelRef: HTMLDivElement | null = $state(null);
	const shouldRender = $derived(collapsible.isOpen || forceMount);

	$effect(() => {
		element = panelRef;
	});
</script>

<div
	{...restProps}
	bind:this={panelRef}
	id={collapsible.panelId}
	hidden={!collapsible.isOpen || undefined}
	inert={!collapsible.isOpen}
	class={className}
	data-collapsible-panel="true"
	data-open={collapsible.isOpen || undefined}
	data-hidden={!collapsible.isOpen || undefined}
>
	{#if shouldRender}
		{@render children?.()}
	{/if}
</div>
