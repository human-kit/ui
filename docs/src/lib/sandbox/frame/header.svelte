<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { frameRecipe } from './recipe';

	type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
		class?: string;
		children?: Snippet;
	};

	let { class: className = '', children, ...restProps }: Props = $props();

	const recipe = frameRecipe();
</script>

<div class={recipe.header({ class: className })} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</div>
