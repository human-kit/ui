<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonRoot } from '../../button/index.js';
	import { getPopoverContext } from '../root/context';

	export type PopoverTriggerProps = Omit<
		HTMLButtonAttributes,
		'type' | 'class' | 'children' | 'aria-haspopup' | 'aria-expanded'
	> & {
		children?: Snippet;
		class?: string;
		element?: HTMLButtonElement | null;
	};

	type PopoverTriggerMouseEvent = MouseEvent & {
		currentTarget: EventTarget & HTMLButtonElement;
	};

	let {
		children,
		class: className = '',
		element = $bindable<HTMLButtonElement | null>(null),
		onclick: onClickExternal,
		...restProps
	}: PopoverTriggerProps = $props();

	const ctx = getPopoverContext();

	if (!ctx) {
		throw new Error('Popover.Trigger must be used inside a Popover.Root');
	}

	// After the throw, TypeScript knows ctx is defined
	const popoverCtx = ctx;

	let buttonRef: HTMLButtonElement | null = $state(null);

	function handleClick(event: PopoverTriggerMouseEvent) {
		popoverCtx.toggle('trigger-press', event);
		onClickExternal?.(event);
	}

	$effect(() => {
		element = buttonRef;
		if (buttonRef) {
			popoverCtx.setTriggerRef(buttonRef);
		}
	});
</script>

<ButtonRoot
	{...restProps}
	bind:element={buttonRef}
	class={className}
	type="button"
	pressed={popoverCtx.isOpen || undefined}
	aria-haspopup="dialog"
	aria-expanded={popoverCtx.isOpen}
	data-popover-trigger="true"
	onclick={handleClick}
>
	{@render children?.()}
</ButtonRoot>
