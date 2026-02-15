<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useDatePickerContext } from '../root/context';
	import { Popover } from '../../popover';
	import type { PopoverOpenChangeDetails } from '../../popover/root/context';

	type DatePickerPopoverProps = {
		class?: string;
		children?: Snippet;
		'aria-label'?: string;
	};

	let {
		class: className = '',
		children,
		'aria-label': ariaLabel = 'Calendar'
	}: DatePickerPopoverProps = $props();

	const datePicker = useDatePickerContext();
	const dialogId = `${datePicker.id}-popover`;

	function handleOpenChange(nextOpen: boolean, details: PopoverOpenChangeDetails) {
		datePicker.onOpenChange(nextOpen, details);
	}

	function resolveInitialCalendarFocus(): HTMLElement | null {
		const dialog = document.getElementById(dialogId);
		const activeDayCell = dialog?.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"]');
		if (activeDayCell) {
			activeDayCell.dataset.implicitFocus = 'true';
		}
		return activeDayCell ?? null;
	}
</script>

<Popover.Root
	open={datePicker.open}
	triggerRef={datePicker.triggerRef}
	onOpenChange={handleOpenChange}
>
	<Popover.Content
		id={dialogId}
		placement="bottom-start"
		class={className}
		aria-label={ariaLabel}
		initialFocus={resolveInitialCalendarFocus}
	>
		{#if children}
			{@render children()}
		{/if}
	</Popover.Content>
</Popover.Root>
