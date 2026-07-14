<script lang="ts">
	import type { AccordionPanelProps } from '../types.js';
	import { createCollapseTransition } from '../../primitives/collapse-transition.svelte';
	import { useAccordionContext } from '../root/context.svelte';
	import { useAccordionItemContext } from '../item/context';

	let {
		forceMount = false,
		region = true,
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		...restProps
	}: AccordionPanelProps = $props();

	const accordion = useAccordionContext();
	const item = useAccordionItemContext();

	const panelId = $derived(accordion.getPanelId(item.value));
	const triggerId = $derived(accordion.getTriggerId(item.value));

	let panelRef: HTMLDivElement | null = $state(null);
	// Natural-height wrapper around the content: the panel carries the animated, pinned
	// `height` + `overflow: hidden`, so it's this inner element that must be observed for the
	// measured size to track content that grows or shrinks while the panel stays open.
	let contentRef: HTMLDivElement | null = $state(null);

	const open = $derived(accordion.isOpen(item.value));
	const orientation = $derived(accordion.orientation);

	const collapse = createCollapseTransition(
		() => open,
		() => forceMount
	);

	$effect(() => {
		collapse.setPanel(panelRef, contentRef);
		element = panelRef;
	});
</script>

<!--
	Base UI-style collapse: the panel is `hidden` only at rest (closed and not animating), so
	`[hidden] { display: none }` never fights an in-flight animation. `data-starting-style` /
	`data-ending-style` drive the enter/exit transition, and `--accordion-panel-height` / `-width`
	carry the measured content size to animate a real `height`/`width`. `inert` keeps the collapsed
	panel out of focus order and the accessibility tree.
-->
<div
	{...restProps}
	bind:this={panelRef}
	id={panelId}
	role={region ? 'region' : undefined}
	aria-labelledby={triggerId}
	hidden={(!open && collapse.status !== 'ending') || undefined}
	inert={!open}
	class={className}
	data-accordion-panel="true"
	data-accordion-value={String(item.value)}
	data-accordion-value-type={typeof item.value}
	data-open={open || undefined}
	data-closed={!open || undefined}
	data-starting-style={collapse.status === 'starting' || undefined}
	data-ending-style={collapse.status === 'ending' || undefined}
	data-orientation={orientation}
	style:--accordion-panel-height={collapse.height !== undefined
		? `${collapse.height}px`
		: undefined}
	style:--accordion-panel-width={collapse.width !== undefined ? `${collapse.width}px` : undefined}
>
	{#if collapse.mounted}
		<div bind:this={contentRef} data-accordion-panel-content="true">
			{@render children?.()}
		</div>
	{/if}
</div>
