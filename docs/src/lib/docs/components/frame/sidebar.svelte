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
     content dissolves into the chrome instead of being hard-cut when scrolled. -->
<aside class={recipe.sidebar({ class: `scroll-fade ${className}` })} use:scrollFade>
	{@render children()}
</aside>
