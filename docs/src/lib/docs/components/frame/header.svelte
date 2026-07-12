<script lang="ts">
	import type { Snippet } from 'svelte';
	import Surface from '../surface/surface.svelte';
	import { frameRecipe } from './recipe';

	interface Props {
		class?: string;
		/** Matches the frame chrome by default (same level as the root). */
		level?: number;
		children: Snippet;
	}

	let { class: className = '', level = 1, children }: Props = $props();

	const recipe = frameRecipe();
</script>

<Surface as="header" {level} class={recipe.header({ class: className })}>
	{@render children()}
</Surface>
