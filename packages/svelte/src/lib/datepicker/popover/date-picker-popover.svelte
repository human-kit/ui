<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useDatePickerContext } from '../root/context';
	import { Popover } from '../../popover';

	type DatePickerPopoverProps = {
		class?: string;
		children?: Snippet;
	};

	let { class: className = '', children }: DatePickerPopoverProps = $props();

	const datePicker = useDatePickerContext();

	function handleOpenChange(nextOpen: boolean) {
		datePicker.onOpenChange(nextOpen);
	}

	function resolveInitialCalendarFocus(): HTMLElement | null {
		const activeDayCell = document.querySelector<HTMLElement>(
			'[role="dialog"] [role="gridcell"][tabindex="0"]'
		);
		if (activeDayCell) {
			activeDayCell.dataset.implicitFocus = 'true';
		}
		return activeDayCell;
	}
</script>

<Popover.Root
	open={datePicker.open}
	triggerRef={datePicker.triggerRef}
	onOpenChange={handleOpenChange}
>
	<Popover.Content
		placement="bottom-start"
		class={className}
		initialFocus={resolveInitialCalendarFocus}
	>
		{#if children}
			{@render children()}
		{/if}
	</Popover.Content>
</Popover.Root>
