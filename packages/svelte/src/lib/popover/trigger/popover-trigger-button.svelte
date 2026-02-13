<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getPopoverTriggerContext } from '../root/context';

	type PopoverTriggerButtonProps = Omit<
		HTMLButtonAttributes,
		// Keep the trigger semantics stable
		'type' | 'class' | 'children' | 'onclick' | 'aria-haspopup' | 'aria-expanded'
	> & {
		/** Button content */
		children?: Snippet;
		/** Additional class */
		class?: string;
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
