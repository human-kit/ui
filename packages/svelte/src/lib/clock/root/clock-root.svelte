<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useLocaleContextOptional } from '../../locale-provider/context';
	import { setClockContext, type ClockContext } from './context';
	import { resolveVisibleColumns, type ClockColumnInfo } from './resolve-visible-columns';
	import ClockWheelColumn from '../wheel-column/clock-wheel-column.svelte';
	import {
		buildTimePartsFromDraft,
		clampToStep,
		createEmptyTimePickerDraft,
		formatTimePickerValue,
		getSegmentLabel,
		isSegmentValueEmpty,
		isTimeOutOfRange,
		isValidTimePickerValue,
		normalizeSegmentNumberInput,
		toDraftFromTimeValue,
		type TimePickerDraft,
		type TimePickerEditableSegmentType,
		type TimePickerGranularity,
		type TimePickerHourCycle,
		type TimePickerTimeValue
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
		isDisabled?: boolean;
		column?: Snippet<[ClockColumnInfo]>;
		children?: Snippet;
		class?: string;
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
		isDisabled = false,
		column: columnSnippet,
		children,
		class: className = '',
		'aria-label': ariaLabel,
		...restProps
	}: ClockRootProps = $props();

	const instanceId = untrack(() => id) ?? generatedInstanceId;
	const localeContext = useLocaleContextOptional();
	const localeStore = localeContext?.locale;
	const localeFromContext = $derived.by(() => {
		if (!localeStore) return undefined;
		return $localeStore;
	});
	const systemLocale = untrack(() => Intl.DateTimeFormat().resolvedOptions().locale);
	const resolvedLocale = $derived(localeFromContext ?? systemLocale);
	const resolvedHourCycle = $derived.by<TimePickerHourCycle>(() => {
		if (hourCycle) return hourCycle;
		const localeCycle = new Intl.DateTimeFormat(resolvedLocale, {
			hour: 'numeric'
		}).resolvedOptions().hourCycle;
		return localeCycle === 'h11' || localeCycle === 'h12' ? 12 : 24;
	});

	const initialValueProp = untrack(() => value);
	const initialDefaultValue = untrack(() =>
		isValidTimePickerValue(defaultValue) ? defaultValue : null
	);
	const initialPropValue =
		initialValueProp === undefined
			? initialDefaultValue
			: isValidTimePickerValue(initialValueProp)
				? initialValueProp
				: null;
	const initialHourCycle = untrack<TimePickerHourCycle>(() => {
		if (hourCycle) return hourCycle;
		const localeCycle = new Intl.DateTimeFormat(resolvedLocale, {
			hour: 'numeric'
		}).resolvedOptions().hourCycle;
		return localeCycle === 'h11' || localeCycle === 'h12' ? 12 : 24;
	});

	let valueInternal = $state<TimePickerTimeValue | null>(initialPropValue);
	let lastPublishedValue = $state<TimePickerTimeValue | null>(initialPropValue);
	let segmentDraft = $state<TimePickerDraft>(
		initialPropValue
			? toDraftFromTimeValue(initialPropValue, initialHourCycle)
			: createEmptyTimePickerDraft()
	);

	if (initialValueProp === undefined) {
		value = initialPropValue;
	} else if (initialValueProp !== initialPropValue) {
		value = initialPropValue;
	}

	$effect(() => {
		const nextValue = value === undefined ? null : isValidTimePickerValue(value) ? value : null;
		if (nextValue === lastPublishedValue) return;
		publishCommittedValue(nextValue, false);
		segmentDraft = nextValue
			? toDraftFromTimeValue(nextValue, resolvedHourCycle)
			: createEmptyTimePickerDraft();
	});

	const normalizedMinValue = $derived(isValidTimePickerValue(minValue) ? minValue : undefined);
	const normalizedMaxValue = $derived(isValidTimePickerValue(maxValue) ? maxValue : undefined);

	function publishCommittedValue(
		nextValue: TimePickerTimeValue | null,
		emitChange: boolean
	): boolean {
		const bindableValue = value === undefined ? valueInternal : value;
		const normalizedBindableValue = isValidTimePickerValue(bindableValue) ? bindableValue : null;
		const didInternalChange = valueInternal !== nextValue;
		const didBindableChange = normalizedBindableValue !== nextValue;
		if (!didInternalChange && !didBindableChange) return false;

		valueInternal = nextValue;
		lastPublishedValue = nextValue;
		if (didBindableChange) {
			value = nextValue;
		}
		if (emitChange && didInternalChange) {
			onChange?.(nextValue);
		}
		return true;
	}

	function getSegmentValue(type: TimePickerEditableSegmentType): string {
		if (type === 'hour') return segmentDraft.hour;
		if (type === 'minute') return segmentDraft.minute;
		if (type === 'second') return segmentDraft.second;
		return segmentDraft.dayPeriod;
	}

	function setSegmentValue(type: TimePickerEditableSegmentType, nextValue: string) {
		if (isDisabled) return;
		if (type === 'dayPeriod') {
			const normalized = nextValue.trim().toUpperCase();
			if (normalized === '' || normalized === 'AM' || normalized === 'PM') {
				segmentDraft.dayPeriod = normalized;
			} else {
				segmentDraft.dayPeriod = '';
			}
		} else {
			const maxDigits = 2;
			let normalized = normalizeSegmentNumberInput(nextValue, maxDigits);
			if (normalized.length > 0) {
				const numeric = Number(normalized);
				if (type === 'hour') {
					if (resolvedHourCycle === 12) {
						normalized = String(clampToStep(numeric, Math.max(1, hourStep), 1, 12));
					} else {
						normalized = String(clampToStep(numeric, Math.max(1, hourStep), 0, 23));
					}
				}
				if (type === 'minute') {
					normalized = String(clampToStep(numeric, Math.max(1, minuteStep), 0, 59));
				}
				if (type === 'second') {
					normalized = String(clampToStep(numeric, Math.max(1, secondStep), 0, 59));
				}
			}

			if (type === 'hour') segmentDraft.hour = normalized;
			if (type === 'minute') segmentDraft.minute = normalized;
			if (type === 'second') segmentDraft.second = normalized;

			if (resolvedHourCycle === 12 && isSegmentValueEmpty(segmentDraft.dayPeriod)) {
				segmentDraft.dayPeriod = 'AM';
			}
		}

		commitFromDraft();
	}

	function commitFromDraft() {
		const nextParts = buildTimePartsFromDraft(segmentDraft, granularity, resolvedHourCycle);
		if (!nextParts) {
			publishCommittedValue(null, true);
			return;
		}

		const candidateValue = formatTimePickerValue(nextParts, granularity);
		if (isTimeOutOfRange(candidateValue, normalizedMinValue, normalizedMaxValue, granularity)) {
			publishCommittedValue(null, true);
			return;
		}

		publishCommittedValue(candidateValue, true);
	}

	function selectWheelValue(type: TimePickerEditableSegmentType, optionValue: string) {
		if (isDisabled) return;

		if (type === 'dayPeriod') {
			setSegmentValue(type, optionValue.toUpperCase());
		} else {
			setSegmentValue(type, optionValue);
		}
	}

	function getSelectedWheelValue(type: TimePickerEditableSegmentType): string | null {
		const selected = getSegmentValue(type);
		return selected.trim().length > 0 ? selected : null;
	}

	function getWheelOptions(type: TimePickerEditableSegmentType) {
		const options: Array<{ value: string; label: string; disabled: boolean }> = [];
		const hasRangeBounds = normalizedMinValue !== undefined || normalizedMaxValue !== undefined;

		const getCandidateFromPartial = (
			partial: Partial<TimePickerDraft>
		): TimePickerTimeValue | null => {
			const candidateDraft: TimePickerDraft = {
				hour: partial.hour ?? segmentDraft.hour,
				minute: partial.minute ?? segmentDraft.minute,
				second: partial.second ?? segmentDraft.second,
				dayPeriod: partial.dayPeriod ?? segmentDraft.dayPeriod
			};
			const parts = buildTimePartsFromDraft(candidateDraft, granularity, resolvedHourCycle);
			if (!parts) return null;
			return formatTimePickerValue(parts, granularity);
		};

		if (type === 'dayPeriod') {
			for (const option of ['AM', 'PM']) {
				const disabled = hasRangeBounds
					? (() => {
							const candidate = getCandidateFromPartial({ dayPeriod: option });
							return candidate
								? isTimeOutOfRange(candidate, normalizedMinValue, normalizedMaxValue, granularity)
								: false;
						})()
					: false;
				options.push({
					value: option,
					label: option,
					disabled
				});
			}
			return options;
		}

		let min = 0;
		let max = 59;
		let step = 1;
		if (type === 'hour') {
			if (resolvedHourCycle === 12) {
				min = 1;
				max = 12;
			} else {
				min = 0;
				max = 23;
			}
			step = Math.max(1, hourStep);
		} else if (type === 'minute') {
			min = 0;
			max = 59;
			step = Math.max(1, minuteStep);
		} else if (type === 'second') {
			min = 0;
			max = 59;
			step = Math.max(1, secondStep);
		}

		for (let current = min; current <= max; current += step) {
			const valueString = String(current);
			const disabled = hasRangeBounds
				? (() => {
						const candidate = getCandidateFromPartial(
							type === 'hour'
								? { hour: valueString }
								: type === 'minute'
									? { minute: valueString }
									: { second: valueString }
						);
						return candidate
							? isTimeOutOfRange(candidate, normalizedMinValue, normalizedMaxValue, granularity)
							: false;
					})()
				: false;

			options.push({
				value: valueString,
				label: String(current).padStart(2, '0'),
				disabled
			});
		}

		return options;
	}

	function getSegmentLabelByType(type: TimePickerEditableSegmentType): string {
		return getSegmentLabel(type, resolvedLocale);
	}

	const context: ClockContext = {
		get id() {
			return instanceId;
		},
		get isDisabled() {
			return isDisabled;
		},
		get granularity() {
			return granularity;
		},
		get hourCycle() {
			return resolvedHourCycle;
		},
		get open() {
			return true;
		},
		selectWheelValue,
		getSelectedWheelValue,
		getWheelOptions,
		getSegmentLabel: getSegmentLabelByType
	};

	setClockContext(context);

	const visibleColumns = $derived.by(() =>
		resolveVisibleColumns(granularity, resolvedHourCycle, getSegmentLabelByType)
	);
</script>

<div id={instanceId} class={className} aria-label={ariaLabel} data-clock="true" {...restProps}>
	{#if columnSnippet}
		{#each visibleColumns as col (col.type)}
			{@render columnSnippet(col)}
		{/each}
	{:else if children}
		{@render children()}
	{:else}
		{#each visibleColumns as col (col.type)}
			<ClockWheelColumn type={col.type} />
		{/each}
	{/if}
</div>
