<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { drawerStack } from '../root/drawer-stack.svelte';

	/**
	 * Drawer.IndentBackground — the surface revealed behind an indented app.
	 *
	 * Pinned to the viewport and painted by the consumer (usually a dark colour that
	 * reads as "behind everything"). It exists as its own part because the indented
	 * wrapper cannot show what is behind it: scaling an element down reveals whatever
	 * its parent paints, and on a phone that is the page background, which is
	 * normally the same colour as the app.
	 */
	type DrawerIndentBackgroundProps = {
		/** CSS class for the layer. */
		class?: string;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class'>;

	let {
		class: className = '',
		style: styleProp,
		...restProps
	}: DrawerIndentBackgroundProps = $props();

	const progress = $derived(drawerStack.indentProgress);
	const anyOpen = $derived(drawerStack.count > 0);
</script>

<div
	class={className}
	data-drawer-indent-background
	data-state={anyOpen ? 'open' : 'closed'}
	aria-hidden="true"
	style="position: fixed; inset: 0; --drawer-indent-progress: {progress}; {styleProp ?? ''}"
	{...restProps}
></div>
