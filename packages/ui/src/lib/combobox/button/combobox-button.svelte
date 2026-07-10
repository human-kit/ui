<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { readable } from 'svelte/store';
	import { ButtonRoot } from '../../button/index.js';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { useLocaleContextOptional } from '../../locale-provider/context';
	import { useComboBoxContext } from '../root/context';

	type ComboBoxButtonProps = HTMLButtonAttributes & {
		class?: string;
		children?: Snippet;
	};

	let { class: className, children, tabindex = -1, ...restProps }: ComboBoxButtonProps = $props();

	const localeContext = useLocaleContextOptional();
	const emptyLocaleStore = readable<string | undefined>(undefined);
	const localeStore = localeContext?.locale ?? emptyLocaleStore;

	const ctx = useComboBoxContext();
	const isButtonDisabled = $derived(ctx.isDisabled || ctx.isReadOnly || ctx.isPending);
	const defaultAriaLabel = $derived(
		resolveLocalizedString($localeStore, ctx.isOpen ? 'combobox.hideOptions' : 'combobox.showOptions')
	);

	function handleMouseDown(event: MouseEvent) {
		event.preventDefault();
		if (!isButtonDisabled) {
			ctx.toggle();
		}
	}
</script>

<ButtonRoot
	type="button"
	{tabindex}
	aria-label={defaultAriaLabel}
	aria-expanded={ctx.isOpen}
	aria-controls={`combobox-listbox-${ctx.instanceId}`}
	disabled={ctx.isDisabled || ctx.isReadOnly}
	pending={ctx.isPending}
	pressed={ctx.isOpen || undefined}
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
			data-open={ctx.isOpen || undefined}
			style:transform={ctx.isOpen ? 'rotate(180deg)' : undefined}
		>
			<path d="m6 9 6 6 6-6" />
		</svg>
	{/if}
</ButtonRoot>
