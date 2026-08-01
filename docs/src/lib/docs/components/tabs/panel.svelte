<script lang="ts">
	import { Tabs as TabsPrimitive } from '@human-kit/ui';
	import type { ComponentProps, Snippet } from 'svelte';
	import { tabsRecipe } from './recipe';

	type Props = Omit<ComponentProps<typeof TabsPrimitive.Panel>, 'class' | 'children'> & {
		class?: string;
		children?: Snippet;
	};

	let { class: className = '', children, ...panelProps }: Props = $props();

	const recipe = tabsRecipe();
</script>

<TabsPrimitive.Panel class={recipe.panel({ class: className })} {...panelProps}>
	{@render children?.()}
</TabsPrimitive.Panel>
