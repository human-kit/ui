<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		createCalendarContext,
		setCalendarContext,
		type CalendarRangeValue,
		type CalendarSelectionMode,
		type CalendarValue
	} from './context';
	import { useLocaleContextOptional } from '../../locale-provider/context';
	import { isValidCalendarDateValue, type CalendarDateValue } from './date-utils';

	function isRangeValue(
		valueToCheck: CalendarValue | undefined
	): valueToCheck is CalendarRangeValue {
		if (!valueToCheck || typeof valueToCheck === 'string') return false;
		return true;
	}

	function normalizeRangeValue(
		valueToCheck: CalendarRangeValue | undefined
	): CalendarRangeValue | undefined {
		if (!valueToCheck) return undefined;
		const start =
			valueToCheck.start && isValidCalendarDateValue(valueToCheck.start)
				? valueToCheck.start
				: undefined;
		const end =
			valueToCheck.end && isValidCalendarDateValue(valueToCheck.end) ? valueToCheck.end : undefined;
		if (!start && !end) return undefined;
		return { start, end };
	}

	type CalendarRootProps = {
		selectionMode?: CalendarSelectionMode;
		visibleMonths?: number;
		showOutsideDays?: boolean;
		isDateUnavailable?: (date: string) => boolean;
		isDisabled?: boolean;
		isReadOnly?: boolean;
		children?: Snippet;
		class?: string;
		id?: string;
		'aria-label'?: string;
	};

	type CalendarRootSingleProps = CalendarRootProps & {
		selectionMode?: 'single';
		value?: CalendarDateValue;
		defaultValue?: CalendarDateValue;
		onChange?: (value: CalendarDateValue) => void;
	};

	type CalendarRootRangeProps = CalendarRootProps & {
		selectionMode: 'range';
		value?: CalendarRangeValue;
		defaultValue?: CalendarRangeValue;
		onChange?: (value: CalendarRangeValue) => void;
	};

	type CalendarRootTypedProps = CalendarRootSingleProps | CalendarRootRangeProps;

	let {
		selectionMode = 'single',
		visibleMonths = 1,
		showOutsideDays = false,
		isDateUnavailable,
		isDisabled = false,
		isReadOnly = false,
		value = $bindable(),
		defaultValue,
		onChange,
		children,
		class: className = '',
		id,
		'aria-label': ariaLabel
	}: CalendarRootTypedProps = $props();

	function isCalendarRangeValue(valueToCheck: CalendarValue): valueToCheck is CalendarRangeValue {
		if (!valueToCheck || typeof valueToCheck === 'string') return false;
		return true;
	}

	const localeContext = useLocaleContextOptional();
	const localeStore = localeContext?.locale;
	const localeFromContext = $derived.by(() => {
		if (!localeStore) return undefined;
		return $localeStore;
	});
	const resolvedLocale = $derived(
		localeFromContext ?? Intl.DateTimeFormat().resolvedOptions().locale
	);

	function getSyncOptions() {
		const normalizedDefaultValue =
			selectionMode === 'range'
				? normalizeRangeValue(isRangeValue(defaultValue) ? defaultValue : undefined)
				: typeof defaultValue === 'string' && isValidCalendarDateValue(defaultValue)
					? defaultValue
					: undefined;

		return {
			selectionMode,
			visibleMonths,
			showOutsideDays,
			locale: resolvedLocale,
			isDateUnavailable,
			isDisabled,
			isReadOnly,
			value,
			defaultValue: normalizedDefaultValue,
			onChange: (nextValue: CalendarValue) => {
				if (selectionMode === 'range' && isCalendarRangeValue(nextValue)) {
					(onChange as ((value: CalendarRangeValue) => void) | undefined)?.(nextValue);
				} else if (selectionMode !== 'range' && typeof nextValue === 'string') {
					(onChange as ((value: CalendarDateValue) => void) | undefined)?.(nextValue);
				}
				value = nextValue;
			}
		};
	}

	const context = createCalendarContext(getSyncOptions());

	setCalendarContext(context);

	$effect(() => {
		context.sync(getSyncOptions());
	});
</script>

<div
	{id}
	class={className}
	data-disabled={isDisabled || undefined}
	data-readonly={isReadOnly || undefined}
	inert={isDisabled || undefined}
	aria-label={ariaLabel}
>
	{#if children}
		{@render children()}
	{/if}
</div>
