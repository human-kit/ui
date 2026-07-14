<script lang="ts">
	import { Menu } from '@human-kit/svelte-components';
	import type { ComponentProps, Snippet } from 'svelte';
	import { menuRecipe } from './recipe';

	type Props = Omit<ComponentProps<typeof Menu.Item>, 'children' | 'class'> & {
		class?: string;
		children?: Snippet;
	};

	let { class: className = '', children, ...itemProps }: Props = $props();

	const recipe = menuRecipe();
</script>

<Menu.Item class={recipe.item({ class: className })} {...itemProps}>
	{#if children}
		{@render children()}
	{/if}
</Menu.Item>
