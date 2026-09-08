<script lang="ts">
	import type { RadioGroupLabelProps } from '../types.js';
	import { getRadioGroupContext } from '../root/context.svelte';

	/**
	 * RadioGroup.Label — the accessible name of the group.
	 *
	 * It registers its id with the root, which gives it to the group element as
	 * `aria-labelledby`. A bare heading beside the group leaves the group unnamed: a
	 * `role="radiogroup"` takes its name from `aria-labelledby` or `aria-label`, never from the
	 * text near it. It renders a `<span>` and not a `<label>`, because a `<label>` names one
	 * control.
	 */
	let {
		children,
		class: className = '',
		id: idProp,
		...restProps
	}: RadioGroupLabelProps = $props();

	const radioGroup = getRadioGroupContext();

	if (!radioGroup) {
		throw new Error('RadioGroup.Label must be used within RadioGroup.Root.');
	}

	const group = radioGroup;
	const generatedId = $props.id();
	const id = $derived(idProp ?? generatedId);

	// The returned unregister runs on destroy, and again whenever the id changes.
	$effect(() => group.registerLabel(id));
</script>

<span {...restProps} {id} class={className} data-radio-group-label="true">
	{@render children?.()}
</span>
