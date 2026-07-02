<script lang="ts">
	import type { ComponentProps, Snippet } from 'svelte';
	import { useComboBoxContext } from '../root/context';
	import { Popover } from '../../popover';
	import { focusWithModality, type InputModality } from '../../primitives/input-modality';
	import type { PopoverOpenChangeDetails } from '../../popover/root/context';

	/**
	 * ComboBox.Popover - Just the floating container wrapper.
	 * Should contain ComboBox.ListBox as a child.
	 */
	type ComboBoxPopoverProps = Omit<
		ComponentProps<typeof Popover.Content>,
		'open' | 'triggerRef' | 'onOpenChange' | 'children'
	> & {
		children?: Snippet;
	};

	let {
		class: className = '',
		children,
		placement = 'bottom-start',
		nonModal = true,
		shouldCloseOnEscape = true,
		shouldCloseOnBlur = true,
		...contentProps
	}: ComboBoxPopoverProps = $props();

	const ctx = useComboBoxContext();
	let restoreListboxMaxHeight: (() => void) | undefined;

	function resolveFocusTarget(details?: PopoverOpenChangeDetails): HTMLElement | null {
		const rawTarget = details?.event?.target;
		if (!(rawTarget instanceof Node)) return null;
		if (ctx.inputRef?.contains(rawTarget)) return null;
		return rawTarget instanceof HTMLElement ? rawTarget : rawTarget.parentElement;
	}

	function handleOpenChange(open: boolean, details?: PopoverOpenChangeDetails) {
		if (!open) {
			// Cancel Popover.Root's close to prevent scheduleTriggerCloseFocus from
			// setting stale data-focused on the trigger. The combobox passes triggerRef
			// via prop (not Popover.Trigger), so Popover.Root never registers a
			// blur-cleanup listener and any data-focused it sets persists forever.
			//
			// IMPORTANT: the actual state change is deferred to a microtask so that
			// when Popover.Root's closePopover re-reads `isOpen` after the callback,
			// the derived value is still `true` and the guard succeeds. A synchronous
			// ctx.onOpenChange(false) would update the upstream signal immediately,
			// making the derived `false` and bypassing the guard despite the cancel.
			details?.cancel();

			if (details?.reason === 'outside-press') {
				const target = resolveFocusTarget(details);
				queueMicrotask(() => {
					ctx.onOpenChange(false);

					if (target) {
						focusWithModality(target, 'pointer' satisfies InputModality);
					}

					// If focus is still on the input (non-focusable target), blur it
					// so focusWithin becomes false.
					if (document.activeElement === ctx.inputRef) {
						ctx.inputRef?.blur();
					}
				});
				return;
			}

			queueMicrotask(() => {
				ctx.onOpenChange(false);
			});
			return;
		}

		ctx.onOpenChange(open);
	}

	function handleMouseDown() {
		ctx.markPopoverPointerDown();
	}

	function applyListboxViewportConstraint() {
		const listbox = ctx.listboxRef;
		if (!listbox) return;

		const previousInlineMaxHeight = listbox.style.maxHeight;
		const computedMaxHeight = getComputedStyle(listbox).maxHeight;

		listbox.style.maxHeight =
			computedMaxHeight && computedMaxHeight !== 'none'
				? `min(${computedMaxHeight}, var(--available-height))`
				: 'var(--available-height)';

		restoreListboxMaxHeight = () => {
			listbox.style.maxHeight = previousInlineMaxHeight;
		};
	}

	function canElementScrollInDirection(element: HTMLElement, deltaY: number) {
		const isScrollingDown = deltaY > 0;
		const isScrollingUp = deltaY < 0;
		const canScrollDown = element.scrollTop < element.scrollHeight - element.clientHeight;
		const canScrollUp = element.scrollTop > 0;

		return (isScrollingDown && canScrollDown) || (isScrollingUp && canScrollUp);
	}

	function isScrollableElement(element: HTMLElement) {
		const { overflowY } = getComputedStyle(element);
		return (
			['auto', 'scroll', 'overlay'].includes(overflowY) &&
			element.scrollHeight > element.clientHeight
		);
	}

	function hasScrollableDescendantForWheel(
		boundary: HTMLElement,
		target: EventTarget | null,
		deltaY: number
	) {
		let current =
			target instanceof HTMLElement ? target : target instanceof Node ? target.parentElement : null;

		while (current) {
			if (isScrollableElement(current) && canElementScrollInDirection(current, deltaY)) {
				return true;
			}

			if (current === boundary) {
				break;
			}

			current = current.parentElement;
		}

		return false;
	}

	/**
	 * Prevent wheel/scroll events from propagating to the page
	 * This keeps the page from scrolling when scrolling over the popover
	 * But allows internal scrolling when either the popover or a descendant owns overflow
	 */
	function handleWheel(event: WheelEvent) {
		const element = event.currentTarget as HTMLElement;
		if (!element) return;

		if (
			hasScrollableDescendantForWheel(element, event.target, event.deltaY) ||
			(isScrollableElement(element) && canElementScrollInDirection(element, event.deltaY))
		) {
			event.stopPropagation();
			return;
		}

		event.preventDefault();
		event.stopPropagation();
	}

	$effect(() => {
		restoreListboxMaxHeight?.();
		restoreListboxMaxHeight = undefined;

		if (ctx.isOpen && ctx.listboxRef) {
			applyListboxViewportConstraint();
		}

		return () => {
			restoreListboxMaxHeight?.();
			restoreListboxMaxHeight = undefined;
		};
	});

	$effect(() => {
		if (ctx.isOpen) {
			ctx.inputRef?.focus();
		}
	});

	$effect(() => {
		ctx.setShouldCloseOnEscape(shouldCloseOnEscape);
		return () => {
			ctx.setShouldCloseOnEscape(true);
		};
	});

	$effect(() => {
		ctx.setShouldCloseOnBlur(shouldCloseOnBlur);
		return () => {
			ctx.setShouldCloseOnBlur(true);
		};
	});
</script>

<Popover.Root open={ctx.isOpen} triggerRef={ctx.triggerRef} onOpenChange={handleOpenChange}>
	<Popover.Content
		{nonModal}
		{placement}
		{shouldCloseOnEscape}
		{shouldCloseOnBlur}
		class={className}
		onmousedown={handleMouseDown}
		onwheel={handleWheel}
		{...contentProps}
	>
		{#if children}
			{@render children()}
		{/if}
	</Popover.Content>
</Popover.Root>
