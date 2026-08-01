<script lang="ts">
	import { untrack } from 'svelte';
	import type { TabsRootProps } from '../types.js';
	import { createTabsContext, setTabsContext } from './context.svelte';

	const generatedId = $props.id();

	let {
		keyboardActivation = 'automatic',
		orientation = 'horizontal',
		disabled = false,
		value = $bindable(),
		defaultValue,
		controlledValue = false,
		disabledKeys,
		onChange,
		children,
		class: className = '',
		id,
		element = $bindable<HTMLDivElement | null>(null),
		context = $bindable(),
		...restProps
	}: TabsRootProps = $props();

	// Controlled-ness is opt-in, not inferred from `value` being defined: `bind:value` and
	// `value={...}` are indistinguishable at runtime. It used to be inferred here, and the
	// write-back below then ignored the result — so a genuinely controlled parent could
	// not reject a change; the tab moved regardless of what `onChange` decided.
	const isValueControlled = untrack(() => controlledValue);
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
			// `value` seeds the initial selection whenever it is supplied, bound or not.
			initialValue: untrack(() => value) ?? untrack(() => defaultValue),
			onValueChange: (nextValue) => {
				if (!isValueControlled) {
					value = nextValue;
				}
				onChange?.(nextValue);
			},
			onValueSync: (nextValue) => {
				if (isValueControlled) return;
				value = nextValue;
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

	// Whether to adopt an incoming `value` is a separate question from who owns the state,
	// so it is latched at init off the prop rather than off `controlledValue`: a parent
	// that supplies `value` drives the selection, bound or not. Latched, not reactive —
	// re-checking `value !== undefined` would switch this on the moment our own write-back
	// defines it, and the component would then re-adopt the echo of its own change.
	const adoptsValueProp = untrack(() => value !== undefined);

	$effect(() => {
		if (!adoptsValueProp) return;
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
