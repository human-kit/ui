<script lang="ts">
	import { Menu } from '@human-kit/svelte-components';
	import type { ComponentProps } from 'svelte';
	import { menuRecipe } from './recipe';

	type Props = Omit<ComponentProps<typeof Menu.Separator>, 'class'> & {
		class?: string;
	};

	let { class: className = '', ...separatorProps }: Props = $props();

	const recipe = menuRecipe();
</script>

<Menu.Separator class={recipe.separator({ class: className })} {...separatorProps} />
