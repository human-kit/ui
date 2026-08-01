<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonRoot } from '../../button/index.js';
	import { getDialogContext } from '../root/context';

	/**
	 * Dialog.Close — a button that closes the dialog.
	 *
	 * Equivalent to calling the `close` helper from the root's `children` snippet,
	 * but usable at any depth without threading it down.
	 */
	export type DialogCloseProps = Omit<HTMLButtonAttributes, 'type' | 'class' | 'children'> & {
		/** Button label. */
		children?: Snippet;
		/** CSS class for the button. */
		class?: string;
		/** Bindable reference to the rendered button. */
		element?: HTMLButtonElement | null;
	};

	type DialogCloseMouseEvent = MouseEvent & {
		currentTarget: EventTarget & HTMLButtonElement;
	};

	let {
		children,
		class: className = '',
		element = $bindable<HTMLButtonElement | null>(null),
		onclick: onClickExternal,
		...restProps
	}: DialogCloseProps = $props();

	const ctx = getDialogContext();

	if (!ctx) {
		throw new Error('Dialog.Close must be used inside a Dialog.Root');
	}

	const dialogCtx = ctx;

	function handleClick(event: DialogCloseMouseEvent) {
		dialogCtx.close('imperative-action', event);
		onClickExternal?.(event);
	}
</script>

<ButtonRoot
	{...restProps}
	bind:element
	class={className}
	type="button"
	data-dialog-close="true"
	onclick={handleClick}
>
	{@render children?.()}
</ButtonRoot>
