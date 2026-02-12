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
	import { isValidCalendarDateValue } from './date-utils';

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
		isDateUnavailable?: (date: string) => boolean;
		isDisabled?: boolean;
		isReadOnly?: boolean;
		value?: CalendarValue;
		defaultValue?: CalendarValue;
		onChange?: (value: CalendarValue) => void;
		children?: Snippet;
		class?: string;
		id?: string;
		'aria-label'?: string;
	};

	let {
		selectionMode = 'single',
		visibleMonths = 1,
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
	}: CalendarRootProps = $props();

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
			locale: resolvedLocale,
			isDateUnavailable,
			isDisabled,
			isReadOnly,
			value,
			defaultValue: normalizedDefaultValue,
			onChange: (nextValue: CalendarValue) => {
				onChange?.(nextValue);
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
