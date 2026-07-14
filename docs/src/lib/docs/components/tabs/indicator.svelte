<script lang="ts">
	import { Tabs as TabsPrimitive } from '@human-kit/ui';
	import type { ComponentProps, Snippet } from 'svelte';
	import { tabsRecipe } from './recipe';

	type Props = Omit<ComponentProps<typeof TabsPrimitive.Indicator>, 'class' | 'children'> & {
		class?: string;
		children?: Snippet;
	};

	let { class: className = '', children, ...indicatorProps }: Props = $props();

	const recipe = tabsRecipe();
</script>

<TabsPrimitive.Indicator class={recipe.indicator({ class: className })} {...indicatorProps}>
	{@render children?.()}
</TabsPrimitive.Indicator>
