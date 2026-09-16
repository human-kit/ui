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

	function handleOpenChange(open: boolean, details: PopoverOpenChangeDetails) {
		if (open) {
			ctx.open('trigger-press', details.event);
			return;
		}
		// The root closes, and it puts the focus back on the trigger. `Popover.Root` would do
		// that itself, but with `data-*` written on the trigger by hand, and only a blur of the
		// trigger removes them: after an outside press the trigger never had the focus, and the
		// attributes would stay for good. So its close is refused, and the state change waits a
		// microtask: `Popover.Root` re-reads the open state right after this callback, and a
		// synchronous change would get past its refusal.
		details.cancel();
		const reason = POPOVER_TO_SELECT_REASON[details.reason] ?? 'imperative-action';
		const event = details.event;
		queueMicrotask(() => {
			ctx.close(reason, event);
		});
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
