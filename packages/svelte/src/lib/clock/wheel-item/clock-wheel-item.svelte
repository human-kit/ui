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

	function handleClick() {
		onRequestCenter?.();
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
