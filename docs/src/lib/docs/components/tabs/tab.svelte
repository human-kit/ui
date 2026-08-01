<script lang="ts">
	import { Tabs as TabsPrimitive } from '@human-kit/ui';
	import type { ComponentProps, Snippet } from 'svelte';
	import { tabsRecipe } from './recipe';

	type Props = Omit<ComponentProps<typeof TabsPrimitive.Tab>, 'class' | 'children'> & {
		class?: string;
		children?: Snippet;
	};

	let { class: className = '', children, ...tabProps }: Props = $props();

	const recipe = tabsRecipe();
</script>

<TabsPrimitive.Tab class={recipe.tab({ class: className })} {...tabProps}>
	{@render children?.()}
</TabsPrimitive.Tab>
