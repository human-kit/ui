<script lang="ts">
	import { Popover } from '../../popover';
	import type { PopoverOpenChangeDetails } from '../../popover/root/context';
	import { containWheel } from '../../primitives/contain-wheel';
	import { useSelectContext, type SelectCloseReason } from '../root/context';
	import type { ComponentProps, Snippet } from 'svelte';

	type SelectPopoverProps = Omit<
		ComponentProps<typeof Popover.Content>,
		'open' | 'triggerRef' | 'onOpenChange' | 'children' | 'role' | 'initialFocus'
	> & {
		/** The content: the list. */
		children?: Snippet;
	};

	/**
	 * Select.Popover — the floating panel that holds the list.
	 *
	 * It is `Popover.Content` with the state of the select. The panel is not a dialog: it has
	 * `role="presentation"`, thus the listbox inside it is what the trigger controls and what
	 * assistive technology lands on.
	 */
	let {
		class: className = '',
		children,
		placement = 'bottom-start',
		nonModal = true,
		onwheel: onWheelExternal,
		...contentProps
	}: SelectPopoverProps = $props();

	const ctx = useSelectContext('Select.Popover');

	const POPOVER_TO_SELECT_REASON: Record<string, SelectCloseReason> = {
		'escape-key': 'escape-key',
		'outside-press': 'outside-press',
		'focus-out': 'focus-out',
		scroll: 'scroll',
		'close-press': 'imperative-action',
		'imperative-action': 'imperative-action',
		none: 'none'
	};

	// The root holds the open state. A close that `Popover.Content` asks for (Escape, an
	// outside press, a Tab out, a scroll) goes to the root, and a refusal of the consumer goes
	// back to `Popover.Root` through the same details, so both agree. `Popover.Root` then
	// applies the focus state of the trigger, as it does for every popover.
	function handleOpenChange(open: boolean, details: PopoverOpenChangeDetails) {
		if (open) {
			ctx.open('trigger-press', details.event);
			return;
		}
		const reason = POPOVER_TO_SELECT_REASON[details.reason] ?? 'imperative-action';
		if (!ctx.close(reason, details.event)) {
			details.cancel();
		}
	}

	function handleWheel(event: WheelEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		containWheel(event, event.currentTarget);
		onWheelExternal?.(event);
	}
</script>

<Popover.Root open={ctx.isOpen} triggerRef={ctx.triggerRef} onOpenChange={handleOpenChange}>
	<Popover.Content
		{nonModal}
		{placement}
		class={className}
		role="presentation"
		aria-modal={undefined}
		data-select-popover="true"
		onwheel={handleWheel}
		{...contentProps}
	>
		{#if children}
			{@render children()}
		{/if}
	</Popover.Content>
</Popover.Root>
