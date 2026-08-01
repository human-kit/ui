<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDialogContext } from '../root/context';

	/**
	 * Dialog.Title — the dialog's accessible name.
	 *
	 * Registers its id with the root, which hands it to `Dialog.Content` as
	 * `aria-labelledby`. Writing a bare heading instead leaves the dialog unnamed: a
	 * `role="dialog"` takes its name from `aria-labelledby`/`aria-label`, never from
	 * the text inside it.
	 */
	type DialogTitleProps = {
		/** The dialog's name. */
		children?: Snippet;
		/** CSS class for the heading. */
		class?: string;
		/** Overrides the generated id. */
		id?: string;
	} & Omit<HTMLAttributes<HTMLHeadingElement>, 'class' | 'children' | 'id'>;

	let { children, class: className = '', id: idProp, ...restProps }: DialogTitleProps = $props();

	const ctx = getDialogContext();

	if (!ctx) {
		throw new Error('Dialog.Title must be used inside a Dialog.Root');
	}

	const dialogCtx = ctx;
	const generatedId = $props.id();
	const id = $derived(idProp ?? generatedId);

	// The returned unregister runs on destroy, and again whenever the id changes.
	$effect(() => dialogCtx.registerLabel(id));
</script>

<h2 {id} class={className} data-dialog-title {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</h2>
