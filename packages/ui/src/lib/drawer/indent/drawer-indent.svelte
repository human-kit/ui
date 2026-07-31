<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { drawerStack } from '../root/drawer-stack.svelte';

	/**
	 * Drawer.Indent — wraps the app UI so it can pull back while a drawer is open.
	 *
	 * It applies no transform of its own: what "indented" looks like (a scale, a
	 * corner radius, a translation) is a design decision, so this part only
	 * publishes the state and the consumer's CSS reads it. That keeps the effect
	 * consistent with every other part of the library, where the panel's appearance
	 * belongs to the page and only the behaviour lives here.
	 *
	 * ```css
	 * .Indent {
	 *   transition: scale 400ms, border-radius 400ms;
	 *   scale: calc(1 - 0.05 * var(--drawer-indent-progress));
	 *   border-radius: calc(12px * var(--drawer-indent-progress));
	 * }
	 * .Indent[data-swiping] { transition: none; }
	 * ```
	 *
	 * Unlike Base UI this needs no provider around it: the drawer stack is already
	 * module-global, so there is nothing left for one to coordinate.
	 */
	type DrawerIndentProps = {
		/** The app UI that pulls back while a drawer is open. */
		children?: Snippet;
		/** CSS class for the wrapper. */
		class?: string;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'>;

	let {
		children,
		class: className = '',
		style: styleProp,
		...restProps
	}: DrawerIndentProps = $props();

	// Falls back toward 0 as the frontmost drawer is dragged away, so the app comes
	// forward with the gesture rather than jumping when the drawer finally closes.
	const progress = $derived(drawerStack.indentProgress);
	const anyOpen = $derived(drawerStack.count > 0);
	const swiping = $derived(drawerStack.isSwiping);
</script>

<div
	class={className}
	data-drawer-indent
	data-state={anyOpen ? 'open' : 'closed'}
	data-swiping={swiping || undefined}
	style="--drawer-indent-progress: {progress}; {styleProp ?? ''}"
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</div>
