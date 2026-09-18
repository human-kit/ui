<script lang="ts">
	import { ButtonRoot } from '../../button/index.js';
	import { SWIPE_IGNORE_ATTRIBUTE } from '../../primitives/swipe-gesture';
	import { useToastContext } from '../root/context';
	import type { ToastCloseProps } from '../types.js';

	/**
	 * Toast.Close — a button that closes the toast.
	 *
	 * Put it outside `Toast.Content`, thus the announcement of the toast does not read it. Give
	 * it a name, in its text or in `aria-label`. A swipe never starts on it.
	 */
	let {
		children,
		class: className = '',
		element = $bindable<HTMLButtonElement | null>(null),
		onclick,
		...restProps
	}: ToastCloseProps = $props();

	const ctx = useToastContext('Toast.Close');
	const swipeIgnore = { [SWIPE_IGNORE_ATTRIBUTE]: '' };

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(event);
		if (event.defaultPrevented) return;
		ctx.close();
	}
</script>

<ButtonRoot
	{...restProps}
	{...swipeIgnore}
	bind:element
	class={className}
	type="button"
	data-toast-close="true"
	onclick={handleClick}
>
	{@render children?.()}
</ButtonRoot>
