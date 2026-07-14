<script lang="ts">
	import type { Snippet } from 'svelte';
	import { frameRecipe } from './recipe';
	import { scrollFade } from './scroll-fade';

	interface Props {
		class?: string;
		children: Snippet;
	}

	// A side rail is transparent: it sits directly on the frame chrome (the root's
	// level), so no bg of its own — width and responsive visibility come from the
	// caller via `class`.
	let { class: className = '', children }: Props = $props();

	const recipe = frameRecipe();
</script>

<!-- `scroll-fade` + the `scrollFade` action soften the top/bottom edges so nav
     content dissolves into the chrome instead of being hard-cut when scrolled.
     The two edge overlays are sticky children (see theme.css) — a compositor-cheap
     alternative to masking the scroller, which would re-raster on every frame. -->
<aside class={recipe.sidebar({ class: `scroll-fade ${className}` })} use:scrollFade>
	<div class="scroll-fade-edge scroll-fade-edge-top" aria-hidden="true"></div>
	{@render children()}
	<div class="scroll-fade-edge scroll-fade-edge-bottom" aria-hidden="true"></div>
</aside>
