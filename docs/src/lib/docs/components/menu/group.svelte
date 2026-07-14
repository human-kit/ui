<script lang="ts">
	import { Menu } from '@human-kit/svelte-components';
	import type { ComponentProps, Snippet } from 'svelte';
	import { menuRecipe } from './recipe';

	type Props = Omit<ComponentProps<typeof Menu.Group>, 'children' | 'class'> & {
		class?: string;
		children?: Snippet;
	};

	let { class: className = '', children, ...groupProps }: Props = $props();

	const recipe = menuRecipe();
</script>

<Menu.Group class={recipe.group({ class: className })} {...groupProps}>
	{#if children}
		{@render children()}
	{/if}
</Menu.Group>
