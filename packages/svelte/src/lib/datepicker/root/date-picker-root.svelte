<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { useLocaleContextOptional } from '../../locale-provider/context';
	import { setDatePickerContext, type DatePickerContext } from './context';
	import {
		buildDatePickerSegments,
		compareDatePickerValues,
		getDatePickerSegmentLabel,
		getDatePickerSegmentOrder,
		isValidDatePickerValue,
		type DatePickerDateValue,
		type DatePickerEditableSegmentType,
		type DatePickerSegmentType
	} from './date-utils';
	import type { DatePickerOpenChangeDetails, DatePickerOpenChangeReason } from './context';
	import {
		clampSegment,
		clampSegmentDraft,
		createEmptySegmentDraft,
		getSegmentNumericValue,
		normalizeSegmentInput,
		toDraftFromValue,
		type DatePickerSegmentDraft,
		type EditableSegmentType
	} from './segment-state';
	import { evaluateDatePickerDraft } from './draft-evaluation';
	import {
		applyTriggerSelectionCloseState,
		computeDatePickerFocusWithin
	} from './focus-controller';
	import { getInteractionModality } from '../../primitives/input-modality';
	import { resolveDatePickerOpenChangeDetails } from './open-controller';
	import { normalizeBindableDatePickerValue, normalizeDatePickerValue } from './value-commit';
	import {
		createDatePickerSegmentRefs,
		focusLastDatePickerSegment,
		focusNextDatePickerSegment,
		focusPreviousDatePickerSegment,
		registerDatePickerSegmentRef
	} from './segment-controller';

	type DatePickerRootProps = {
		id?: string;
		value?: DatePickerDateValue | null;
		defaultValue?: DatePickerDateValue | null;
		onChange?: (value: DatePickerDateValue | null) => void;
		disabled?: boolean;
		readonly?: boolean;
		minValue?: DatePickerDateValue;
		maxValue?: DatePickerDateValue;
		isDateUnavailable?: (date: DatePickerDateValue) => boolean;
		open?: boolean;
		defaultOpen?: boolean;
		onOpenChange?: (open: boolean, details: DatePickerOpenChangeDetails) => void;
		closeOnSelect?: boolean;
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
		disabled = false,
		readonly = false,
		minValue,
		maxValue,
		isDateUnavailable,
		open = $bindable(),
		defaultOpen = false,
		onOpenChange,
		closeOnSelect = true,
		children,
		class: className = '',
		'aria-label': ariaLabel
	}: DatePickerRootProps = $props();

	const instanceId = untrack(() => id) ?? generatedInstanceId;

	let triggerRef: HTMLElement | null = $state(null);
	let openInternal = $state((() => defaultOpen)());
	let focusVisible = $state(false);
	let focusWithin = $state(false);

	const initialValueProp = untrack(() => value);
	const initialDefaultValue = untrack(() =>
		normalizeDatePickerValue(defaultValue, isValidDatePickerValue)
	);
	const initialPropValue =
		initialValueProp === undefined
			? initialDefaultValue
			: normalizeDatePickerValue(initialValueProp, isValidDatePickerValue);

	let valueInternal = $state<DatePickerDateValue | null>(initialPropValue);
	let segmentDraft = $state<DatePickerSegmentDraft>(
		initialPropValue ? toDraftFromValue(initialPropValue) : createEmptySegmentDraft()
	);
	let activeSegment = $state<Exclude<DatePickerSegmentType, 'literal'> | null>(null);
	let segmentTypeBuffer = $state<DatePickerSegmentDraft>(createEmptySegmentDraft());
	let segmentRefs = createDatePickerSegmentRefs();
	let lastPublishedValue = $state<DatePickerDateValue | null>(initialPropValue);

	if (initialValueProp === undefined) {
		value = initialPropValue;
	} else if (initialValueProp !== initialPropValue) {
		value = initialPropValue;
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

	$effect(() => {
		if (open !== undefined && open !== openInternal) {
			openInternal = open;
		}
	});

	$effect(() => {
		if (value === undefined) return;
		const nextValue = normalizeDatePickerValue(value, isValidDatePickerValue);
		if (nextValue === lastPublishedValue) return;
		lastPublishedValue = nextValue;
		valueInternal = nextValue;
		segmentDraft = nextValue ? toDraftFromValue(nextValue) : createEmptySegmentDraft();
		segmentTypeBuffer = createEmptySegmentDraft();
	});

	const normalizedMinValue = $derived(isValidDatePickerValue(minValue) ? minValue : undefined);
	const normalizedMaxValue = $derived(isValidDatePickerValue(maxValue) ? maxValue : undefined);
	const segmentOrder = $derived(getDatePickerSegmentOrder(resolvedLocale));
	const draftEvaluation = $derived.by(() =>
		evaluateDatePickerDraft(segmentDraft, {
			isDateOutOfRange,
			isDateUnavailable: isDateUnavailableInternal
		})
	);
	const isInvalidDraft = $derived(draftEvaluation.isInvalid);

	function publishCommittedValue(
		nextValue: DatePickerDateValue | null,
		emitChange: boolean
	): boolean {
		const normalizedBindableValue = normalizeBindableDatePickerValue(value);
		const didInternalChange = valueInternal !== nextValue;
		const didBindableValueChange = normalizedBindableValue !== nextValue;

		if (!didInternalChange && !didBindableValueChange) return false;

		valueInternal = nextValue;
		if (didBindableValueChange) {
			value = nextValue;
		}
		lastPublishedValue = nextValue;

		if (emitChange && didInternalChange) {
			onChange?.(nextValue);
		}

		return true;
	}

	function closeCalendarAfterSelection(selectionFocusVisible: boolean) {
		setFocusVisible(selectionFocusVisible);
		setOpen(false, { reason: 'close-press' });
		applyTriggerSelectionCloseState(triggerRef, selectionFocusVisible ? 'keyboard' : 'pointer');
	}

	function isDateOutOfRange(valueToCheck: DatePickerDateValue): boolean {
		if (!isValidDatePickerValue(valueToCheck)) return true;
		if (normalizedMinValue && compareDatePickerValues(valueToCheck, normalizedMinValue) < 0) {
			return true;
		}
		if (normalizedMaxValue && compareDatePickerValues(valueToCheck, normalizedMaxValue) > 0) {
			return true;
		}
		return false;
	}

	function isDateUnavailableInternal(valueToCheck: DatePickerDateValue): boolean {
		if (isDateOutOfRange(valueToCheck)) return true;
		return isDateUnavailable?.(valueToCheck) ?? false;
	}

	function setOpen(
		nextOpen: boolean,
		details?: DatePickerOpenChangeDetails | { reason?: DatePickerOpenChangeReason; event?: Event }
	) {
		if (openInternal === nextOpen) return;
		const eventDetails = resolveDatePickerOpenChangeDetails(details);

		onOpenChange?.(nextOpen, eventDetails);
		if (eventDetails.isCanceled) return;

		openInternal = nextOpen;
		open = nextOpen;
	}

	function setValue(nextValue: DatePickerDateValue, source: 'calendar' | 'input' = 'calendar') {
		if (!isValidDatePickerValue(nextValue) || isDateUnavailableInternal(nextValue)) return;
		if (disabled || readonly) return;
		const selectionFocusVisible = getInteractionModality() === 'keyboard';

		if (valueInternal === nextValue) {
			if (source === 'calendar' && closeOnSelect) {
				closeCalendarAfterSelection(selectionFocusVisible);
			}
			return;
		}

		publishCommittedValue(nextValue, true);

		if (source === 'calendar') {
			segmentDraft = toDraftFromValue(nextValue);
			segmentTypeBuffer = createEmptySegmentDraft();
		}

		if (source === 'calendar' && closeOnSelect) {
			closeCalendarAfterSelection(selectionFocusVisible);
		}
	}

	function openPopover(reason: DatePickerOpenChangeReason = 'imperative-action', event?: Event) {
		if (disabled || readonly) return;
		setOpen(true, { reason, event });
	}

	function closePopover(reason: DatePickerOpenChangeReason = 'imperative-action', event?: Event) {
		setOpen(false, { reason, event });
	}

	function togglePopover(reason: DatePickerOpenChangeReason = 'trigger-press', event?: Event) {
		if (disabled || readonly) return;
		setOpen(!openInternal, { reason, event });
	}

	function setTriggerRef(element: HTMLElement | null) {
		if (triggerRef === element) return;
		triggerRef = element;
	}

	function setFocusVisible(visible: boolean) {
		if (focusVisible === visible) return;
		focusVisible = visible;
	}

	function syncFocusWithin() {
		const nextWithin = computeDatePickerFocusWithin(instanceId);
		if (!nextWithin && focusVisible) {
			focusVisible = false;
		}
		if (!nextWithin && activeSegment !== null) {
			activeSegment = null;
			segmentTypeBuffer = createEmptySegmentDraft();
		}
		if (focusWithin === nextWithin) return;
		focusWithin = nextWithin;
	}

	function setActiveSegment(segment: Exclude<DatePickerSegmentType, 'literal'> | null) {
		if (activeSegment === segment) return;
		activeSegment = segment;
		segmentTypeBuffer = createEmptySegmentDraft();
	}

	function getSegmentValue(type: Exclude<DatePickerSegmentType, 'literal'>): string {
		if (type === 'day') return segmentDraft.day;
		if (type === 'month') return segmentDraft.month;
		return segmentDraft.year;
	}

	function setSegmentValueInternal(
		type: EditableSegmentType,
		nextValue: string,
		fromTyping: boolean
	) {
		if (disabled || readonly) return;

		const rawNumericLength = nextValue.replace(/\D/g, '').length;
		const normalized = normalizeSegmentInput(type, nextValue);
		const unconstrainedDraft = {
			...segmentDraft,
			[type]: normalized
		};
		const nextDraft = clampSegmentDraft(unconstrainedDraft, type, fromTyping, rawNumericLength);
		segmentDraft = nextDraft;
		if (!fromTyping) {
			segmentTypeBuffer = { ...segmentTypeBuffer, [type]: '' };
		}

		const evaluation = evaluateDatePickerDraft(nextDraft, {
			isDateOutOfRange,
			isDateUnavailable: isDateUnavailableInternal
		});

		if (evaluation.isCommitable && evaluation.value) {
			setValue(evaluation.value, 'input');
			return;
		}

		publishCommittedValue(null, true);
	}

	function setSegmentValue(type: Exclude<DatePickerSegmentType, 'literal'>, nextValue: string) {
		setSegmentValueInternal(type, nextValue, false);
	}

	function registerSegmentRef(type: DatePickerEditableSegmentType, element: HTMLElement | null) {
		registerDatePickerSegmentRef(segmentRefs, type, element);
	}

	function focusNextSegment(type: DatePickerEditableSegmentType): boolean {
		return focusNextDatePickerSegment(segmentRefs, segmentOrder, type);
	}

	function focusPreviousSegment(type: DatePickerEditableSegmentType): boolean {
		return focusPreviousDatePickerSegment(segmentRefs, segmentOrder, type);
	}

	function focusLastSegment(): boolean {
		return focusLastDatePickerSegment(segmentRefs, segmentOrder);
	}

	function focusNextPlaceholderOrLastSegment(): boolean {
		for (const type of segmentOrder) {
			const element = segmentRefs[type];
			if (!element) continue;
			if (element.dataset.placeholder === 'true') {
				element.focus();
				return true;
			}
		}
		return focusLastSegment();
	}

	function getSegmentLabel(type: DatePickerEditableSegmentType): string {
		return getDatePickerSegmentLabel(resolvedLocale, type);
	}

	function formatSegment(
		type: Exclude<DatePickerSegmentType, 'literal'>,
		valueToFormat: number
	): string {
		if (type === 'year') return `${valueToFormat}`;
		return `${valueToFormat}`;
	}

	function typeSegmentDigit(
		type: Exclude<DatePickerSegmentType, 'literal'>,
		digit: string
	): boolean {
		if (!/^\d$/.test(digit)) return false;
		const maxLength = type === 'year' ? 4 : 2;
		const previous = segmentTypeBuffer[type];
		const next = `${previous}${digit}`.slice(-maxLength);
		segmentTypeBuffer = { ...segmentTypeBuffer, [type]: next };
		setSegmentValueInternal(type, next, true);

		let didComplete = next.length >= maxLength;
		if (!didComplete && next.length === 1) {
			const firstDigit = Number(next);
			if (type === 'day' && firstDigit >= 4) {
				didComplete = true;
			}
			if (type === 'month' && firstDigit >= 2) {
				didComplete = true;
			}
		}

		if (next.length >= maxLength) {
			segmentTypeBuffer = { ...segmentTypeBuffer, [type]: '' };
		}
		if (didComplete) {
			segmentTypeBuffer = { ...segmentTypeBuffer, [type]: '' };
		}
		return didComplete;
	}

	function adjustSegmentValue(type: Exclude<DatePickerSegmentType, 'literal'>, step: number) {
		if (disabled || readonly) return;
		const current = getSegmentNumericValue(type, segmentDraft, valueInternal);
		const next = clampSegment(type, current + step);
		setSegmentValue(type, formatSegment(type, next));
	}

	function getSegments() {
		const baseSegments = buildDatePickerSegments(resolvedLocale, valueInternal ?? undefined);
		return baseSegments.map((segment) => {
			if (segment.type === 'literal') return segment;
			const draftValue = segmentDraft[segment.type];
			if (draftValue.length === 0) {
				return {
					...segment,
					value: '',
					text: segment.placeholder,
					isPlaceholder: true
				};
			}
			return {
				...segment,
				value: draftValue,
				text: draftValue,
				isPlaceholder: false
			};
		});
	}

	const context: DatePickerContext = {
		get id() {
			return instanceId;
		},
		get isDisabled() {
			return disabled;
		},
		get isReadOnly() {
			return readonly;
		},
		get open() {
			return openInternal;
		},
		get focusVisible() {
			return focusVisible;
		},
		get focusWithin() {
			return focusWithin;
		},
		get isInvalidDraft() {
			return isInvalidDraft;
		},
		get activeSegment() {
			return activeSegment;
		},
		get value() {
			return valueInternal;
		},
		get locale() {
			return resolvedLocale;
		},
		get triggerRef() {
			return triggerRef;
		},
		setTriggerRef,
		setFocusVisible,
		syncFocusWithin,
		setActiveSegment,
		openPopover,
		closePopover,
		togglePopover,
		onOpenChange: (nextOpen, details) => {
			setOpen(nextOpen, details);
		},
		setValue,
		typeSegmentDigit,
		adjustSegmentValue,
		isDateOutOfRange,
		isDateUnavailable: isDateUnavailableInternal,
		getSegments,
		getSegmentValue,
		setSegmentValue,
		getSegmentLabel,
		registerSegmentRef,
		focusNextPlaceholderOrLastSegment,
		focusNextSegment,
		focusPreviousSegment,
		focusLastSegment
	};

	setDatePickerContext(context);
</script>

<div
	id={instanceId}
	class={className}
	data-disabled={disabled || undefined}
	data-readonly={readonly || undefined}
	data-open={openInternal || undefined}
	data-focus-visible={focusVisible || undefined}
	data-focus-within={focusWithin || undefined}
	data-invalid={isInvalidDraft || undefined}
	aria-label={ariaLabel}
>
	{#if children}
		{@render children()}
	{/if}
</div>
