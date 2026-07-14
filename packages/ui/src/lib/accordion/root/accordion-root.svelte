<script lang="ts">
	import { untrack } from 'svelte';
	import type { AccordionRootProps } from '../types.js';
	import { createAccordionContext, setAccordionContext } from './context.svelte';

	const generatedId = $props.id();

	let {
		id,
		value = $bindable(),
		defaultValue,
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

	const isControlled = untrack(() => value !== undefined);
	const instanceId = untrack(() => id) ?? generatedId;

	let rootRef: HTMLDivElement | null = $state(null);

	const accordion = setAccordionContext(
		createAccordionContext({
			instanceId,
			isControlled,
			initialValue: isControlled ? untrack(() => value) : untrack(() => defaultValue),
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

	$effect(() => {
		if (!isControlled) return;
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
