<script lang="ts">
	import { useSelectContext } from '../root/context';
	import type { SelectLabelProps } from '../types';

	/**
	 * Select.Label — the accessible name of the field.
	 *
	 * It is a native `<label>` for the trigger: a button is a labelable element, thus a click
	 * on the text moves the focus to the trigger. It also registers its id with the root, and
	 * the trigger reads it into `aria-labelledby`, because the combobox role takes its name
	 * from that attribute and not from the content of the button.
	 */
	let {
		children,
		class: className = '',
		id: idProp,
		onclick: onClickExternal,
		...restProps
	}: SelectLabelProps = $props();

	const ctx = useSelectContext('Select.Label');
	const id = $derived(idProp ?? `select-label-${ctx.instanceId}`);

	$effect(() => ctx.registerLabel(id));

	// A click on a native label activates its button, and that would open the list. A click on
	// the label of a native select only moves the focus, and this does the same.
	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLLabelElement }) {
		onClickExternal?.(event);
		if (event.defaultPrevented) return;
		event.preventDefault();
		if (!ctx.isDisabled) ctx.triggerRef?.focus();
	}
</script>

<label
	{...restProps}
	{id}
	for={ctx.triggerId}
	class={className}
	onclick={handleClick}
	data-select-label="true"
	data-disabled={ctx.isDisabled || undefined}
>
	{@render children?.()}
</label>
