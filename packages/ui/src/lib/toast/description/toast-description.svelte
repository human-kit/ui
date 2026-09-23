<script lang="ts">
	import { useToastContext } from '../root/context';
	import type { ToastDescriptionProps } from '../types.js';

	/**
	 * Toast.Description — the message of the toast.
	 *
	 * It registers its id with the root, which gives it to the toast as `aria-describedby`.
	 * Without children, it shows the `description` of the item.
	 */
	let {
		children,
		class: className = '',
		id: idProp,
		...restProps
	}: ToastDescriptionProps = $props();

	const ctx = useToastContext('Toast.Description');
	const generatedId = $props.id();
	const id = $derived(idProp ?? generatedId);

	// Without children and without a `description` on the item there is nothing to say: the
	// part renders nothing, and it describes nothing.
	const hasContent = $derived(Boolean(children) || Boolean(ctx.toast.description));

	// The returned unregister runs on destroy, and again whenever the id changes.
	$effect(() => {
		if (!hasContent) return;
		return ctx.registerDescription(id);
	});
</script>

{#if hasContent}
	<p {...restProps} {id} class={className} data-toast-description="true">
		{#if children}
			{@render children()}
		{:else}
			{ctx.toast.description}
		{/if}
	</p>
{/if}
