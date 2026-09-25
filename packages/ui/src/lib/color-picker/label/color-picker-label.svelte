<script lang="ts">
	import { useColorPickerContext } from '../root/context';
	import type { ColorPickerLabelProps } from '../types';

	/**
	 * ColorPicker.Label — the accessible name of the picker.
	 *
	 * It registers its id with the root, which gives it to the root element as `aria-labelledby`.
	 * It renders a `<span>` and not a `<label>`, because a `<label>` names one control and the
	 * picker holds a square, the sliders and the fields.
	 */
	let {
		children,
		class: className = '',
		id: idProp,
		...restProps
	}: ColorPickerLabelProps = $props();

	const ctx = useColorPickerContext('ColorPicker.Label');
	const id = $derived(idProp ?? `${ctx.rootId}-label`);

	// The returned unregister runs on destroy, and again whenever the id changes.
	$effect(() => ctx.registerLabel(id));
</script>

<span
	{...restProps}
	{id}
	class={className}
	data-color-picker-label="true"
	data-disabled={ctx.isDisabled || undefined}
>
	{@render children?.()}
</span>
