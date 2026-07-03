<script lang="ts">
	import { ButtonRoot } from '../../button/index.js';
	import { useCollapsibleContext } from '../root/context';
	import type { CollapsibleTriggerProps } from '../types.js';

	type CollapsibleTriggerMouseEvent = MouseEvent & {
		currentTarget: EventTarget & HTMLButtonElement;
	};

	let {
		children,
		class: className = '',
		element = $bindable<HTMLButtonElement | null>(null),
		onclick: onClickExternal,
		...restProps
	}: CollapsibleTriggerProps = $props();

	const collapsible = useCollapsibleContext();

	function handleClick(event: CollapsibleTriggerMouseEvent) {
		if (collapsible.isDisabled) {
			event.preventDefault();
			onClickExternal?.(event);
			return;
		}

		collapsible.toggle();
		onClickExternal?.(event);
	}
</script>

<ButtonRoot
	{...restProps}
	bind:element
	id={collapsible.triggerId}
	type="button"
	disabled={collapsible.isDisabled}
	aria-expanded={collapsible.isOpen}
	aria-controls={collapsible.panelId}
	class={className}
	data-collapsible-trigger="true"
	data-open={collapsible.isOpen || undefined}
	data-disabled={collapsible.isDisabled || undefined}
	onclick={handleClick}
>
	{@render children?.()}
</ButtonRoot>
