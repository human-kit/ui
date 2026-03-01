<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useTimePickerContext } from '../root/context';
	import { resolveVisibleColumns, type TimePanelColumnInfo } from './resolve-visible-columns';
	import TimePickerColumn from '../column/time-picker-column.svelte';

	type TimePickerTimePanelProps = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> & {
		column?: Snippet<[TimePanelColumnInfo]>;
		class?: string;
	};

	let {
		column: columnSnippet,
		class: className = '',
		...restProps
	}: TimePickerTimePanelProps = $props();

	const timePicker = useTimePickerContext();
	const visibleColumns = $derived.by(() =>
		resolveVisibleColumns(timePicker.granularity, timePicker.hourCycle, timePicker.getSegmentLabel)
	);
</script>

<div class={className || 'flex gap-2'} data-time-picker-time-panel="true" {...restProps}>
	{#each visibleColumns as col (col.type)}
		{#if columnSnippet}
			{@render columnSnippet(col)}
		{:else}
			<TimePickerColumn type={col.type} />
		{/if}
	{/each}
</div>
