<script lang="ts">
	import type { AccordionHeaderProps } from '../types.js';
	import { useAccordionContext } from '../root/context';
	import { useAccordionItemContext } from '../item/context';

	let {
		level = 3,
		children,
		class: className = '',
		element = $bindable<HTMLHeadingElement | null>(null),
		...restProps
	}: AccordionHeaderProps = $props();

	const accordion = useAccordionContext();
	const item = useAccordionItemContext();
	const stateVersion = accordion.stateVersion;

	let headingRef: HTMLHeadingElement | null = $state(null);
	const tag = $derived(`h${level}` as const);

	const open = $derived.by(() => {
		void $stateVersion;
		return accordion.isOpen(item.value);
	});
	const disabled = $derived.by(() => {
		void $stateVersion;
		return accordion.isItemDisabled(item.value);
	});

	$effect(() => {
		element = headingRef;
	});
</script>

<svelte:element
	this={tag}
	{...restProps}
	bind:this={headingRef}
	class={className}
	data-accordion-header="true"
	data-open={open || undefined}
	data-disabled={disabled || undefined}
>
	{@render children?.()}
</svelte:element>
