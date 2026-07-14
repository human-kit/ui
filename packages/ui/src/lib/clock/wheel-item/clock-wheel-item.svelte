<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ClockEditableSegmentType } from '../root/context';

	type TimePickerWheelOption = {
		value: string;
		label: string;
		disabled: boolean;
	};

	type TimePickerWheelItemProps = Omit<
		HTMLAttributes<HTMLDivElement>,
		'class' | 'children' | 'onclick'
	> & {
		type: ClockEditableSegmentType;
		option: TimePickerWheelOption;
		selected?: boolean;
		onRequestCenter?: () => void;
		class?: string;
	};

	let {
		type,
		option,
		selected = false,
		onRequestCenter,
		class: className = '',
		...restProps
	}: TimePickerWheelItemProps = $props();

	function handleClick(event: MouseEvent) {
		if (!onRequestCenter) return;
		// Mark the click as handled so the wheel-column container (which also
		// listens for clicks to support custom snippet items) doesn't issue a
		// duplicate center request for the same click.
		event.preventDefault();
		onRequestCenter();
	}
</script>

<div
	data-wheel-item
	data-type={type}
	data-value={option.value}
	data-disabled={option.disabled || undefined}
	data-selected={selected || undefined}
	data-centered={selected || undefined}
	aria-hidden="true"
	class={className}
	onclick={handleClick}
	{...restProps}
>
	{option.label}
</div>
