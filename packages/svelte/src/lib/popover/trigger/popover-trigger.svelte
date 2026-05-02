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
	let activeTrigger: HTMLElement | null = null;

	function syncTriggerState(button: HTMLElement) {
		button.setAttribute('aria-haspopup', 'dialog');
		button.setAttribute('aria-expanded', String(popoverCtx.isOpen));
		if (popoverCtx.isOpen) {
			button.dataset.pressedWhenExpanded = 'true';
			button.dataset.pressed = 'true';
		} else {
			delete button.dataset.pressedWhenExpanded;
			delete button.dataset.pressed;
		}
	}

	function setActiveTrigger(button: HTMLElement) {
		if (activeTrigger && activeTrigger !== button) {
			activeTrigger.setAttribute('aria-expanded', 'false');
			delete activeTrigger.dataset.pressed;
			delete activeTrigger.dataset.pressedWhenExpanded;
		}

		activeTrigger = button;
		popoverCtx.setTriggerRef(button);
		syncTriggerState(button);
	}

	function handleClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		const button = target.closest('button, [role="button"]') as HTMLElement | null;

		if (button && wrapperRef?.contains(button)) {
			setActiveTrigger(button);
			popoverCtx.toggle('trigger-press', event);
		}
	}

	onMount(() => {
		if (wrapperRef) {
			// Find and set up the trigger button
			const firstButton = wrapperRef.querySelector('button, [role="button"]') as HTMLElement | null;
			if (firstButton) {
				setActiveTrigger(firstButton);
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
			if (activeTrigger !== popoverCtx.triggerRef) {
				activeTrigger = popoverCtx.triggerRef;
			}
			syncTriggerState(popoverCtx.triggerRef);
		}
	});
</script>

<div bind:this={wrapperRef} style="display: contents;">
	{#if children}
		{@render children()}
	{/if}
</div>
