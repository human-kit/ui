<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ButtonRoot } from '../../button/index.js';
	import { useTooltipContext } from '../root/context';
	import type { TooltipTriggerProps, TooltipTriggerRenderState } from '../types';

	/**
	 * Tooltip.Trigger — the button that the tooltip describes.
	 *
	 * The interaction lives in the root, on the element. This part renders the button, gives it
	 * to the root, and points at the content with `aria-describedby` while the content is in the
	 * DOM. Thus a screen reader reads the description after the name of the button.
	 */
	let {
		children,
		class: className = '',
		element = $bindable<HTMLButtonElement | null>(null),
		'aria-describedby': ariaDescribedBy,
		...restProps
	}: TooltipTriggerProps = $props();

	const ctx = useTooltipContext('Tooltip.Trigger');

	let buttonRef: HTMLButtonElement | null = $state(null);

	$effect(() => {
		element = buttonRef;
		ctx.setTriggerRef(buttonRef);
		return () => {
			ctx.setTriggerRef(null);
		};
	});

	const describedBy = $derived(
		ctx.isOpen ? [ariaDescribedBy, ctx.contentId].filter(Boolean).join(' ') : ariaDescribedBy
	);
	const renderState = $derived<TooltipTriggerRenderState>({ open: ctx.isOpen });
</script>

<ButtonRoot
	{...restProps}
	bind:element={buttonRef}
	class={className}
	type="button"
	aria-describedby={describedBy || undefined}
	data-tooltip-trigger="true"
	data-state={ctx.isOpen ? 'open' : 'closed'}
>
	{#if children}
		{@render (children as Snippet<[TooltipTriggerRenderState]>)(renderState)}
	{/if}
</ButtonRoot>
