<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDialogContext } from '../root/context';
	import { getDialogPresenceContext } from '../root/presence-context';
	import { getOverlayZIndex } from '../root/dialog-stack';

	/**
	 * Dialog.Overlay - The backdrop overlay behind the dialog.
	 * Must be used inside a Dialog.Portal.
	 */
	type DialogOverlayProps = {
		/** CSS class for the overlay. */
		class?: string;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class'>;

	let { class: className = '', ...restProps }: DialogOverlayProps = $props();

	const ctx = getDialogContext();

	if (!ctx) {
		throw new Error('Dialog.Overlay must be used inside a Dialog.Root');
	}

	const dialogCtx = ctx;

	// Optional: present only inside Dialog.Portal. Mirrors the content's enter/exit phase so the
	// backdrop can fade in step with it.
	const presence = getDialogPresenceContext();

	// Calculate z-index based on dialog level from context
	const zIndex = $derived(getOverlayZIndex(dialogCtx.stackLevel));
</script>

<div
	class={className}
	data-dialog-overlay
	data-state={presence ? presence.state : 'open'}
	data-entering={presence?.isEntering || undefined}
	data-exiting={presence?.isExiting || undefined}
	style="
		position: fixed;
		inset: 0;
		z-index: {zIndex};
	"
	{...restProps}
></div>
