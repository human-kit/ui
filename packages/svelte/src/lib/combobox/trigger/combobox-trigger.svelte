<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonRoot } from '../../button/index.js';
	import { useComboBoxContext } from '../root/context';

	type ComboBoxTriggerProps = HTMLButtonAttributes & {
		class?: string;
		children?: Snippet;
	};

	let { class: className, children, tabindex = -1, ...restProps }: ComboBoxTriggerProps = $props();

	const ctx = useComboBoxContext();
	const isTriggerDisabled = $derived(ctx.isDisabled || ctx.isReadOnly || ctx.isPending);

	function handleMouseDown(event: MouseEvent) {
		event.preventDefault();
		if (!isTriggerDisabled) {
			ctx.toggle();
		}
	}
</script>

<ButtonRoot
	type="button"
	{tabindex}
	aria-label={ctx.isOpen ? 'Close menu' : 'Open menu'}
	aria-expanded={ctx.isOpen}
	aria-controls={`combobox-listbox-${ctx.instanceId}`}
	disabled={ctx.isDisabled || ctx.isReadOnly}
	pending={ctx.isPending}
	pressed={ctx.isOpen}
	onmousedown={handleMouseDown}
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
			class="transition-transform {ctx.isOpen ? 'rotate-180' : ''}"
		>
			<path d="m6 9 6 6 6-6" />
		</svg>
	{/if}
</ButtonRoot>
