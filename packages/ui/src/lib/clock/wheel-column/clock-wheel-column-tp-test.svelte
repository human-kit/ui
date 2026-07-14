<script lang="ts">
	import { untrack } from 'svelte';
	import * as Clock from '../index.parts';
	import type { ClockColumnInfo } from '../root/resolve-visible-columns';

	type Props = {
		defaultValue?: string;
		defaultOpen?: boolean;
		hourCycle?: 12 | 24;
		granularity?: 'hour' | 'minute' | 'second';
		minValue?: string;
		maxValue?: string;
		useSnippet?: boolean;
	};

	let {
		defaultValue = '14:30',
		hourCycle = 24,
		granularity = 'minute',
		minValue,
		maxValue,
		useSnippet = false
	}: Props = $props();

	let value = $state<string | null>(untrack(() => defaultValue));
</script>

{#if useSnippet}
	<Clock.Root bind:value {hourCycle} {granularity} {minValue} {maxValue} class="flex gap-2">
		{#snippet column(col: ClockColumnInfo)}
			<div data-testid="panel-column" data-type={col.type}>{col.label}</div>
		{/snippet}
	</Clock.Root>
{:else}
	<Clock.Root bind:value {hourCycle} {granularity} {minValue} {maxValue} class="flex gap-2" />
{/if}

<p data-testid="clock-value">{value}</p>
