<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { requireDrawerContext } from '../root/context';
	import { getDrawerPresenceContext } from '../root/presence-context';
	import { createStartingStyle } from '../root/starting-style.svelte';
	import { getOverlayZIndex } from '../../primitives/layer-stack';

	/**
	 * Drawer.Overlay — the backdrop behind the panel.
	 * Belongs inside a Drawer.Portal.
	 */
	type DrawerOverlayProps = {
		/** CSS class for the overlay. */
		class?: string;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class'>;

	let { class: className = '', style: styleProp, ...restProps }: DrawerOverlayProps = $props();

	const ctx = requireDrawerContext('Drawer.Overlay');

	// Present only inside Drawer.Portal. Mirrors the panel's enter/exit phase so the
	// backdrop can fade in step with it.
	const presence = getDrawerPresenceContext();
	// Mounts as the drawer opens, so its first frame is the one to fade in from.
	const startingStyle = createStartingStyle();

	const zIndex = $derived(getOverlayZIndex(ctx.stackLevel));

	/**
	 * A drawer opened on top of another does not paint its own backdrop.
	 *
	 * Every root brings its own overlay, so stacking two of them dimmed the page
	 * twice — the second drawer visibly darkened everything behind it, the drawer it
	 * opened from included. The backdrop belongs to the stack rather than to each
	 * layer, so only the drawer at the back paints one and the rest defer to it.
	 *
	 * Hidden rather than unmounted: if the drawer underneath closes first, this one
	 * becomes the back of the stack and has to take the backdrop over.
	 */
	const isStackedAbove = $derived(ctx.stackIndex > 0);

	// The backdrop tracks the drag: a sheet pulled halfway down should reveal half
	// the page behind it. The consumer decides how to use it (usually
	// `opacity: calc(1 - var(--drawer-swipe-progress))`); publishing it here keeps
	// the backdrop in sync with a gesture that Drawer.Content owns.
	// A consumer `style` is appended rather than spread through `restProps`, which
	// would land after this attribute and drop the positioning with it.
	const style = $derived(
		`position: fixed; inset: 0; z-index: ${zIndex}; --drawer-swipe-progress: ${ctx.swipeProgress};` +
			(isStackedAbove ? ' display: none;' : '') +
			` ${styleProp ?? ''}`
	);
</script>

<div
	class={className}
	data-drawer-overlay
	data-state={presence ? presence.state : 'open'}
	data-entering={presence?.isEntering || undefined}
	data-exiting={presence?.isExiting || undefined}
	data-starting-style={startingStyle.active || undefined}
	data-swiping={ctx.isSwiping || undefined}
	data-nested={isStackedAbove || undefined}
	data-side={ctx.side}
	{style}
	{...restProps}
></div>
