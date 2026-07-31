<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDialogContext } from '../root/context';

	/**
	 * Dialog.Description — supporting text announced after the title.
	 *
	 * Registers its id with the root, which hands it to `Dialog.Content` as
	 * `aria-describedby`, so a screen reader reads it when the dialog opens rather
	 * than only when the user happens to arrow onto it.
	 */
	type DialogDescriptionProps = {
		/** Supporting text announced after the title. */
		children?: Snippet;
		/** CSS class for the paragraph. */
		class?: string;
		/** Overrides the generated id. */
		id?: string;
	} & Omit<HTMLAttributes<HTMLParagraphElement>, 'class' | 'children' | 'id'>;

	let {
		children,
		class: className = '',
		id: idProp,
		...restProps
	}: DialogDescriptionProps = $props();

	const ctx = getDialogContext();

	if (!ctx) {
		throw new Error('Dialog.Description must be used inside a Dialog.Root');
	}

	const dialogCtx = ctx;
	const generatedId = $props.id();
	const id = $derived(idProp ?? generatedId);

	$effect(() => dialogCtx.registerDescription(id));
</script>

<p {id} class={className} data-dialog-description {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</p>
