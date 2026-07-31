<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { SWIPE_IGNORE_ATTRIBUTE } from '../../primitives/swipe-gesture';

	/**
	 * Drawer.Body — the content region inside the panel.
	 *
	 * Two things happen here that do not happen on the panel itself:
	 *
	 * 1. `overscroll-behavior: contain`, so a scroll that reaches the end of the body
	 *    does not chain out to the page behind the drawer.
	 * 2. The drawer cannot be dragged from it. At all, by any pointer — not "it can
	 *    but it resists", which still moves the panel a little and springs it back.
	 *
	 * On the second: Base UI scopes the equivalent rule to a mouse, on the reasoning
	 * that a finger has no drag-to-select to compete with. That leaves the same
	 * square of the panel behaving three different ways depending on the pointer, the
	 * region and the direction of travel, and nobody can build a mental model of
	 * that. One rule instead: the body is content, the panel around it — grab bar,
	 * header, padding — is the handle. Which is also how the sheets people already
	 * know behave.
	 *
	 * Bring your own `overflow`: whether the body scrolls is a layout decision, and
	 * forcing it here would fight consumers whose panel sizes to its content.
	 */
	type DrawerBodyProps = {
		/** Content of the body region. */
		children?: Snippet;
		/** CSS class for the body. */
		class?: string;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'>;

	let { children, class: className = '', ...restProps }: DrawerBodyProps = $props();
</script>

<div
	class={className}
	data-drawer-body
	{...{ [SWIPE_IGNORE_ATTRIBUTE]: '' }}
	style="overscroll-behavior: contain;"
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</div>
