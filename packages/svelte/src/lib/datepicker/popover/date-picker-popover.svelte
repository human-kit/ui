<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { useDatePickerContext } from '../root/context';
	import { Popover } from '../../popover';
	import type { PopoverOpenChangeDetails } from '../../popover/root/context';

	type DatePickerPopoverProps = Omit<
		ComponentProps<typeof Popover.Content>,
		'open' | 'triggerRef' | 'onOpenChange' | 'id'
	>;

	let {
		class: className = '',
		children,
		'aria-label': ariaLabel = 'Calendar',
		initialFocus = resolveInitialCalendarFocus,
		...restProps
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
			if (datePicker.triggerInteractionModality === 'keyboard') {
				delete activeDayCell.dataset.implicitFocus;
			} else {
				activeDayCell.dataset.implicitFocus = 'true';
			}
		}
		datePicker.setTriggerInteractionModality('none');
		return activeDayCell ?? null;
	}

	function handlePointerDown() {
		datePicker.setCalendarInteractionModality('pointer');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		datePicker.setCalendarInteractionModality('keyboard');
	}
</script>

<Popover.Root
	open={datePicker.open}
	triggerRef={datePicker.triggerRef}
	onOpenChange={handleOpenChange}
>
	<Popover.Content
		id={dialogId}
		class={className}
		aria-label={ariaLabel}
		onmousedown={handlePointerDown}
		onkeydowncapture={handleKeydown}
		{initialFocus}
		{...restProps}
	>
		{#if children}
			{@render children()}
		{/if}
	</Popover.Content>
</Popover.Root>
