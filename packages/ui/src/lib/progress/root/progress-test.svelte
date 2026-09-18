<script lang="ts">
	import { Progress } from '../index';
	import type { ProgressContext, ProgressOrientation } from '../index';

	type Props = {
		value?: number | null;
		min?: number;
		max?: number;
		format?: Intl.NumberFormatOptions;
		getValueText?: (formattedValue: string, value: number | null) => string;
		ariaValueText?: string;
		ariaLabelledBy?: string;
		ariaLabel?: string;
		orientation?: ProgressOrientation;
		showLabel?: boolean;
		showSecondLabel?: boolean;
		customValue?: boolean;
	};

	let {
		value = 31,
		min,
		max,
		format,
		getValueText,
		ariaValueText,
		ariaLabelledBy,
		ariaLabel,
		orientation,
		showLabel = true,
		showSecondLabel = false,
		customValue = false
	}: Props = $props();

	let context = $state<ProgressContext>();
	let element = $state<HTMLDivElement | null>(null);

	let currentValue = $state<number | null | undefined>(undefined);
	let showLabelOverride = $state<boolean | null>(null);

	const renderedValue = $derived(currentValue === undefined ? value : currentValue);
	const renderedShowLabel = $derived(showLabelOverride ?? showLabel);
</script>

<span id="outside-label" data-testid="outside-label">Outside</span>

<Progress.Root
	value={renderedValue}
	{min}
	{max}
	{format}
	{getValueText}
	{orientation}
	aria-valuetext={ariaValueText}
	aria-labelledby={ariaLabelledBy}
	aria-label={ariaLabel}
	bind:context
	bind:element
	data-testid="progress"
>
	{#if renderedShowLabel}
		<Progress.Label data-testid="label">Export data</Progress.Label>
	{/if}
	{#if showSecondLabel}
		<Progress.Label data-testid="label-2">to the archive</Progress.Label>
	{/if}
	{#if customValue}
		<Progress.Value data-testid="value">
			{#snippet children(state)}
				{state.status === 'indeterminate' ? 'Working' : `${state.value} of ${max ?? 100}`}
			{/snippet}
		</Progress.Value>
	{:else}
		<Progress.Value data-testid="value" />
	{/if}
	<Progress.Track data-testid="track" style="width: 200px; height: 8px;">
		<Progress.Indicator data-testid="indicator" />
	</Progress.Track>
</Progress.Root>

<button type="button" data-set-value="50" onclick={() => (currentValue = 50)}>50</button>
<button type="button" data-set-value="100" onclick={() => (currentValue = 100)}>100</button>
<button type="button" data-set-value="null" onclick={() => (currentValue = null)}>null</button>
<pre data-testid="context">{JSON.stringify(
		context && {
			value: context.value,
			min: context.min,
			max: context.max,
			percent: context.percent,
			status: context.status,
			formattedValue: context.formattedValue,
			valueText: context.valueText
		}
	)}</pre>
<span data-testid="element">{element?.dataset.testid}</span>
<button type="button" data-remove-label onclick={() => (showLabelOverride = false)}>
	Remove label
</button>
