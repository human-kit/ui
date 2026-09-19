<script lang="ts">
	import { ButtonRoot } from '../../button/index.js';
	import { SWIPE_IGNORE_ATTRIBUTE } from '../../primitives/swipe-gesture';
	import { useToastContext } from '../root/context';
	import type { ToastActionProps } from '../types.js';

	/**
	 * Toast.Action — a button that does the one thing the toast offers, such as `Undo`.
	 *
	 * The press closes the toast, because the offer is taken. `keepOpen` holds it for an action
	 * that changes the toast instead. A swipe never starts on it.
	 */
	let {
		children,
		class: className = '',
		keepOpen = false,
		element = $bindable<HTMLButtonElement | null>(null),
		onclick,
		...restProps
	}: ToastActionProps = $props();

	const ctx = useToastContext('Toast.Action');
	const swipeIgnore = { [SWIPE_IGNORE_ATTRIBUTE]: '' };

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(event);
		if (event.defaultPrevented || keepOpen) return;
		ctx.close();
	}
</script>

<ButtonRoot
	{...restProps}
	{...swipeIgnore}
	bind:element
	class={className}
	type="button"
	data-toast-action="true"
	onclick={handleClick}
>
	{@render children?.()}
</ButtonRoot>
