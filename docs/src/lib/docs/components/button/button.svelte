<script lang="ts">
	import { Button } from '@human-kit/svelte-components';
	import { LoaderCircle } from '@lucide/svelte';
	import type { ComponentProps, Snippet } from 'svelte';
	import type { VariantProps } from 'tailwind-variants';

	import { buttonVariants } from './recipe';

	type Props = Omit<ComponentProps<typeof Button.Root>, 'class' | 'children'> &
		VariantProps<typeof buttonVariants> & {
			class?: string;
			children?: Snippet;
		};

	let {
		variant = 'default',
		size = 'default',
		class: className = '',
		children,
		disabled = false,
		pending = false,
		pressed,
		...restProps
	}: Props = $props();
</script>

<Button.Root
	class={buttonVariants({ variant, size, class: className })}
	disabled={disabled || pending}
	{pending}
	{pressed}
	{...restProps}
>
	{#if children}
		<span
			class={variant === 'link' ? 'contents' : 'inline-flex min-w-0 items-center gap-1.5'}
			class:invisible={pending}
		>
			{@render children()}
		</span>
	{/if}

	{#if pending}
		<span class="absolute inset-0 flex items-center justify-center">
			<LoaderCircle class="animate-spin" />
		</span>
	{/if}
</Button.Root>
