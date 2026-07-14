<script lang="ts">
	import { Menu, getMenuContext } from '@human-kit/svelte-components';
	import type { ComponentProps, Snippet } from 'svelte';
	import { menuRecipe } from './recipe';

	type Props = Omit<ComponentProps<typeof Menu.Content>, 'children' | 'class'> & {
		class?: string;
		children?: Snippet;
		/** Render the dimming backdrop behind the menu. Defaults to `true`. */
		overlay?: boolean;
	};

	let {
		offset = 4,
		overlay = true,
		class: className = '',
		children,
		...contentProps
	}: Props = $props();

	const recipe = menuRecipe();

	// Only the root menu gets a backdrop — a submenu shares the root's, so rendering a second
	// overlay would just stack another dim layer over the same screen.
	const ctx = getMenuContext();
	const isRootMenu = ctx ? ctx.parent === null : true;
</script>

{#if overlay && isRootMenu}
	<Menu.Overlay class={recipe.overlay()} />
{/if}

<Menu.Content {offset} class={recipe.content({ class: className })} {...contentProps}>
	{#if children}
		{@render children()}
	{/if}
</Menu.Content>
