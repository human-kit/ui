<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getPopoverTriggerContext } from '../root/context';

	type PopoverTriggerButtonProps = {
		/** Button content */
		children?: Snippet;
		/** Additional class */
		class?: string;
		/** Any other props */
		[key: string]: unknown;
	};

	let { children, class: className = '', ...restProps }: PopoverTriggerButtonProps = $props();

	let buttonRef: HTMLButtonElement | null = $state(null);
	const ctx = getPopoverTriggerContext();

	$effect(() => {
		if (buttonRef && ctx) {
			ctx.setTriggerRef(buttonRef);
		}
	});

	function handleClick() {
		ctx?.toggle();
	}
</script>

<button
	bind:this={buttonRef}
	class={className}
	type="button"
	aria-expanded={ctx?.isOpen ?? false}
	aria-haspopup="dialog"
	onclick={handleClick}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</button>
