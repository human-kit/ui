<script lang="ts">
	import { untrack } from 'svelte';
	import type { CheckboxGroupRootProps } from '../types.js';
	import { createCheckboxGroupContext, setCheckboxGroupContext } from './context.svelte';

	const generatedId = $props.id();

	let {
		id,
		value = $bindable(),
		defaultValue,
		onChange,
		name,
		disabled: disabledProp = false,
		readonly: readOnlyProp = false,
		required: requiredProp = false,
		orientation = 'vertical',
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		context = $bindable(),
		...restProps
	}: CheckboxGroupRootProps = $props();

	const instanceId = untrack(() => id) ?? generatedId;

	let rootRef: HTMLDivElement | null = $state(null);

	const checkboxGroup = setCheckboxGroupContext(
		createCheckboxGroupContext({
			// `value` seeds the initial selection whenever it is supplied, bound or not.
			initialValue: untrack(() => value) ?? untrack(() => defaultValue),
			name: (() => name)(),
			isDisabled: (() => disabledProp)(),
			isReadOnly: (() => readOnlyProp)(),
			isRequired: (() => requiredProp)(),
			orientation: (() => orientation)(),
			onValueChange: (nextValue) => {
				// One path for both usages: with `bind:value` this reaches the parent, and
				// without a binding the write stays local, so nothing here has to know
				// which one the caller chose.
				value = nextValue;
				onChange?.(nextValue);
			}
		})
	);

	context = checkboxGroup;

	// Marks the window in which a checkbox disappearing is a real change rather than the group
	// itself coming or going. `$effect.pre` because Svelte destroys an effect's children
	// before running that effect's own teardown, so an `onDestroy` here would fire *after*
	// every checkbox had already unregistered: this one is created while the script runs,
	// before the children exist, so it is first in destroy order and its cleanup lands ahead
	// of theirs. On the server it never runs, which is right too — there the checkboxes
	// unregister as the markup closes and nobody is listening any more.
	$effect.pre(() => {
		checkboxGroup.setLive(true);
		return () => checkboxGroup.setLive(false);
	});

	const disabled = $derived(checkboxGroup.isDisabled);
	const readOnly = $derived(checkboxGroup.isReadOnly);
	const required = $derived(checkboxGroup.isRequired);
	const currentOrientation = $derived(checkboxGroup.orientation);

	$effect(() => {
		element = rootRef;
	});

	$effect(() => {
		checkboxGroup.setName(name);
	});

	$effect(() => {
		checkboxGroup.setDisabled(disabledProp);
	});

	$effect(() => {
		checkboxGroup.setReadOnly(readOnlyProp);
	});

	$effect(() => {
		checkboxGroup.setRequired(requiredProp);
	});

	$effect(() => {
		checkboxGroup.setOrientation(orientation);
	});

	// A parent that supplies `value` drives the selection, bound or not. Latched at init,
	// not reactive — re-checking `value !== undefined` would switch this on the moment our
	// own write-back defines it, and a `defaultValue`-only group would start following the
	// echo of its own changes.
	const adoptsValueProp = untrack(() => value !== undefined);

	$effect(() => {
		if (!adoptsValueProp) return;
		checkboxGroup.setSelectedValues(value);
	});
</script>

<div
	{...restProps}
	bind:this={rootRef}
	id={instanceId}
	role="group"
	class={className}
	data-checkbox-group-root="true"
	data-orientation={currentOrientation}
	data-disabled={disabled || undefined}
	data-readonly={readOnly || undefined}
	data-required={required || undefined}
>
	{@render children?.()}
</div>
