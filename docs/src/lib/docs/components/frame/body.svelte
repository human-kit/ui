<script lang="ts">
	import type { Snippet } from 'svelte';
	import { frameRecipe } from './recipe';

	interface Props {
		class?: string;
		children: Snippet;
	}

	let { class: className = '', children }: Props = $props();

	const recipe = frameRecipe();
</script>

<div class={recipe.body({ class: className })}>
	{@render children()}
</div>
