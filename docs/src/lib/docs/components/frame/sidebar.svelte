<script lang="ts">
	import type { Snippet } from 'svelte';
	import { frameRecipe } from './recipe';

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

<aside class={recipe.sidebar({ class: className })}>
	{@render children()}
</aside>
