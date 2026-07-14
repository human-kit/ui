<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonRoot } from '../../button/index.js';
	import { getDialogContext } from '../root/context';

	export type DialogTriggerProps = Omit<
		HTMLButtonAttributes,
		'type' | 'class' | 'children' | 'aria-haspopup' | 'aria-expanded'
	> & {
		children?: Snippet;
		class?: string;
		element?: HTMLButtonElement | null;
	};

	type DialogTriggerMouseEvent = MouseEvent & {
		currentTarget: EventTarget & HTMLButtonElement;
	};

	let {
		children,
		class: className = '',
		element = $bindable<HTMLButtonElement | null>(null),
		onclick: onClickExternal,
		...restProps
	}: DialogTriggerProps = $props();

	const ctx = getDialogContext();

	if (!ctx) {
		throw new Error('Dialog.Trigger must be used inside a Dialog.Root');
	}

	// After the throw, TypeScript knows ctx is defined
	const dialogCtx = ctx;

	let buttonRef: HTMLButtonElement | null = $state(null);

	function handleClick(event: DialogTriggerMouseEvent) {
		dialogCtx.toggle();
		onClickExternal?.(event);
	}

	$effect(() => {
		element = buttonRef;
		if (buttonRef) {
			dialogCtx.setTriggerRef(buttonRef);
		}
	});
</script>

<ButtonRoot
	{...restProps}
	bind:element={buttonRef}
	class={className}
	type="button"
	pressed={dialogCtx.isOpen || undefined}
	aria-haspopup="dialog"
	aria-expanded={dialogCtx.isOpen}
	data-dialog-trigger="true"
	onclick={handleClick}
>
	{@render children?.()}
</ButtonRoot>
