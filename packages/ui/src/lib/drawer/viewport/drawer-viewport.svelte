<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { requireDrawerContext } from '../root/context';
	import { getDrawerPresenceContext } from '../root/presence-context';
	import { markDrawerViewport } from '../root/viewport-context';
	import { getContentZIndex } from '../../primitives/layer-stack';
	import type { DrawerSide } from '../root/types';

	/**
	 * Drawer.Viewport — the positioning layer that pins the panel to its edge.
	 * Belongs inside a Drawer.Portal, wrapping a Drawer.Content.
	 */
	type DrawerViewportProps = {
		/** The panel this viewport places. */
		children?: Snippet;
		/** CSS class for the viewport. */
		class?: string;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'>;

	let {
		children,
		class: className = '',
		style: styleProp,
		...restProps
	}: DrawerViewportProps = $props();

	const ctx = requireDrawerContext('Drawer.Viewport');
	const presence = getDrawerPresenceContext();

	// Tells the Content inside to stay in flow instead of pinning itself.
	markDrawerViewport();

	const zIndex = $derived(getContentZIndex(ctx.stackLevel));

	/**
	 * The viewport spans the whole screen so the panel can be aligned with flexbox
	 * and still size itself to its content. It is transparent to pointers — only the
	 * panel inside it takes them — so a non-modal drawer leaves the rest of the page
	 * fully usable, and a modal one relies on Drawer.Overlay to block instead.
	 */
	function layoutFor(side: DrawerSide): string {
		const vertical = side === 'top' || side === 'bottom';
		const direction = vertical ? 'column' : 'row';
		const justify = side === 'bottom' || side === 'right' ? 'flex-end' : 'flex-start';
		return `flex-direction: ${direction}; justify-content: ${justify}; align-items: stretch;`;
	}

	// A consumer `style` is appended rather than spread through `restProps`, which
	// would land after this attribute and drop the positioning with it.
	const style = $derived(
		`position: fixed; inset: 0; z-index: ${zIndex}; display: flex; pointer-events: none; ${layoutFor(ctx.side)} ${styleProp ?? ''}`
	);
</script>

<div
	class={className}
	data-drawer-viewport
	data-side={ctx.side}
	data-state={presence ? presence.state : 'open'}
	data-entering={presence?.isEntering || undefined}
	data-exiting={presence?.isExiting || undefined}
	{style}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</div>
