<script lang="ts">
	import { Menu } from '@human-kit/svelte-components';
	import type { ComponentProps, Snippet } from 'svelte';
	import { menuRecipe } from './recipe';

	type Props = Omit<ComponentProps<typeof Menu.GroupLabel>, 'children' | 'class'> & {
		class?: string;
		children?: Snippet;
	};

	let { class: className = '', children, ...labelProps }: Props = $props();

	const recipe = menuRecipe();
</script>

<Menu.GroupLabel class={recipe.groupLabel({ class: className })} {...labelProps}>
	{#if children}
		{@render children()}
	{/if}
</Menu.GroupLabel>
