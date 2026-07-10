<script lang="ts">
	import { untrack } from 'svelte';
	import * as Clock from '../index.parts';
	import type { ClockColumnInfo } from './resolve-visible-columns';

	type Props = {
		defaultValue?: string | null;
		hourCycle?: 12 | 24;
		granularity?: 'hour' | 'minute' | 'second';
		hourStep?: number;
		minValue?: string;
		maxValue?: string;
		disabled?: boolean;
		useSnippet?: boolean;
		showAxis?: boolean;
		axisHeight?: number;
		externalValue?: string;
	};

	let {
		defaultValue = '14:30',
		hourCycle = 24,
		granularity = 'minute',
		hourStep = 1,
		minValue,
		maxValue,
		disabled = false,
		useSnippet = false,
		showAxis = false,
		axisHeight,
		externalValue = '23:00'
	}: Props = $props();

	let value = $state<string | null>(untrack(() => defaultValue ?? null));
	let cycle = $state<12 | 24>(untrack(() => hourCycle));
</script>

{#if useSnippet}
	<Clock.Root
		bind:value
		hourCycle={cycle}
		{granularity}
		{hourStep}
		{minValue}
		{maxValue}
		{disabled}
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
		hourCycle={cycle}
		{granularity}
		{hourStep}
		{minValue}
		{maxValue}
		{disabled}
		class="flex gap-2"
	/>
{/if}

<p data-testid="clock-value">{value}</p>
<button type="button" data-testid="toggle-cycle" onclick={() => (cycle = cycle === 12 ? 24 : 12)}>
	Toggle cycle
</button>
<button type="button" data-testid="set-external" onclick={() => (value = externalValue)}>
	Set external value
</button>
