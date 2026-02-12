<script lang="ts">
	import type { Snippet } from 'svelte';
	import { createCalendarContext, setCalendarContext } from './context';
	import { useLocaleContextOptional } from '../../locale-provider/context';
	import { isValidCalendarDateValue } from './date-utils';

	type CalendarRootProps = {
		visibleMonths?: number;
		isDateUnavailable?: (date: string) => boolean;
		isDisabled?: boolean;
		isReadOnly?: boolean;
		value?: string;
		defaultValue?: string;
		onChange?: (value: string) => void;
		children?: Snippet;
		class?: string;
		id?: string;
		'aria-label'?: string;
	};

	let {
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

	const context = createCalendarContext({});

	setCalendarContext(context);

	$effect(() => {
		context.sync({
			visibleMonths,
			locale: resolvedLocale,
			isDateUnavailable,
			isDisabled,
			isReadOnly,
			value,
			defaultValue: isValidCalendarDateValue(defaultValue ?? '') ? defaultValue : undefined,
			onChange: (nextValue: string) => {
				onChange?.(nextValue);
				value = nextValue;
			}
		});
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
