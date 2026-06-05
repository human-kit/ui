<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '../../internal/environment';
	import { focusTrap } from '../../primitives/focus-trap';
	import { scrollLock } from '../../primitives/scroll-lock';
	import { clickOutside } from '../../primitives/click-outside';
	import { ariaHideOutside } from '../../primitives/aria-hide-outside';
	import { getDialogContext } from '../root/context';
	import { getDialogPresenceContext } from '../root/presence-context';
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

	// Optional: present only when rendered inside Dialog.Portal. Drives enter/exit animation and
	// lets the Portal time the exit from this element. Falls back to "always open" when absent.
	const presence = getDialogPresenceContext();
	const isOpen = $derived(presence ? presence.state === 'open' : true);

	let dialogRef: HTMLElement | undefined = $state();
	let dialogId: symbol | null = null;
	let dialogLevel = $state(0);

	// Register this element so Dialog.Portal can measure its exit animation before unmounting.
	$effect(() => {
		presence?.setMotionTarget(dialogRef ?? null);
		return () => presence?.setMotionTarget(null);
	});

	function close(reason: 'escape-key' | 'outside-press' | 'imperative-action', event?: Event) {
		dialogCtx.close(reason, event);
	}

	/**
	 * Wrapper for close that only executes if this is the topmost dialog.
	 */
	function closeIfTopmost(event: MouseEvent) {
		if (dialogId && isTopmostDialog(dialogId)) {
			close('outside-press', event);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen && shouldCloseOnEscape) {
			// Only handle if this is the topmost dialog
			if (dialogId && isTopmostDialog(dialogId)) {
				event.preventDefault();
				close('escape-key', event);
			}
		}
	}

	onMount(() => {
		if (!browser) return;
		// Register this dialog in the stack
		const { id, level } = pushDialog(() => close('imperative-action'));
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

<!--
	Centering layer. The panel is centered via grid (not a `transform`), leaving the panel's own
	`transform` free for enter/exit animations (zoom/slide) — the same freedom Popover.Content has
	because it positions with top/left. The layer carries the stacking z-index.
-->
<div
	data-dialog-positioner
	style="
		position: fixed;
		inset: 0;
		z-index: {zIndex};
		display: grid;
		place-items: center;
	"
>
	<div
		bind:this={dialogRef}
		class={className}
		role="dialog"
		aria-modal={isOpen ? 'true' : undefined}
		aria-hidden={isOpen ? undefined : 'true'}
		inert={!isOpen}
		data-dialog-content
		data-state={isOpen ? 'open' : 'closed'}
		data-entering={presence?.isEntering || undefined}
		data-exiting={presence?.isExiting || undefined}
		use:clickOutside={{
			handler: closeIfTopmost,
			enabled: isOpen && shouldCloseOnInteractOutside,
			ignore: [dialogCtx.triggerRef]
		}}
		use:focusTrap={isOpen}
		use:scrollLock={isOpen}
		use:ariaHideOutside={isOpen}
		{...restProps}
	>
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>
