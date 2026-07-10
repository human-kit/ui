<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setClockContext, type ClockContext } from './context';
	import { resolveVisibleColumns, type ClockColumnInfo } from './resolve-visible-columns';
	import { createTimeSelectionState } from './create-time-selection-state.svelte';
	import ClockWheelColumn from '../wheel-column/clock-wheel-column.svelte';
	import type {
		TimePickerGranularity,
		TimePickerHourCycle,
		TimePickerTimeValue
	} from './time-utils';

	type ClockRootProps = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> & {
		id?: string;
		value?: TimePickerTimeValue | null;
		defaultValue?: TimePickerTimeValue | null;
		onChange?: (value: TimePickerTimeValue | null) => void;
		minValue?: TimePickerTimeValue;
		maxValue?: TimePickerTimeValue;
		hourCycle?: TimePickerHourCycle;
		granularity?: TimePickerGranularity;
		hourStep?: number;
		minuteStep?: number;
		secondStep?: number;
		disabled?: boolean;
		column?: Snippet<[ClockColumnInfo]>;
		children?: Snippet;
		class?: string;
		element?: HTMLDivElement | null;
		'aria-label'?: string;
	};

	const generatedInstanceId = $props.id();

	let {
		id,
		value = $bindable(),
		defaultValue,
		onChange,
		minValue,
		maxValue,
		hourCycle,
		granularity = 'minute',
		hourStep = 1,
		minuteStep = 1,
		secondStep = 1,
		disabled = false,
		column: columnSnippet,
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		'aria-label': ariaLabel,
		...restProps
	}: ClockRootProps = $props();

	let rootRef: HTMLDivElement | null = $state(null);

	$effect(() => {
		element = rootRef;
	});

	function hasExplicitPositionClass(value: string): boolean {
		return /(^|\s)(?:[\w-]+:)*(?:static|fixed|absolute|relative|sticky)(?:\s|$)/.test(value);
	}

	const resolvedClassName = $derived.by(() => {
		const trimmed = className.trim();
		if (trimmed.length === 0) return 'relative';
		if (hasExplicitPositionClass(trimmed)) return trimmed;
		return `${trimmed} relative`;
	});

	const instanceId = untrack(() => id) ?? generatedInstanceId;

	const timeSelection = createTimeSelectionState({
		value: () => value,
		defaultValue: () => defaultValue,
		writeValue: (next) => {
			value = next;
		},
		onChange: (next) => onChange?.(next),
		minValue: () => minValue,
		maxValue: () => maxValue,
		hourCycle: () => hourCycle,
		granularity: () => granularity,
		hourStep: () => hourStep,
		minuteStep: () => minuteStep,
		secondStep: () => secondStep,
		isEditable: () => !disabled
	});

	const context: ClockContext = {
		get id() {
			return instanceId;
		},
		get locale() {
			return timeSelection.locale;
		},
		get isDisabled() {
			return disabled;
		},
		get granularity() {
			return granularity;
		},
		get hourCycle() {
			return timeSelection.hourCycle;
		},
		get open() {
			return true;
		},
		get isInvalidDraft() {
			return timeSelection.isInvalidDraft;
		},
		selectWheelValue: timeSelection.selectWheelValue,
		getSelectedWheelValue: timeSelection.getSelectedWheelValue,
		getWheelOptions: timeSelection.getWheelOptions,
		getSegmentLabel: timeSelection.getSegmentLabel
	};

	setClockContext(context);

	const visibleColumns = $derived.by(() =>
		resolveVisibleColumns(granularity, timeSelection.hourCycle, timeSelection.getSegmentLabel)
	);
</script>

<div
	bind:this={rootRef}
	id={instanceId}
	class={resolvedClassName}
	role="group"
	aria-label={ariaLabel}
	data-clock="true"
	data-invalid={timeSelection.isInvalidDraft || undefined}
	{...restProps}
>
	{#if columnSnippet}
		{#each visibleColumns as col (col.type)}
			{@render columnSnippet(col)}
		{/each}
		{#if children}
			{@render children()}
		{/if}
	{:else if children}
		{@render children()}
	{:else}
		{#each visibleColumns as col (col.type)}
			<ClockWheelColumn type={col.type} />
		{/each}
	{/if}
</div>
