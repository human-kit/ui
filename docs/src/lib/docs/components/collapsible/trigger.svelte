<script lang="ts">
	import { Collapsible } from '@human-kit/svelte-components';
	import type { ComponentProps, Snippet } from 'svelte';

	// Pass-through: triggers differ per usage (a ghost button, a nav header, a table
	// row), and their chevron/icon rotates differently, so nothing is baked in.
	type Props = Omit<ComponentProps<typeof Collapsible.Trigger>, 'children'> & {
		children?: Snippet;
	};

	let { children, ...triggerProps }: Props = $props();
</script>

<Collapsible.Trigger {...triggerProps}>
	{#if children}
		{@render children()}
	{/if}
</Collapsible.Trigger>
