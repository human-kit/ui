<script lang="ts">
	import { Menu } from '@human-kit/svelte-components';
	import type { ComponentProps, Snippet } from 'svelte';
	import type { VariantProps } from 'tailwind-variants';
	import { buttonVariants } from '../button/recipe';

	type Props = Omit<ComponentProps<typeof Menu.Trigger>, 'class' | 'children'> &
		VariantProps<typeof buttonVariants> & {
			class?: string;
			children?: Snippet;
		};

	let {
		variant = 'outline',
		size = 'sm',
		class: className = '',
		children,
		...triggerProps
	}: Props = $props();
</script>

<Menu.Trigger class={buttonVariants({ variant, size, class: className })} {...triggerProps}>
	{#if children}
		{@render children()}
	{/if}
</Menu.Trigger>
