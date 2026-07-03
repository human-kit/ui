<script lang="ts">
	import type { CollapsiblePanelProps } from '../types.js';
	import { createCollapseTransition } from '../../primitives/collapse-transition.svelte';
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
	// Natural-height wrapper around the content: the panel carries the animated, pinned
	// `height` + `overflow: hidden`, so it's this inner element that must be observed for the
	// measured size to track content that grows or shrinks while the panel stays open.
	let contentRef: HTMLDivElement | null = $state(null);

	const collapse = createCollapseTransition(
		() => collapsible.isOpen,
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
	`data-ending-style` drive the enter/exit transition, and `--collapsible-panel-height` / `-width`
	carry the measured content size to animate a real `height`/`width`. `inert` keeps the collapsed
	panel out of focus order and the accessibility tree.
-->
<div
	{...restProps}
	bind:this={panelRef}
	id={collapsible.panelId}
	hidden={(!collapsible.isOpen && collapse.status !== 'ending') || undefined}
	inert={!collapsible.isOpen}
	class={className}
	data-collapsible-panel="true"
	data-open={collapsible.isOpen || undefined}
	data-closed={!collapsible.isOpen || undefined}
	data-starting-style={collapse.status === 'starting' || undefined}
	data-ending-style={collapse.status === 'ending' || undefined}
	style:--collapsible-panel-height={collapse.height !== undefined
		? `${collapse.height}px`
		: undefined}
	style:--collapsible-panel-width={collapse.width !== undefined ? `${collapse.width}px` : undefined}
>
	{#if collapse.mounted}
		<div bind:this={contentRef} data-collapsible-panel-content="true">
			{@render children?.()}
		</div>
	{/if}
</div>
