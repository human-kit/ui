<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setClockContext, type ClockContext } from '../../clock/root/context';
	import {
		resolveVisibleColumns,
		type ClockColumnInfo
	} from '../../clock/root/resolve-visible-columns';
	import ClockWheelColumn from '../../clock/wheel-column/clock-wheel-column.svelte';
	import { useTimePickerContext } from '../root/context';

	type TimePickerClockProps = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> & {
		column?: Snippet<[ClockColumnInfo]>;
		class?: string;
	};

	let {
		column: columnSnippet,
		class: className = '',
		...restProps
	}: TimePickerClockProps = $props();

	const timePicker = useTimePickerContext();

	const context: ClockContext = {
		get id() {
			return timePicker.id;
		},
		get locale() {
			return timePicker.locale;
		},
		get isDisabled() {
			return timePicker.isDisabled;
		},
		get granularity() {
			return timePicker.granularity;
		},
		get hourCycle() {
			return timePicker.hourCycle;
		},
		get open() {
			return timePicker.open;
		},
		selectWheelValue: timePicker.selectWheelValue,
		getSelectedWheelValue: timePicker.getSelectedWheelValue,
		getWheelOptions: timePicker.getWheelOptions,
		getSegmentLabel: timePicker.getSegmentLabel
	};

	setClockContext(context);

	const visibleColumns = $derived.by(() =>
		resolveVisibleColumns(context.granularity, context.hourCycle, context.getSegmentLabel)
	);
</script>

<div class={className} data-clock="true" {...restProps}>
	{#each visibleColumns as col (col.type)}
		{#if columnSnippet}
			{@render columnSnippet(col)}
		{:else}
			<ClockWheelColumn type={col.type} />
		{/if}
	{/each}
</div>
