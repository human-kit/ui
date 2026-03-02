<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { TimePickerEditableSegmentType } from '../root/context';

	type TimePickerWheelOption = {
		value: string;
		label: string;
		disabled: boolean;
	};

	type TimePickerWheelItemProps = Omit<
		HTMLAttributes<HTMLDivElement>,
		'class' | 'children' | 'onclick'
	> & {
		type: TimePickerEditableSegmentType;
		option: TimePickerWheelOption;
		selected?: boolean;
		onrequestcenter?: () => void;
		class?: string;
	};

	let {
		type,
		option,
		selected = false,
		onrequestcenter,
		class: className = '',
		...restProps
	}: TimePickerWheelItemProps = $props();

	const defaultVisualStyle = $derived.by(() => {
		if (className.trim().length > 0) return '';
		const opacity = option.disabled ? '0.30' : selected ? '1' : '0.45';
		const fontWeight = selected ? '500' : '400';
		const cursor = option.disabled ? 'not-allowed' : 'pointer';
		return [
			'display:flex',
			'align-items:center',
			'justify-content:center',
			'min-height:2rem',
			'padding:0 0.5rem',
			'border-radius:0.375rem',
			'user-select:none',
			`opacity:${opacity}`,
			`font-weight:${fontWeight}`,
			`cursor:${cursor}`,
			'transition:opacity 120ms ease'
		].join(';');
	});

	function handleClick() {
		onrequestcenter?.();
	}
</script>

<div
	data-wheel-item
	data-type={type}
	data-value={option.value}
	data-disabled={option.disabled || undefined}
	data-selected={selected || undefined}
	aria-hidden="true"
	class={className}
	style={defaultVisualStyle}
	onclick={handleClick}
	{...restProps}
>
	{option.label}
</div>
