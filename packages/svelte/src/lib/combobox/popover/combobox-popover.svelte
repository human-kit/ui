<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useComboBoxContext } from '../root/context';
	import { Popover } from '../../popover';
	import { focusWithModality, type InputModality } from '../../primitives/input-modality';
	import type { PopoverOpenChangeDetails } from '../../popover/root/context';

	/**
	 * ComboBox.Popover - Just the floating container wrapper.
	 * Should contain ComboBox.ListBox as a child.
	 */
	type ComboBoxPopoverProps = {
		class?: string;
		children?: Snippet;
	};

	let { class: className = '', children }: ComboBoxPopoverProps = $props();

	const ctx = useComboBoxContext();

	function resolveFocusTarget(details?: PopoverOpenChangeDetails): HTMLElement | null {
		const rawTarget = details?.event?.target;
		if (!(rawTarget instanceof Node)) return null;
		if (ctx.inputRef?.contains(rawTarget)) return null;
		return rawTarget instanceof HTMLElement ? rawTarget : rawTarget.parentElement;
	}

	function handleOpenChange(open: boolean, details?: PopoverOpenChangeDetails) {
		if (!open && details?.reason === 'outside-press') {
			const target = resolveFocusTarget(details);
			if (target) {
				focusWithModality(target, 'pointer' satisfies InputModality);
			}
		}

		ctx.onOpenChange(open);
	}

	/**
	 * Prevent wheel/scroll events from propagating to the page
	 * This keeps the page from scrolling when scrolling over the popover
	 * But allows internal scrolling when the popover has overflow
	 */
	function handleWheel(event: WheelEvent) {
		const element = event.currentTarget as HTMLElement;
		if (!element) return;

		const { scrollTop, scrollHeight, clientHeight } = element;
		const isScrollingDown = event.deltaY > 0;
		const isScrollingUp = event.deltaY < 0;

		// Check if we can scroll in the direction of the wheel
		const canScrollDown = scrollTop < scrollHeight - clientHeight;
		const canScrollUp = scrollTop > 0;

		// If we can scroll internally in this direction, allow it
		if ((isScrollingDown && canScrollDown) || (isScrollingUp && canScrollUp)) {
			// Allow internal scroll, but stop propagation to page
			event.stopPropagation();
		} else {
			// Can't scroll internally, prevent both default and propagation
			event.preventDefault();
			event.stopPropagation();
		}
	}

	$effect(() => {
		if (ctx.isOpen) {
			ctx.inputRef?.focus();
		}
	});
</script>

<Popover.Root open={ctx.isOpen} triggerRef={ctx.triggerRef} onOpenChange={handleOpenChange}>
	<Popover.Content
		isNonModal={true}
		placement="bottom-start"
		class={className}
		onwheel={handleWheel}
	>
		{#if children}
			{@render children()}
		{/if}
	</Popover.Content>
</Popover.Root>
