<script lang="ts">
	import { readable } from 'svelte/store';
	import { getLocaleContext } from '../../locale-provider/context';
	import { useSelectContext } from '../root/context';
	import type { SelectValueProps, SelectValueRenderState } from '../types';

	/**
	 * Select.Value — the text of the selection, inside the trigger.
	 *
	 * It registers its id with the root, and the trigger puts that id in its `aria-labelledby`
	 * after the label. Thus the value is part of the name of the field.
	 */
	let {
		children,
		placeholder,
		class: className = '',
		id: idProp,
		...restProps
	}: SelectValueProps = $props();

	const ctx = useSelectContext('Select.Value');
	const localeStore = getLocaleContext()?.locale ?? readable<string | undefined>(undefined);
	const id = $derived(idProp ?? `select-value-${ctx.instanceId}`);

	$effect(() => ctx.registerValue(id));

	const selectedKeys = $derived(Array.from(ctx.selectedKeys));
	const hasSelection = $derived(selectedKeys.length > 0);
	const resolvedPlaceholder = $derived(placeholder ?? ctx.placeholder);
	// The texts of a multiple selection are joined by the locale, not by a comma written here: a
	// list separator is not the same in every language.
	const listFormat = $derived(
		typeof Intl.ListFormat === 'function'
			? new Intl.ListFormat($localeStore, { type: 'unit', style: 'short' })
			: null
	);
	const label = $derived.by(() => {
		if (!hasSelection) return resolvedPlaceholder;
		const texts = selectedKeys.map((key) => ctx.getLabel(key));
		return listFormat ? listFormat.format(texts) : texts.join(', ');
	});
	const renderState = $derived<SelectValueRenderState>({
		value: ctx.selectionMode === 'single' ? (selectedKeys[0] ?? null) : selectedKeys,
		label,
		placeholder: !hasSelection
	});
</script>

<span
	{...restProps}
	{id}
	class={className}
	data-select-value="true"
	data-placeholder={hasSelection ? undefined : 'true'}
>
	{#if children}
		{@render children(renderState)}
	{:else}
		{label}
	{/if}
</span>
