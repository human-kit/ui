<script lang="ts">
	import { usePinInputContext } from '../root/context';
	import type { PinInputLabelProps } from '../types';

	/**
	 * PinInput.Label — the accessible name of the group.
	 *
	 * It registers its id with the root, which gives it to the root element as `aria-labelledby`.
	 * It renders a `<span>` and not a `<label>`, because a `<label>` names one control and the
	 * group holds one input for each character. A press on it puts the focus on the first cell
	 * that is open, as a `<label>` would.
	 */
	let {
		children,
		class: className = '',
		id: idProp,
		onclick,
		...restProps
	}: PinInputLabelProps = $props();

	const ctx = usePinInputContext('PinInput.Label');
	const id = $derived(idProp ?? `${ctx.rootId}-label`);

	// The returned unregister runs on destroy, and again whenever the id changes.
	$effect(() => ctx.registerLabel(id));

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLSpanElement }) {
		onclick?.(event);
		if (event.defaultPrevented || ctx.isDisabled) return;
		ctx.focusCell(ctx.value.length, 'pointer');
	}
</script>

<span
	{...restProps}
	{id}
	class={className}
	data-pin-input-label="true"
	data-disabled={ctx.isDisabled || undefined}
	onclick={handleClick}
>
	{@render children?.()}
</span>
