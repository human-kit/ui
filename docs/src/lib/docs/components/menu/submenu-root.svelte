<script lang="ts">
	import { Menu } from '@human-kit/ui';
	import type { ComponentProps, Snippet } from 'svelte';

	type Props = Omit<ComponentProps<typeof Menu.SubmenuRoot>, 'children'> & {
		children?: Snippet;
	};

	let { children, open = $bindable(), ...rootProps }: Props = $props();
</script>

<Menu.SubmenuRoot bind:open {...rootProps}>
	{#if children}
		{@render children()}
	{/if}
</Menu.SubmenuRoot>
