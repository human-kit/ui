<script lang="ts">
	import { untrack } from 'svelte';
	import type { AccordionRootProps } from '../types.js';
	import { createAccordionContext, setAccordionContext } from './context.svelte';

	const generatedId = $props.id();

	let {
		id,
		value = $bindable(),
		defaultValue,
		controlledValue = false,
		onChange,
		selectionMode = 'single',
		disabled: disabledProp = false,
		orientation = 'vertical',
		disallowEmptySelection = false,
		loop = true,
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		context = $bindable(),
		...restProps
	}: AccordionRootProps = $props();

	// Controlled-ness is NOT inferred from `value` being defined: `bind:value={items}` and
	// `value={items}` are indistinguishable at runtime, so inferring it silently broke
	// every `bind:value`. It is opt-in via `controlledValue` instead.
	const isControlled = untrack(() => controlledValue);
	const instanceId = untrack(() => id) ?? generatedId;

	let rootRef: HTMLDivElement | null = $state(null);

	const accordion = setAccordionContext(
		createAccordionContext({
			instanceId,
			isControlled,
			// `value` seeds the initial state whenever it is supplied, bound or not.
			initialValue: untrack(() => value) ?? untrack(() => defaultValue),
			selectionMode: (() => selectionMode)(),
			isDisabled: (() => disabledProp)(),
			orientation: (() => orientation)(),
			disallowEmptySelection: (() => disallowEmptySelection)(),
			loop: (() => loop)(),
			onValueChange: (nextValue) => {
				if (!isControlled) {
					value = nextValue;
				}
				onChange?.(nextValue);
			}
		})
	);

	context = accordion;

	const disabled = $derived(accordion.isDisabled);
	const currentOrientation = $derived(accordion.orientation);

	$effect(() => {
		element = rootRef;
	});

	$effect(() => {
		accordion.setSelectionMode(selectionMode);
	});

	$effect(() => {
		accordion.setDisabled(disabledProp);
	});

	$effect(() => {
		accordion.setOrientation(orientation);
	});

	$effect(() => {
		accordion.setDisallowEmptySelection(disallowEmptySelection);
	});

	$effect(() => {
		accordion.setLoop(loop);
	});

	// Whether to adopt an incoming `value` is a separate question from who owns the state,
	// so it is latched at init off the prop rather than off `controlledValue`: a parent
	// that supplies `value` drives the accordion, bound or not. Latched, not reactive —
	// re-checking `value !== undefined` would switch this on the moment our own write-back
	// defines it, and the component would then re-adopt the echo of its own change.
	const adoptsValueProp = untrack(() => value !== undefined);

	$effect(() => {
		if (!adoptsValueProp) return;
		accordion.setOpenValues(value);
	});
</script>

<div
	{...restProps}
	bind:this={rootRef}
	id={instanceId}
	class={className}
	data-accordion-root="true"
	data-orientation={currentOrientation}
	data-disabled={disabled || undefined}
>
	{@render children?.()}
</div>
