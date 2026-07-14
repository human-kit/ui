<script lang="ts">
	import { Tabs as TabsPrimitive } from '@human-kit/ui';
	import type { ComponentProps, Snippet } from 'svelte';
	import { tabsRecipe } from './recipe';

	type Props = Omit<ComponentProps<typeof TabsPrimitive.List>, 'class' | 'children'> & {
		class?: string;
		children?: Snippet;
	};

	let { class: className = '', children, ...listProps }: Props = $props();

	const recipe = tabsRecipe();
</script>

<TabsPrimitive.List class={recipe.list({ class: className })} {...listProps}>
	{@render children?.()}
</TabsPrimitive.List>
