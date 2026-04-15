<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonRoot } from '../../button/index.js';
	import { useComboBoxContext } from '../root/context';

	type ComboBoxClearProps = HTMLButtonAttributes & {
		class?: string;
		children?: Snippet;
	};

	let { class: className, children, tabindex = -1, ...restProps }: ComboBoxClearProps = $props();

	const ctx = useComboBoxContext();
	const hasContent = $derived(ctx.displayValue.trim().length > 0 || ctx.selectedValue.size > 0);
	const isClearDisabled = $derived(
		ctx.isDisabled || ctx.isReadOnly || ctx.isPending || !hasContent
	);
	const ariaLabel = $derived(ctx.selectedValue.size > 0 ? 'Clear selection' : 'Clear input');

	function handleMouseDown(event: MouseEvent) {
		event.preventDefault();
	}

	function handleClick() {
		if (isClearDisabled) return;
		ctx.clearSelection();
		ctx.inputRef?.focus();
	}
</script>

<ButtonRoot
	type="button"
	{tabindex}
	aria-label={ariaLabel}
	isDisabled={ctx.isDisabled || ctx.isReadOnly || !hasContent}
	isPending={ctx.isPending}
	onmousedown={handleMouseDown}
	onclick={handleClick}
	class={className}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>
	{/if}
</ButtonRoot>
