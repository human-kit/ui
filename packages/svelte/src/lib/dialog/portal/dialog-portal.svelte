<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Portal } from '../../portal';
	import { getDialogContext } from '../root/context';

	/**
	 * Dialog.Portal - Renders children into a portal when dialog is open.
	 * Must be used inside a Dialog.Root.
	 */
	type DialogPortalProps = {
		/** Content to render in portal (Overlay and Content) */
		children?: Snippet;
	};

	let { children }: DialogPortalProps = $props();

	const ctx = getDialogContext();

	if (!ctx) {
		throw new Error('Dialog.Portal must be used inside a Dialog.Root');
	}

	const dialogCtx = ctx;
</script>

{#if dialogCtx.isOpen}
	<Portal>
		{#if children}
			{@render children()}
		{/if}
	</Portal>
{/if}
