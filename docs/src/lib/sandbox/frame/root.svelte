<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { frameRecipe } from './recipe';

	type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'style'> & {
		class?: string;
		children?: Snippet;
		outerSpacing?: number;
		style?: string;
	};

	let {
		class: className = '',
		children,
		outerSpacing = 4,
		style = '',
		...restProps
	}: Props = $props();

	const recipe = frameRecipe();
	const rootStyle = $derived(`padding: ${outerSpacing}px;${style ? ` ${style}` : ''}`);
</script>

<div class={recipe.root({ class: className })} style={rootStyle} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</div>
