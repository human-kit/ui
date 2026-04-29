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
	let activeTrigger: HTMLElement | null = null;

	function setActiveTrigger(button: HTMLElement) {
		if (activeTrigger && activeTrigger !== button) {
			activeTrigger.setAttribute('aria-expanded', 'false');
			delete activeTrigger.dataset.pressedWhenExpanded;
		}

		activeTrigger = button;
		dialogCtx.setTriggerRef(button);
		button.setAttribute('aria-haspopup', 'dialog');
		button.setAttribute('aria-expanded', String(dialogCtx.isOpen));
		button.dataset.pressedWhenExpanded = 'true';
	}

	function handleClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		const button = target.closest('button, [role="button"]') as HTMLElement | null;

		if (button && wrapperRef?.contains(button)) {
			setActiveTrigger(button);
			dialogCtx.toggle();
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
		if (dialogCtx.triggerRef) {
			if (activeTrigger !== dialogCtx.triggerRef) {
				activeTrigger = dialogCtx.triggerRef;
			}
			dialogCtx.triggerRef.setAttribute('aria-haspopup', 'dialog');
			dialogCtx.triggerRef.setAttribute('aria-expanded', String(dialogCtx.isOpen));
			dialogCtx.triggerRef.dataset.pressedWhenExpanded = 'true';
		}
	});
</script>

<div bind:this={wrapperRef} style="display: contents;">
	{#if children}
		{@render children()}
	{/if}
</div>
