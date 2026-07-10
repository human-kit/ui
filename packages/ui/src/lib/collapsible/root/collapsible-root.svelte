<script lang="ts">
	import { untrack } from 'svelte';
	import type { CollapsibleRootProps } from '../types.js';
	import { setCollapsibleContext, type CollapsibleContext } from './context';

	const generatedId = $props.id();

	let {
		id,
		open: openProp = $bindable(),
		defaultOpen = false,
		onOpenChange,
		disabled = false,
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		context = $bindable(),
		...restProps
	}: CollapsibleRootProps = $props();

	const isControlled = untrack(() => openProp !== undefined);
	const instanceId = untrack(() => id) ?? generatedId;

	let rootRef: HTMLDivElement | null = $state(null);
	let internalOpen = $state(untrack(() => defaultOpen));

	const isOpen = $derived(isControlled ? Boolean(openProp) : internalOpen);

	function setOpen(next: boolean) {
		if (disabled || next === isOpen) return;
		if (!isControlled) {
			// Uncontrolled: apply the change and keep `bind:open` in sync.
			internalOpen = next;
			openProp = next;
		}
		// Controlled: request the change and let the parent apply it via the prop.
		onOpenChange?.(next);
	}

	function toggle() {
		setOpen(!isOpen);
	}

	const collapsible: CollapsibleContext = setCollapsibleContext({
		get isOpen() {
			return isOpen;
		},
		get isDisabled() {
			return disabled;
		},
		triggerId: `${instanceId}-trigger`,
		panelId: `${instanceId}-panel`,
		setOpen,
		toggle
	});

	context = collapsible;

	$effect(() => {
		element = rootRef;
	});
</script>

<div
	{...restProps}
	bind:this={rootRef}
	id={instanceId}
	class={className}
	data-collapsible-root="true"
	data-open={isOpen || undefined}
	data-disabled={disabled || undefined}
>
	{@render children?.()}
</div>
