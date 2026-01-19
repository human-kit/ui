<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount, onDestroy } from 'svelte';
	import { getDialogContext } from '../root/context';

	/**
	 * Dialog.Trigger - Wrapper that auto-wires a trigger element.
	 * Must be used inside a Dialog.Root.
	 */
	type DialogTriggerProps = {
		/** Children (trigger button) */
		children?: Snippet;
	};

	let { children }: DialogTriggerProps = $props();

	const ctx = getDialogContext();

	if (!ctx) {
		throw new Error('Dialog.Trigger must be used inside a Dialog.Root');
	}

	// After the throw, TypeScript knows ctx is defined
	const dialogCtx = ctx;

	let wrapperRef: HTMLElement | null = $state(null);

	function handleClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		const button = target.closest('button, [role="button"]') as HTMLElement | null;

		if (button && wrapperRef?.contains(button)) {
			// Set trigger ref if not already set
			if (!dialogCtx.triggerRef) {
				dialogCtx.setTriggerRef(button);
			}
			dialogCtx.toggle();
		}
	}

	onMount(() => {
		if (wrapperRef) {
			// Find and set up the trigger button
			const firstButton = wrapperRef.querySelector('button, [role="button"]') as HTMLElement | null;
			if (firstButton) {
				dialogCtx.setTriggerRef(firstButton);
				firstButton.setAttribute('aria-haspopup', 'dialog');
			}
		}

		// Add click listener imperatively to avoid a11y linter warnings
		// Buttons inside handle keyboard events natively (Enter/Space trigger click)
		wrapperRef?.addEventListener('click', handleClick);
	});

	onDestroy(() => {
		wrapperRef?.removeEventListener('click', handleClick);
	});

	$effect(() => {
		if (dialogCtx.triggerRef) {
			dialogCtx.triggerRef.setAttribute('aria-expanded', String(dialogCtx.isOpen));
		}
	});
</script>

<div bind:this={wrapperRef} style="display: contents;">
	{#if children}
		{@render children()}
	{/if}
</div>
