<script lang="ts">
	import { untrack } from 'svelte';
	import { readable } from 'svelte/store';
	import { useLocaleContextOptional } from '../../locale-provider/context';
	import type { ProgressRootProps } from '../types.js';
	import { setProgressContext, type ProgressContext } from './context';
	import {
		clampProgressValue,
		formatProgressValue,
		getProgressPercent,
		getProgressStatus,
		normalizeProgressValue
	} from './progress-utils';

	/**
	 * Progress.Root — the status of a task that takes time.
	 *
	 * It is the `role="progressbar"` element, and it holds the numbers for the parts in it. A
	 * screen reader reads its name and its value; it does not read the parts. The value is
	 * `aria-valuenow` with `aria-valuetext`, or nothing at all while the end of the task is not
	 * known: a number for an indeterminate progress would be a lie.
	 */
	const generatedId = $props.id();

	let {
		id: idProp,
		value: valueProp,
		min = 0,
		max = 100,
		format,
		getValueText,
		'aria-valuetext': ariaValueTextProp,
		'aria-labelledby': ariaLabelledBy,
		orientation = 'horizontal',
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		context = $bindable(),
		...restProps
	}: ProgressRootProps = $props();

	const instanceId = untrack(() => idProp) ?? generatedId;

	const localeContext = useLocaleContextOptional();
	const emptyLocaleStore = readable<string | undefined>(undefined);
	const localeStore = localeContext?.locale ?? emptyLocaleStore;

	let rootRef: HTMLDivElement | null = $state(null);
	let labelIds = $state<string[]>([]);

	const rawValue = $derived(normalizeProgressValue(valueProp));
	const value = $derived(rawValue === null ? null : clampProgressValue(rawValue, min, max));
	const percent = $derived(rawValue === null ? null : getProgressPercent(rawValue, min, max));
	const status = $derived(getProgressStatus(rawValue, min, max));
	const formattedValue = $derived(formatProgressValue(rawValue, min, max, $localeStore, format));
	const valueText = $derived.by(() => {
		if (value === null) return undefined;
		if (ariaValueTextProp !== undefined) return ariaValueTextProp;
		if (getValueText) return getValueText(formattedValue, value);
		return formattedValue;
	});
	const labelledBy = $derived(
		ariaLabelledBy ?? (labelIds.length > 0 ? labelIds.join(' ') : undefined)
	);

	const progress: ProgressContext = {
		get id() {
			return instanceId;
		},
		get value() {
			return value;
		},
		get min() {
			return min;
		},
		get max() {
			return max;
		},
		get percent() {
			return percent;
		},
		get status() {
			return status;
		},
		get orientation() {
			return orientation;
		},
		get formattedValue() {
			return formattedValue;
		},
		get valueText() {
			return valueText;
		},
		get labelledBy() {
			return labelledBy;
		},
		// `untrack` because the caller registers from an effect: reading `labelIds` here would
		// make that effect depend on what it writes, and the pair would run without end.
		registerLabel(id: string) {
			untrack(() => {
				labelIds = [...labelIds, id];
			});
			return () =>
				untrack(() => {
					labelIds = labelIds.filter((candidate) => candidate !== id);
				});
		}
	};

	setProgressContext(progress);
	context = progress;

	$effect(() => {
		element = rootRef;
	});
</script>

<div
	{...restProps}
	bind:this={rootRef}
	id={instanceId}
	role="progressbar"
	aria-labelledby={labelledBy}
	aria-valuemin={min}
	aria-valuemax={max}
	aria-valuenow={value ?? undefined}
	aria-valuetext={valueText}
	class={className}
	data-progress-root="true"
	data-orientation={orientation}
	data-progressing={status === 'progressing' || undefined}
	data-complete={status === 'complete' || undefined}
	data-indeterminate={status === 'indeterminate' || undefined}
>
	{@render children?.()}
</div>
