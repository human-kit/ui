<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { frameRecipe } from './recipe';

	type Props = Omit<HTMLAttributes<HTMLElement>, 'children' | 'class'> & {
		class?: string;
		children?: Snippet;
	};

	let { class: className = '', children, ...restProps }: Props = $props();

	const recipe = frameRecipe();
</script>

<main class={recipe.content({ class: className })} {...restProps}>
	<div class="relative h-full w-full max-w-full min-w-0">
		{#if children}
			{@render children()}
		{/if}
	</div>
</main>
