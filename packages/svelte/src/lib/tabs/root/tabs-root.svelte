<script lang="ts">
	import { untrack } from 'svelte';
	import type { TabsRootProps } from '../types.js';
	import { createTabsContext, setTabsContext } from './context';

	const generatedId = $props.id();

	let {
		keyboardActivation = 'automatic',
		orientation = 'horizontal',
		disabled = false,
		value = $bindable(),
		defaultValue,
		disabledKeys,
		onChange,
		children,
		class: className = '',
		id,
		element = $bindable<HTMLDivElement | null>(null),
		context = $bindable(),
		...restProps
	}: TabsRootProps = $props();

	const isValueControlled = untrack(() => value !== undefined);
	const instanceId = untrack(() => id) ?? generatedId;

	let rootRef: HTMLDivElement | null = $state(null);

	const tabs = setTabsContext(
		createTabsContext({
			instanceId,
			isControlled: isValueControlled,
			keyboardActivation: (() => keyboardActivation)(),
			orientation: (() => orientation)(),
			isDisabled: (() => disabled)(),
			disabledKeys: (() => disabledKeys)(),
			initialValue: isValueControlled
				? (untrack(() => value) ?? null)
				: untrack(() => defaultValue),
			onValueChange: (nextValue) => {
				value = nextValue;
				onChange?.(nextValue);
			}
		})
	);

	context = tabs;

	$effect(() => {
		element = rootRef;
	});

	$effect(() => {
		tabs.setKeyboardActivation(keyboardActivation);
	});

	$effect(() => {
		tabs.setOrientation(orientation);
	});

	$effect(() => {
		tabs.setDisabled(disabled);
	});

	$effect(() => {
		tabs.setDisabledKeys(disabledKeys);
	});

	$effect(() => {
		if (!isValueControlled) return;
		tabs.setSelectedValue(value ?? null);
	});
</script>

<div
	{...restProps}
	bind:this={rootRef}
	id={instanceId}
	class={className}
	data-tabs-root="true"
	data-orientation={orientation}
	data-disabled={disabled || undefined}
>
	{@render children?.()}
</div>
