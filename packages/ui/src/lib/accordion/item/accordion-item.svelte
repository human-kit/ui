<script lang="ts">
	import type { AccordionItemProps } from '../types.js';
	import { useAccordionContext } from '../root/context.svelte';
	import { setAccordionItemContext } from './context';

	let {
		value,
		disabled: disabledProp = false,
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		...restProps
	}: AccordionItemProps = $props();

	const accordion = useAccordionContext();

	let itemRef: HTMLDivElement | null = $state(null);

	const open = $derived(accordion.isOpen(value));
	const disabled = $derived(accordion.isItemDisabled(value));
	const orientation = $derived(accordion.orientation);

	setAccordionItemContext({
		get value() {
			return value;
		},
		get isDisabled() {
			return disabledProp;
		},
		get triggerId() {
			return accordion.getTriggerId(value);
		},
		get panelId() {
			return accordion.getPanelId(value);
		}
	});

	$effect(() => {
		element = itemRef;
	});
</script>

<div
	{...restProps}
	bind:this={itemRef}
	class={className}
	data-accordion-item="true"
	data-accordion-value={String(value)}
	data-accordion-value-type={typeof value}
	data-open={open || undefined}
	data-disabled={disabled || undefined}
	data-orientation={orientation}
>
	{@render children?.()}
</div>
