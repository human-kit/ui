<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonRoot } from '../../button/index.js';
	import { getPopoverContext } from '../root/context';

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
	const ctx = getPopoverContext();

	$effect(() => {
		if (buttonRef && ctx) {
			ctx.setTriggerRef(buttonRef);
		}
	});

	function handleClick(event: MouseEvent) {
		ctx?.toggle('trigger-press', event);
	}
</script>

<ButtonRoot
	bind:element={buttonRef}
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
</ButtonRoot>
