<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { useComboBoxContext } from '../root/context';

	type ComboBoxButtonProps = HTMLButtonAttributes & {
		class?: string;
		children?: Snippet;
	};

	let { class: className, children, tabindex = -1, ...restProps }: ComboBoxButtonProps = $props();

	const ctx = useComboBoxContext();

	// Use onmousedown with preventDefault to prevent blur from firing
	// before the toggle. This prevents the race condition where:
	// 1. Click button -> blur fires -> popover closes
	// 2. Then onclick fires -> popover opens again
	function handleMouseDown(e: MouseEvent) {
		e.preventDefault();
		if (!ctx.isDisabled && !ctx.isReadOnly) {
			ctx.toggle();
		}
	}
</script>

<button
	type="button"
	{tabindex}
	aria-label={ctx.isOpen ? 'Close menu' : 'Open menu'}
	aria-expanded={ctx.isOpen}
	aria-controls={`combobox-listbox-${ctx.instanceId}`}
	disabled={ctx.isDisabled}
	data-pressed={ctx.isOpen}
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
</button>
