<script lang="ts">
	import { untrack } from 'svelte';
	import * as Clock from '../index.parts';
	import type { ClockColumnInfo } from './resolve-visible-columns';

	type Props = {
		defaultValue?: string | null;
		hourCycle?: 12 | 24;
		granularity?: 'hour' | 'minute' | 'second';
		minValue?: string;
		maxValue?: string;
		isDisabled?: boolean;
		useSnippet?: boolean;
		showAxis?: boolean;
		axisHeight?: number;
	};

	let {
		defaultValue = '14:30',
		hourCycle = 24,
		granularity = 'minute',
		minValue,
		maxValue,
		isDisabled = false,
		useSnippet = false,
		showAxis = false,
		axisHeight
	}: Props = $props();

	let value = $state<string | null>(untrack(() => defaultValue ?? null));
</script>

{#if useSnippet}
	<Clock.Root
		bind:value
		{hourCycle}
		{granularity}
		{minValue}
		{maxValue}
		{isDisabled}
		class="flex gap-2"
	>
		{#snippet column(col: ClockColumnInfo)}
			<div data-testid="clock-column" data-type={col.type}>{col.label}</div>
		{/snippet}
		{#if showAxis}
			<Clock.Axis data-testid="clock-axis" height={axisHeight} />
		{/if}
	</Clock.Root>
{:else}
	<Clock.Root
		bind:value
		{hourCycle}
		{granularity}
		{minValue}
		{maxValue}
		{isDisabled}
		class="flex gap-2"
	/>
{/if}

<p data-testid="clock-value">{value}</p>
