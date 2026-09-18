<script lang="ts">
	import { useToastContext } from '../root/context';
	import type { ToastTitleProps } from '../types.js';

	/**
	 * Toast.Title — the name of the toast.
	 *
	 * It registers its id with the root, which gives it to the toast as `aria-labelledby`. It
	 * renders a `<div>` and not a heading: a toast is not a section of the page, and a heading
	 * in it would break the outline of the page. Without children, it shows the `title` of the
	 * item.
	 */
	let { children, class: className = '', id: idProp, ...restProps }: ToastTitleProps = $props();

	const ctx = useToastContext('Toast.Title');
	const generatedId = $props.id();
	const id = $derived(idProp ?? generatedId);

	// Without children and without a `title` on the item there is nothing to say: the part
	// renders nothing, and it gives no name. The description then names the toast.
	const hasContent = $derived(Boolean(children) || Boolean(ctx.toast.title));

	// The returned unregister runs on destroy, and again whenever the id changes.
	$effect(() => {
		if (!hasContent) return;
		return ctx.registerTitle(id);
	});
</script>

{#if hasContent}
	<div {...restProps} {id} class={className} data-toast-title="true">
		{#if children}
			{@render children()}
		{:else}
			{ctx.toast.title}
		{/if}
	</div>
{/if}
