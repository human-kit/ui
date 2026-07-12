<script lang="ts">
	import type { Snippet } from 'svelte';
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
</script>

<Surface as="main" {level} class={recipe.content({ class: className })}>
	<div class={recipe.viewport()}>
		{@render children()}
	</div>
</Surface>
