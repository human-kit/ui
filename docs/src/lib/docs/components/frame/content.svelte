<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import Surface from '../surface/surface.svelte';
	import { frameRecipe } from './recipe';

	interface Props {
		class?: string;
		/** The reading pane sits at level 0 by default — the cleanest plane. */
		level?: number;
		children: Snippet;
	}

	let { class: className = '', level = 0, children }: Props = $props();

	const recipe = frameRecipe();

	// This pane — not the window — is the scroll container (the frame is a fixed
	// shell), so SvelteKit's built-in scroll handling never reaches it. On any URL
	// change (initial load, page navigation, an in-page fragment link, or back /
	// forward), scroll to the fragment if there is one — `scrollIntoView` walks
	// nested scrollers and honours the headings' `scroll-margin-top` — otherwise
	// reset the pane to the top. Reading `page.url` (a fresh object per navigation)
	// re-runs this after the new content has rendered.
	let viewport = $state<HTMLElement | null>(null);

	$effect(() => {
		const { hash } = page.url;
		const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
		if (target) target.scrollIntoView();
		else viewport?.scrollTo(0, 0);
	});
</script>

<Surface as="main" {level} class={recipe.content({ class: className })}>
	<div bind:this={viewport} class={recipe.viewport()}>
		{@render children()}
	</div>
</Surface>
