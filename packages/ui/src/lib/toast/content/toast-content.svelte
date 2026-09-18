<script lang="ts">
	import { useToastContext } from '../root/context';
	import type { ToastContentProps } from '../types.js';

	/**
	 * Toast.Content — the message: the title and the description.
	 *
	 * Keep the buttons out of it. The message is what the viewport announces, and the buttons
	 * are what the user presses after it.
	 */
	let { children, class: className = '', ...restProps }: ToastContentProps = $props();

	const ctx = useToastContext('Toast.Content');
</script>

<div
	{...restProps}
	class={className}
	data-toast-content="true"
	data-type={ctx.toast.type}
	data-priority={ctx.toast.priority}
>
	{@render children?.()}
</div>
