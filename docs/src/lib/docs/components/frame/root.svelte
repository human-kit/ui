<script lang="ts">
	import type { Snippet } from 'svelte';
	import Surface from '../surface/surface.svelte';
	import { frameRecipe } from './recipe';

	interface Props {
		class?: string;
		/** Elevation level of the frame chrome (header + rails). Defaults to 1. */
		level?: number;
		children: Snippet;
	}

	let { class: className = '', level = 1, children }: Props = $props();

	const recipe = frameRecipe();
</script>

<Surface {level} class={recipe.root({ class: className })}>
	{@render children()}
</Surface>
