<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { focusTrap } from '$lib/primitives/focus-trap';
	import { scrollLock } from '$lib/primitives/scroll-lock';
	import { clickOutside } from '$lib/primitives/click-outside';
	import { ariaHideOutside } from '$lib/primitives/aria-hide-outside';
	import { getDialogContext } from '../root/context';
	import { pushDialog, popDialog, isTopmostDialog, getContentZIndex } from '../root/dialog-stack';

	/**
	 * Dialog.Content - The centered modal dialog panel.
	 * Must be used inside a Dialog.Portal.
	 */
	type DialogContentProps = {
		/** Content of the dialog. */
		children?: Snippet;
		/** CSS class for the dialog container. */
		class?: string;
		/** Whether clicking outside the dialog should close it. */
		shouldCloseOnInteractOutside?: boolean;
		/** Whether pressing Escape should close the dialog. */
		shouldCloseOnEscape?: boolean;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'>;

	let {
		children,
		class: className = '',
		shouldCloseOnInteractOutside = true,
		shouldCloseOnEscape = true,
		...restProps
	}: DialogContentProps = $props();

	const ctx = getDialogContext();

	if (!ctx) {
		throw new Error('Dialog.Content must be used inside a Dialog.Root');
	}

	const dialogCtx = ctx;

	let dialogRef: HTMLElement | undefined = $state();
	let dialogId: symbol | null = null;
	let dialogLevel = $state(0);

	function close() {
		dialogCtx.close();
	}

	/**
	 * Wrapper for close that only executes if this is the topmost dialog.
	 */
	function closeIfTopmost() {
		if (dialogId && isTopmostDialog(dialogId)) {
			close();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && shouldCloseOnEscape) {
			// Only handle if this is the topmost dialog
			if (dialogId && isTopmostDialog(dialogId)) {
				event.preventDefault();
				close();
			}
		}
	}

	onMount(() => {
		if (!browser) return;
		// Register this dialog in the stack
		const { id, level } = pushDialog(close);
		dialogId = id;
		dialogLevel = level;
		// Share level with overlay via context
		dialogCtx.setStackLevel(level);
		document.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		if (!browser) return;
		// Unregister this dialog from the stack
		if (dialogId) {
			popDialog(dialogId);
		}
		document.removeEventListener('keydown', handleKeydown);
	});

	// Calculate z-index based on dialog level
	const zIndex = $derived(getContentZIndex(dialogLevel));
</script>

<div
	bind:this={dialogRef}
	class={className}
	role="dialog"
	aria-modal="true"
	data-dialog-content
	use:clickOutside={{
		handler: closeIfTopmost,
		enabled: shouldCloseOnInteractOutside,
		ignore: [dialogCtx.triggerRef]
	}}
	use:focusTrap={true}
	use:scrollLock={true}
	use:ariaHideOutside={true}
	style="
		position: fixed;
		z-index: {zIndex};
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	"
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</div>
