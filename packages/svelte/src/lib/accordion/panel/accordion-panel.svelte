<script lang="ts">
	import type { AccordionPanelProps } from '../types.js';
	import { useAccordionContext } from '../root/context';
	import { useAccordionItemContext } from '../item/context';

	let {
		forceMount = false,
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		...restProps
	}: AccordionPanelProps = $props();

	const accordion = useAccordionContext();
	const item = useAccordionItemContext();
	const stateVersion = accordion.stateVersion;

	const panelId = $derived(accordion.getPanelId(item.value));
	const triggerId = $derived(accordion.getTriggerId(item.value));

	let panelRef: HTMLDivElement | null = $state(null);

	const open = $derived.by(() => {
		void $stateVersion;
		return accordion.isOpen(item.value);
	});
	const orientation = $derived.by(() => {
		void $stateVersion;
		return accordion.orientation;
	});
	const shouldRender = $derived(open || forceMount);

	$effect(() => {
		element = panelRef;
	});
</script>

<div
	{...restProps}
	bind:this={panelRef}
	id={panelId}
	role="region"
	aria-labelledby={triggerId}
	hidden={!open || undefined}
	inert={!open}
	class={className}
	data-accordion-panel="true"
	data-accordion-value={String(item.value)}
	data-accordion-value-type={typeof item.value}
	data-open={open || undefined}
	data-hidden={!open || undefined}
	data-orientation={orientation}
>
	{#if shouldRender}
		{@render children?.()}
	{/if}
</div>
