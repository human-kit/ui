<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount, onDestroy } from 'svelte';
	import { getPopoverContext } from '../root/context';

	/**
	 * Popover.Trigger - Wrapper that auto-wires a trigger element.
	 * Must be used inside a Popover.Root.
	 */
	type PopoverTriggerProps = {
		/** Children (trigger button) */
		children?: Snippet;
	};

	let { children }: PopoverTriggerProps = $props();

	const ctx = getPopoverContext();

	if (!ctx) {
		throw new Error('Popover.Trigger must be used inside a Popover.Root');
	}

	// After the throw, TypeScript knows ctx is defined
	const popoverCtx = ctx;

	let wrapperRef: HTMLElement | null = $state(null);

	function handleClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		const button = target.closest('button, [role="button"]') as HTMLElement | null;

		if (button && wrapperRef?.contains(button)) {
			// Set trigger ref if not already set
			if (!popoverCtx.triggerRef) {
				popoverCtx.setTriggerRef(button);
			}
			popoverCtx.toggle();
		}
	}

	onMount(() => {
		if (wrapperRef) {
			// Find and set up the trigger button
			const firstButton = wrapperRef.querySelector('button, [role="button"]') as HTMLElement | null;
			if (firstButton) {
				popoverCtx.setTriggerRef(firstButton);
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
		if (popoverCtx.triggerRef) {
			popoverCtx.triggerRef.setAttribute('aria-expanded', String(popoverCtx.isOpen));
		}
	});
</script>

<div bind:this={wrapperRef} style="display: contents;">
	{#if children}
		{@render children()}
	{/if}
</div>
