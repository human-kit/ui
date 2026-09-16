<script lang="ts">
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
	const id = $derived(idProp ?? `select-value-${ctx.instanceId}`);

	$effect(() => ctx.registerValue(id));

	const selectedKeys = $derived(Array.from(ctx.selectedKeys));
	const hasSelection = $derived(selectedKeys.length > 0);
	const resolvedPlaceholder = $derived(placeholder ?? ctx.placeholder);
	const label = $derived(
		hasSelection ? selectedKeys.map((key) => ctx.getLabel(key)).join(', ') : resolvedPlaceholder
	);
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
