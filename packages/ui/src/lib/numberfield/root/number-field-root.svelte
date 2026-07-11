<script lang="ts">
	import { get, readable } from 'svelte/store';
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../../utils/cn';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { useLocaleContextOptional } from '../../locale-provider/context';
	import {
		clampNumber,
		formatNumberValue,
		isValueOutOfRange,
		parseNumberInput,
		resolveNumberFieldLocale,
		roundNumberValueToFormat,
		stepNumberValue,
		type NumberFieldStep
	} from './number-utils';
	import {
		setNumberFieldContext,
		type NumberFieldChangeReason,
		type NumberFieldContext,
		type NumberFieldInputState
	} from './context';

	type NumberFieldRootProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'id'> & {
		children?: Snippet;
		class?: string;
		id?: string;
		value?: number | null;
		defaultValue?: number | null;
		onChange?: (value: number | null) => void;
		formatOptions?: Intl.NumberFormatOptions;
		min?: number;
		max?: number;
		step?: NumberFieldStep;
		smallStep?: number;
		largeStep?: number;
		disabled?: boolean;
		readonly?: boolean;
		required?: boolean;
		invalid?: boolean;
		'aria-invalid'?: HTMLAttributes<HTMLDivElement>['aria-invalid'];
		allowWheelScrub?: boolean;
		allowOutOfRange?: boolean;
		snapOnStep?: boolean;
		name?: string;
		incrementAriaLabel?: string;
		decrementAriaLabel?: string;
	};

	function normalizeValue(value: number | null | undefined): number | null {
		return typeof value === 'number' && Number.isFinite(value) ? value : null;
	}

	function resolveLocalizedLabel(
		type: 'increment' | 'decrement',
		locale: string | undefined
	): string {
		return resolveLocalizedString(
			locale,
			type === 'increment' ? 'numberField.increment' : 'numberField.decrement'
		);
	}

	function resolveValidationMessage(options: {
		locale: string | undefined;
		inputState: NumberFieldInputState;
		isInvalid: boolean;
		inputInvalid: boolean;
		outOfRange: boolean;
		min: number | undefined;
		max: number | undefined;
	}): string {
		if (
			options.inputState !== 'out-of-range' &&
			(options.inputState === 'partial' || options.inputState === 'invalid' || options.inputInvalid)
		) {
			return resolveLocalizedString(options.locale, 'numberField.enterValidNumber');
		}

		if (options.inputState === 'out-of-range' || options.outOfRange) {
			if (options.min !== undefined && options.max !== undefined) {
				return resolveLocalizedString(options.locale, 'numberField.valueBetween', {
					min: options.min,
					max: options.max
				});
			}
			if (options.min !== undefined) {
				return resolveLocalizedString(options.locale, 'numberField.valueGreaterOrEqual', {
					min: options.min
				});
			}
			if (options.max !== undefined) {
				return resolveLocalizedString(options.locale, 'numberField.valueLessOrEqual', {
					max: options.max
				});
			}
		}

		if (options.isInvalid) return resolveLocalizedString(options.locale, 'numberField.invalidValue');

		return '';
	}

	const generatedId = $props.id();
	const localeContext = useLocaleContextOptional();
	const emptyLocaleStore = readable<string | undefined>(undefined);
	const localeStore = localeContext?.locale ?? emptyLocaleStore;

	let {
		children,
		class: className,
		id,
		value = $bindable<number | null | undefined>(undefined),
		defaultValue = null,
		onChange,
		formatOptions,
		min,
		max,
		step = 1,
		smallStep = 0.1,
		largeStep = 10,
		disabled = false,
		readonly = false,
		required = false,
		invalid = false,
		'aria-invalid': ariaInvalid,
		allowWheelScrub = false,
		allowOutOfRange = false,
		snapOnStep = false,
		name,
		incrementAriaLabel,
		decrementAriaLabel,
		...restProps
	}: NumberFieldRootProps = $props();

	const rootId = untrack(() => id) ?? generatedId;
	const inputId = `${rootId}-input`;
	const initialValueProp = untrack(() => value);
	const initialDefaultValue = untrack(() => defaultValue);
	const initialFormatOptions = untrack(() => formatOptions);
	const initialLocale = resolveNumberFieldLocale(get(localeStore));
	const initialValue = normalizeValue(
		initialValueProp === undefined ? initialDefaultValue : initialValueProp
	);

	let valueInternal = $state<number | null>(initialValue);
	let lastPublishedValue = $state<number | null>(initialValue);
	let inputValue = $state(formatNumberValue(initialValue, initialLocale, initialFormatOptions));
	let inputState = $state<NumberFieldInputState>(initialValue === null ? 'empty' : 'synced');
	let inputInvalid = $state(false);
	let focused = $state(false);
	let focusVisible = $state(false);
	let focusWithin = $state(false);
	let scrubbing = $state(false);
	let inputRef: HTMLInputElement | null = $state(null);
	let rootRef: HTMLDivElement | null = $state(null);

	const resolvedLocale = $derived(resolveNumberFieldLocale($localeStore));
	const currentValue = $derived(valueInternal);
	const formattedValue = $derived(formatNumberValue(currentValue, resolvedLocale, formatOptions));
	const formValue = $derived(currentValue === null ? '' : String(currentValue));
	const outOfRange = $derived(isValueOutOfRange(currentValue, min, max));
	const resolvedOutOfRange = $derived(inputState === 'out-of-range' || outOfRange);
	const externalInvalid = $derived(ariaInvalid === true || ariaInvalid === 'true');
	const resolvedInvalid = $derived(
		Boolean(invalid || externalInvalid || inputInvalid || resolvedOutOfRange)
	);
	const ariaValueNow = $derived(
		inputState === 'synced' && currentValue !== null ? currentValue : undefined
	);
	const ariaValueText = $derived(
		inputState === 'synced' && currentValue !== null ? formattedValue : undefined
	);
	const validationMessage = $derived(
		resolveValidationMessage({
			locale: resolvedLocale,
			inputState,
			isInvalid: invalid,
			inputInvalid,
			outOfRange: resolvedOutOfRange,
			min,
			max
		})
	);
	const resolvedIncrementAriaLabel = $derived(
		incrementAriaLabel ?? resolveLocalizedLabel('increment', resolvedLocale)
	);
	const resolvedDecrementAriaLabel = $derived(
		decrementAriaLabel ?? resolveLocalizedLabel('decrement', resolvedLocale)
	);

	if (initialValueProp === undefined || initialValueProp !== initialValue) {
		value = initialValue;
	}

	$effect(() => {
		const nextValue = normalizeValue(value);
		if (nextValue === lastPublishedValue) return;

		valueInternal = nextValue;
		lastPublishedValue = nextValue;
		inputInvalid = false;
		inputState = nextValue === null ? 'empty' : 'synced';
		if (!focused && !scrubbing) {
			inputValue = formatNumberValue(nextValue, resolvedLocale, formatOptions);
		}
	});

	$effect(() => {
		if (focused || scrubbing || inputInvalid) return;
		inputValue = formattedValue;
	});

	$effect(() => {
		if (!disabled) return;
		focused = false;
		focusVisible = false;
		focusWithin = false;
		scrubbing = false;
	});

	$effect(() => {
		// Re-evaluate an uncommitted draft when the constraints change so
		// `inputState` doesn't go stale — e.g. an out-of-range "99" draft with
		// max=10 must become valid (and commit) when max is raised to 100
		// without requiring the user to retype it.
		void min;
		void max;
		void formatOptions;
		void resolvedLocale;

		untrack(() => {
			if (inputState === 'synced' || inputState === 'empty') return;
			setInputValue(inputValue, 'input');
		});
	});

	function publishValue(nextValue: number | null, emitChange: boolean) {
		const normalizedValue = normalizeValue(nextValue);
		const didInternalChange = valueInternal !== normalizedValue;
		const didBindableChange = normalizeValue(value) !== normalizedValue;

		if (!didInternalChange && !didBindableChange) return;

		valueInternal = normalizedValue;
		lastPublishedValue = normalizedValue;

		if (didBindableChange) {
			value = normalizedValue;
		}

		if (emitChange && didInternalChange) {
			onChange?.(normalizedValue);
		}
	}

	function commitParsedValue(nextValue: number | null, emitChange: boolean) {
		if (nextValue === null) {
			publishValue(null, emitChange);
			inputInvalid = false;
			inputState = 'empty';
			inputValue = '';
			return;
		}

		publishValue(nextValue, emitChange);
		inputInvalid = false;
		inputState = 'synced';
		inputValue = formatNumberValue(nextValue, resolvedLocale, formatOptions);
	}

	function setInputRef(element: HTMLInputElement | null) {
		inputRef = element;
	}

	function setFocused(nextFocused: boolean) {
		focused = nextFocused;
		if (!nextFocused) {
			focusVisible = false;
		}
	}

	function setFocusVisible(visible: boolean) {
		focusVisible = visible;
	}

	function syncFocusWithin() {
		const activeElement = typeof document === 'undefined' ? null : document.activeElement;
		focusWithin = Boolean(rootRef && activeElement && rootRef.contains(activeElement));
		if (!focusWithin || activeElement !== inputRef) {
			focusVisible = false;
		}
	}

	function setInputValue(nextInputValue: string, reason: NumberFieldChangeReason) {
		if (disabled || readonly) return;

		inputValue = nextInputValue;
		const parsed = parseNumberInput(nextInputValue, resolvedLocale, formatOptions);

		if (parsed.kind === 'empty') {
			inputInvalid = false;
			inputState = 'empty';
			publishValue(null, true);
			return;
		}

		if (parsed.kind === 'valid') {
			const parsedOutOfRange = isValueOutOfRange(parsed.value, min, max);
			if (parsedOutOfRange && !allowOutOfRange) {
				inputInvalid = true;
				inputState = 'out-of-range';
				return;
			}

			inputInvalid = false;
			inputState = 'synced';
			publishValue(parsed.value, true);
			return;
		}

		inputInvalid = parsed.kind === 'invalid';
		inputState = parsed.kind;

		if (reason === 'input-clear') {
			publishValue(null, true);
		}
	}

	function commitInputValue() {
		if (disabled || readonly) return;

		const parsed = parseNumberInput(inputValue, resolvedLocale, formatOptions);

		if (parsed.kind === 'empty') {
			commitParsedValue(null, true);
			return;
		}

		const committableValue =
			parsed.kind === 'valid' || parsed.kind === 'partial' ? parsed.value : null;

		if (committableValue !== null) {
			const parsedOutOfRange = isValueOutOfRange(committableValue, min, max);
			if (parsedOutOfRange && !allowOutOfRange) {
				const clampedValue = clampNumber(committableValue, min, max);
				publishValue(clampedValue, true);
				inputInvalid = false;
				inputState = 'synced';
				inputValue = formatNumberValue(clampedValue, resolvedLocale, formatOptions);
				return;
			}

			commitParsedValue(committableValue, true);
			return;
		}

		inputInvalid = false;
		inputState = currentValue === null ? 'empty' : 'synced';
		inputValue = formattedValue;
	}

	function commitValue(nextValue: number) {
		if (disabled || readonly) return;

		const clampedValue = clampNumber(nextValue, min, max);
		commitParsedValue(roundNumberValueToFormat(clampedValue, resolvedLocale, formatOptions), true);
	}

	function stepBy(
		direction: -1 | 1,
		options: { reason: NumberFieldChangeReason; multiplier?: number }
	) {
		if (disabled || readonly) return;

		const steppedValue = stepNumberValue(currentValue, direction, {
			min,
			max,
			step,
			multiplier: options.multiplier,
			snapOnStep
		});
		const nextValue = roundNumberValueToFormat(steppedValue, resolvedLocale, formatOptions);

		publishValue(nextValue, true);
		inputInvalid = false;
		inputState = 'synced';
		inputValue = formatNumberValue(nextValue, resolvedLocale, formatOptions);
	}

	function setScrubbing(nextScrubbing: boolean) {
		scrubbing = nextScrubbing;
	}

	const numberFieldContext: NumberFieldContext = {
		get id() {
			return rootId;
		},
		get inputId() {
			return inputId;
		},
		get value() {
			return currentValue;
		},
		get inputValue() {
			return inputValue;
		},
		get inputState() {
			return inputState;
		},
		get formValue() {
			return formValue;
		},
		get formattedValue() {
			return formattedValue;
		},
		get ariaValueNow() {
			return ariaValueNow;
		},
		get ariaValueText() {
			return ariaValueText;
		},
		get validationMessage() {
			return validationMessage;
		},
		get min() {
			return min;
		},
		get max() {
			return max;
		},
		get step() {
			return step;
		},
		get smallStep() {
			return smallStep;
		},
		get largeStep() {
			return largeStep;
		},
		get isDisabled() {
			return disabled;
		},
		get isReadOnly() {
			return readonly;
		},
		get isRequired() {
			return required;
		},
		get isInvalid() {
			return resolvedInvalid;
		},
		get isOutOfRange() {
			return resolvedOutOfRange;
		},
		get allowWheelScrub() {
			return allowWheelScrub;
		},
		get allowOutOfRange() {
			return allowOutOfRange;
		},
		get snapOnStep() {
			return snapOnStep;
		},
		get incrementAriaLabel() {
			return resolvedIncrementAriaLabel;
		},
		get decrementAriaLabel() {
			return resolvedDecrementAriaLabel;
		},
		get focused() {
			return focused;
		},
		get focusVisible() {
			return focusVisible;
		},
		get focusWithin() {
			return focusWithin;
		},
		get scrubbing() {
			return scrubbing;
		},
		get inputRef() {
			return inputRef;
		},
		setInputRef,
		setFocused,
		setFocusVisible,
		syncFocusWithin,
		setInputValue,
		commitInputValue,
		commitValue,
		stepBy,
		setScrubbing
	};

	setNumberFieldContext(numberFieldContext);
</script>

<div
	{...restProps}
	bind:this={rootRef}
	id={rootId}
	class={cn(className)}
	data-number-field-root="true"
	data-disabled={disabled || undefined}
	data-readonly={readonly || undefined}
	data-required={required || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-focus-within={focusWithin || undefined}
	data-scrubbing={scrubbing || undefined}
>
	{#if name}
		<input
			type="hidden"
			{name}
			value={formValue}
			disabled={disabled || undefined}
			data-number-field-hidden-input="true"
		/>
	{/if}

	{@render children?.()}
</div>
