<script lang="ts">
	import { Tabs as TabsPrimitive } from '@human-kit/ui';
	import type { ComponentProps, Snippet } from 'svelte';
	import { tabsRecipe } from './recipe';

	type Props = Omit<ComponentProps<typeof TabsPrimitive.Root>, 'class' | 'children'> & {
		class?: string;
		children?: Snippet;
	};

	let { class: className = '', children, value = $bindable(), ...rootProps }: Props = $props();

	const recipe = tabsRecipe();
</script>

<TabsPrimitive.Root bind:value class={recipe.root({ class: className })} {...rootProps}>
	{@render children?.()}
</TabsPrimitive.Root>
