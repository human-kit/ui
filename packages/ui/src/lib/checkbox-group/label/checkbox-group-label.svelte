<script lang="ts">
	import type { CheckboxGroupLabelProps } from '../types.js';
	import { getCheckboxGroupContext } from '../root/context.svelte';

	/**
	 * CheckboxGroup.Label — the accessible name of the group.
	 *
	 * It registers its id with the root, which gives it to the group element as
	 * `aria-labelledby`. A bare heading beside the group leaves the group unnamed: a
	 * `role="group"` takes its name from `aria-labelledby` or `aria-label`, never from the text
	 * near it. It renders a `<span>` and not a `<label>`, because a `<label>` names one control.
	 */
	let {
		children,
		class: className = '',
		id: idProp,
		...restProps
	}: CheckboxGroupLabelProps = $props();

	const checkboxGroup = getCheckboxGroupContext();

	if (!checkboxGroup) {
		throw new Error('CheckboxGroup.Label must be used within CheckboxGroup.Root.');
	}

	const group = checkboxGroup;
	const generatedId = $props.id();
	const id = $derived(idProp ?? generatedId);

	// The returned unregister runs on destroy, and again whenever the id changes.
	$effect(() => group.registerLabel(id));
</script>

<span {...restProps} {id} class={className} data-checkbox-group-label="true">
	{@render children?.()}
</span>
