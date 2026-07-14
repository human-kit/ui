<script lang="ts">
	import { Menu } from '@human-kit/svelte-components';
	import type { ComponentProps, Snippet } from 'svelte';
	import { menuRecipe } from './recipe';

	type Props = Omit<ComponentProps<typeof Menu.SubmenuTrigger>, 'children' | 'class'> & {
		class?: string;
		children?: Snippet;
	};

	let { class: className = '', children, ...triggerProps }: Props = $props();

	const recipe = menuRecipe();
</script>

<Menu.SubmenuTrigger class={recipe.submenuTrigger({ class: className })} {...triggerProps}>
	{#if children}
		{@render children()}
	{/if}
</Menu.SubmenuTrigger>
