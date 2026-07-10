<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { useTabsContext } from '../root/context.svelte';
	import type { TabsPanelProps } from '../types.js';

	let {
		value,
		forceMount = false,
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		tabindex = 0,
		...restProps
	}: TabsPanelProps = $props();

	const tabs = useTabsContext();
	const panelId = $derived(tabs.getPanelId(value));
	const tabId = $derived(tabs.getTabId(value));

	let panelRef: HTMLDivElement | null = $state(null);
	let registeredValue = untrack(() => value);

	untrack(() => {
		tabs.registerPanel(registeredValue);
	});

	const active = $derived(tabs.isSelected(value));
	const shouldRender = $derived(active || forceMount);

	$effect(() => {
		if (!Object.is(registeredValue, value)) {
			tabs.unregisterPanel(registeredValue);
			registeredValue = value;
		}
		element = panelRef;
		if (panelRef) {
			tabs.registerPanel(registeredValue, panelRef);
		}
	});

	onDestroy(() => {
		tabs.unregisterPanel(registeredValue);
	});
</script>

<div
	{...restProps}
	bind:this={panelRef}
	id={panelId}
	role="tabpanel"
	aria-labelledby={tabId}
	{tabindex}
	hidden={!active || undefined}
	inert={!active}
	class={className}
	data-tabs-panel="true"
	data-tabs-value={String(value)}
	data-tabs-value-type={typeof value}
	data-selected={active || undefined}
	data-hidden={!active || undefined}
>
	{#if shouldRender}
		{@render children?.()}
	{/if}
</div>
