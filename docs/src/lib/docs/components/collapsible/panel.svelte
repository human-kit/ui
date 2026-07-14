<script lang="ts">
	import { Collapsible } from '@human-kit/svelte-components';
	import type { ComponentProps, Snippet } from 'svelte';
	import { collapsibleRecipe } from './recipe';

	// Bakes the shared open/close animation; callers add only their own extras
	// (borders, padding, type styles) via `class`.
	type Props = Omit<ComponentProps<typeof Collapsible.Panel>, 'children' | 'class'> & {
		class?: string;
		children?: Snippet;
	};

	let { class: className = '', children, ...panelProps }: Props = $props();

	const recipe = collapsibleRecipe();
</script>

<Collapsible.Panel class={recipe.panel({ class: className })} {...panelProps}>
	{#if children}
		{@render children()}
	{/if}
</Collapsible.Panel>
