<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { useLocaleContextOptional } from '../../locale-provider/context';
	import { setDateRangePickerContext, type DateRangePickerContext } from './context';
	import type {
		DateRangePickerOpenChangeDetails,
		DateRangePickerOpenChangeReason,
		DateRangePickerRangePart,
		DateRangePickerRangeValue
	} from './context';
	import {
		buildDatePickerSegments,
		compareDatePickerValues,
		getDatePickerSegmentLabel,
		getDatePickerSegmentOrder,
		isValidDatePickerValue,
		type DatePickerDateValue,
		type DatePickerEditableSegmentType,
		type DatePickerSegmentType
	} from '../../datepicker/root/date-utils';
	import {
		clampSegment,
		clampSegmentDraft,
		createEmptySegmentDraft,
		getSegmentNumericValue,
		normalizeSegmentInput,
		toDraftFromValue,
		type DatePickerSegmentDraft,
		type EditableSegmentType
	} from '../../datepicker/root/segment-state';
	import { evaluateDatePickerDraft } from '../../datepicker/root/draft-evaluation';
	import {
		applyTriggerSelectionCloseState,
		computeDatePickerFocusWithin
	} from '../../datepicker/root/focus-controller';
	import { getInteractionModality } from '../../primitives/input-modality';
	import { resolveDatePickerOpenChangeDetails } from '../../datepicker/root/open-controller';
	import { normalizeDateRangePickerValue } from './value-commit';
	import {
		createDatePickerSegmentRefs,
		focusLastDatePickerSegment,
		focusNextDatePickerSegment,
		focusPreviousDatePickerSegment,
		registerDatePickerSegmentRef,
		type DatePickerSegmentRefs
	} from '../../datepicker/root/segment-controller';

	type DateRangePickerRootProps = {
		id?: string;
		value?: DateRangePickerRangeValue | null;
		defaultValue?: DateRangePickerRangeValue | null;
		onChange?: (value: DateRangePickerRangeValue | null) => void;
		disabled?: boolean;
		readonly?: boolean;
		minValue?: DatePickerDateValue;
		maxValue?: DatePickerDateValue;
		isDateUnavailable?: (date: DatePickerDateValue) => boolean;
		open?: boolean;
		defaultOpen?: boolean;
		onOpenChange?: (open: boolean, details: DateRangePickerOpenChangeDetails) => void;
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
	}: DateRangePickerRootProps = $props();

	const instanceId = untrack(() => id) ?? generatedInstanceId;

	let triggerRef: HTMLElement | null = $state(null);
	let openInternal = $state((() => defaultOpen)());
	let focusVisible = $state(false);
	let focusWithin = $state(false);

	const initialValueProp = untrack(() => value);
	const initialDefaultValue = untrack(() => normalizeDateRangePickerValue(defaultValue));
	const initialPropValue =
		initialValueProp === undefined
			? initialDefaultValue
			: normalizeDateRangePickerValue(initialValueProp);

	let valueInternal = $state<DateRangePickerRangeValue | null>(initialPropValue);
	let startSegmentDraft = $state<DatePickerSegmentDraft>(
		initialPropValue ? toDraftFromValue(initialPropValue.start) : createEmptySegmentDraft()
	);
	let endSegmentDraft = $state<DatePickerSegmentDraft>(
		initialPropValue ? toDraftFromValue(initialPropValue.end) : createEmptySegmentDraft()
	);
	let activeSegment = $state<{
		part: DateRangePickerRangePart;
		type: Exclude<DatePickerSegmentType, 'literal'>;
	} | null>(null);
	let startSegmentTypeBuffer = $state<DatePickerSegmentDraft>(createEmptySegmentDraft());
	let endSegmentTypeBuffer = $state<DatePickerSegmentDraft>(createEmptySegmentDraft());
	let startSegmentRefs = createDatePickerSegmentRefs();
	let endSegmentRefs = createDatePickerSegmentRefs();
	let lastPublishedValue = $state<DateRangePickerRangeValue | null>(initialPropValue);

	if (initialValueProp === undefined) {
		value = initialPropValue;
	} else if (!areRangesEqual(initialValueProp, initialPropValue)) {
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
		const nextValue = normalizeDateRangePickerValue(value);
		if (areRangesEqual(nextValue, lastPublishedValue)) return;
		lastPublishedValue = nextValue;
		valueInternal = nextValue;
		startSegmentDraft = nextValue ? toDraftFromValue(nextValue.start) : createEmptySegmentDraft();
		endSegmentDraft = nextValue ? toDraftFromValue(nextValue.end) : createEmptySegmentDraft();
		startSegmentTypeBuffer = createEmptySegmentDraft();
		endSegmentTypeBuffer = createEmptySegmentDraft();
	});

	const normalizedMinValue = $derived(isValidDatePickerValue(minValue) ? minValue : undefined);
	const normalizedMaxValue = $derived(isValidDatePickerValue(maxValue) ? maxValue : undefined);
	const segmentOrder = $derived(getDatePickerSegmentOrder(resolvedLocale));
	const startDraftEvaluation = $derived.by(() =>
		evaluateDatePickerDraft(startSegmentDraft, {
			isDateOutOfRange,
			isDateUnavailable: isDateUnavailableInternal
		})
	);
	const endDraftEvaluation = $derived.by(() =>
		evaluateDatePickerDraft(endSegmentDraft, {
			isDateOutOfRange,
			isDateUnavailable: isDateUnavailableInternal
		})
	);
	const isInvalidDraft = $derived.by(() => {
		const startEmpty = isDraftEmpty(startSegmentDraft);
		const endEmpty = isDraftEmpty(endSegmentDraft);
		if (startEmpty && endEmpty) return false;
		if (!startDraftEvaluation.isCommitable || !endDraftEvaluation.isCommitable) return true;
		return false;
	});

	function isDraftEmpty(draft: DatePickerSegmentDraft): boolean {
		return draft.day.length === 0 && draft.month.length === 0 && draft.year.length === 0;
	}

	function areRangesEqual(
		left: DateRangePickerRangeValue | null | undefined,
		right: DateRangePickerRangeValue | null | undefined
	): boolean {
		const normalizedLeft = normalizeDateRangePickerValue(left);
		const normalizedRight = normalizeDateRangePickerValue(right);
		if (!normalizedLeft && !normalizedRight) return true;
		if (!normalizedLeft || !normalizedRight) return false;
		return (
			normalizedLeft.start === normalizedRight.start && normalizedLeft.end === normalizedRight.end
		);
	}

	function getDraft(part: DateRangePickerRangePart): DatePickerSegmentDraft {
		return part === 'start' ? startSegmentDraft : endSegmentDraft;
	}

	function getSegmentRefs(part: DateRangePickerRangePart): DatePickerSegmentRefs {
		return part === 'start' ? startSegmentRefs : endSegmentRefs;
	}

	function getSegmentTypeBuffer(part: DateRangePickerRangePart): DatePickerSegmentDraft {
		return part === 'start' ? startSegmentTypeBuffer : endSegmentTypeBuffer;
	}

	function setSegmentTypeBuffer(
		part: DateRangePickerRangePart,
		nextBuffer: DatePickerSegmentDraft
	) {
		if (part === 'start') {
			startSegmentTypeBuffer = nextBuffer;
		} else {
			endSegmentTypeBuffer = nextBuffer;
		}
	}

	function setDraft(part: DateRangePickerRangePart, nextDraft: DatePickerSegmentDraft) {
		if (part === 'start') {
			startSegmentDraft = nextDraft;
		} else {
			endSegmentDraft = nextDraft;
		}
	}

	function publishCommittedValue(
		nextValue: DateRangePickerRangeValue | null,
		emitChange: boolean
	): boolean {
		const normalizedNextValue = normalizeDateRangePickerValue(nextValue);
		const normalizedBindableValue = normalizeDateRangePickerValue(value);
		const didInternalChange = !areRangesEqual(valueInternal, normalizedNextValue);
		const didBindableValueChange = !areRangesEqual(normalizedBindableValue, normalizedNextValue);

		if (!didInternalChange && !didBindableValueChange) return false;

		valueInternal = normalizedNextValue;
		if (didBindableValueChange) {
			value = normalizedNextValue;
		}
		lastPublishedValue = normalizedNextValue;

		if (emitChange && didInternalChange) {
			onChange?.(normalizedNextValue);
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
		details?:
			| DateRangePickerOpenChangeDetails
			| { reason?: DateRangePickerOpenChangeReason; event?: Event }
	) {
		if (openInternal === nextOpen) return;
		const eventDetails = resolveDatePickerOpenChangeDetails(details);

		onOpenChange?.(nextOpen, eventDetails);
		if (eventDetails.isCanceled) return;

		openInternal = nextOpen;
		open = nextOpen;
	}

	function setValue(
		nextValue: DateRangePickerRangeValue,
		source: 'calendar' | 'input' = 'calendar'
	) {
		const normalizedNextValue = normalizeDateRangePickerValue(nextValue);
		if (!normalizedNextValue) return;
		if (
			isDateUnavailableInternal(normalizedNextValue.start) ||
			isDateUnavailableInternal(normalizedNextValue.end)
		) {
			return;
		}
		if (disabled || readonly) return;
		const selectionFocusVisible = getInteractionModality() === 'keyboard';

		if (areRangesEqual(valueInternal, normalizedNextValue)) {
			if (source === 'calendar' && closeOnSelect) {
				closeCalendarAfterSelection(selectionFocusVisible);
			}
			return;
		}

		publishCommittedValue(normalizedNextValue, true);

		if (source === 'calendar') {
			startSegmentDraft = toDraftFromValue(normalizedNextValue.start);
			endSegmentDraft = toDraftFromValue(normalizedNextValue.end);
			startSegmentTypeBuffer = createEmptySegmentDraft();
			endSegmentTypeBuffer = createEmptySegmentDraft();
		}

		if (source === 'calendar' && closeOnSelect) {
			closeCalendarAfterSelection(selectionFocusVisible);
		}
	}

	function openPopover(
		reason: DateRangePickerOpenChangeReason = 'imperative-action',
		event?: Event
	) {
		if (disabled || readonly) return;
		setOpen(true, { reason, event });
	}

	function closePopover(
		reason: DateRangePickerOpenChangeReason = 'imperative-action',
		event?: Event
	) {
		setOpen(false, { reason, event });
	}

	function togglePopover(reason: DateRangePickerOpenChangeReason = 'trigger-press', event?: Event) {
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
			startSegmentTypeBuffer = createEmptySegmentDraft();
			endSegmentTypeBuffer = createEmptySegmentDraft();
		}
		if (focusWithin === nextWithin) return;
		focusWithin = nextWithin;
	}

	function setActiveSegment(
		part: DateRangePickerRangePart,
		segment: Exclude<DatePickerSegmentType, 'literal'> | null
	) {
		const nextSegment = segment ? { part, type: segment } : null;
		if (activeSegment?.part === nextSegment?.part && activeSegment?.type === nextSegment?.type) {
			return;
		}
		activeSegment = nextSegment;
		if (segment) {
			setSegmentTypeBuffer(part, createEmptySegmentDraft());
		}
	}

	function getSegmentValue(
		part: DateRangePickerRangePart,
		type: Exclude<DatePickerSegmentType, 'literal'>
	): string {
		const draft = getDraft(part);
		if (type === 'day') return draft.day;
		if (type === 'month') return draft.month;
		return draft.year;
	}

	function maybeCommitDrafts() {
		const startEvaluation = evaluateDatePickerDraft(startSegmentDraft, {
			isDateOutOfRange,
			isDateUnavailable: isDateUnavailableInternal
		});
		const endEvaluation = evaluateDatePickerDraft(endSegmentDraft, {
			isDateOutOfRange,
			isDateUnavailable: isDateUnavailableInternal
		});

		if (
			startEvaluation.isCommitable &&
			startEvaluation.value &&
			endEvaluation.isCommitable &&
			endEvaluation.value
		) {
			const nextRange = normalizeDateRangePickerValue({
				start: startEvaluation.value,
				end: endEvaluation.value
			});
			if (nextRange) {
				// Publish the normalized (sorted) value, but keep the segment drafts
				// exactly as the user typed them. Rewriting the drafts from the sorted
				// range here would swap start/end mid-typing (e.g. while typing a year
				// digit-by-digit the partial value can sort ahead of the other date),
				// corrupting subsequent keystrokes.
				setValue(nextRange, 'input');
				return;
			}
		}

		publishCommittedValue(null, true);
	}

	function setSegmentValueInternal(
		part: DateRangePickerRangePart,
		type: EditableSegmentType,
		nextValue: string,
		fromTyping: boolean
	) {
		if (disabled || readonly) return;

		const draft = getDraft(part);
		const rawNumericLength = nextValue.replace(/\D/g, '').length;
		const normalized = normalizeSegmentInput(type, nextValue);
		const unconstrainedDraft = {
			...draft,
			[type]: normalized
		};
		const nextDraft = clampSegmentDraft(unconstrainedDraft, type, fromTyping, rawNumericLength);
		setDraft(part, nextDraft);
		if (!fromTyping) {
			setSegmentTypeBuffer(part, { ...getSegmentTypeBuffer(part), [type]: '' });
		}

		maybeCommitDrafts();
	}

	function setSegmentValue(
		part: DateRangePickerRangePart,
		type: Exclude<DatePickerSegmentType, 'literal'>,
		nextValue: string
	) {
		setSegmentValueInternal(part, type, nextValue, false);
	}

	function registerSegmentRef(
		part: DateRangePickerRangePart,
		type: DatePickerEditableSegmentType,
		element: HTMLElement | null
	) {
		registerDatePickerSegmentRef(getSegmentRefs(part), type, element);
	}

	function focusFirstSegment(part: DateRangePickerRangePart): boolean {
		const refs = getSegmentRefs(part);
		for (const type of segmentOrder) {
			const element = refs[type];
			if (!element) continue;
			element.focus();
			return true;
		}
		return false;
	}

	function focusNextSegment(
		part: DateRangePickerRangePart,
		type: DatePickerEditableSegmentType
	): boolean {
		if (focusNextDatePickerSegment(getSegmentRefs(part), segmentOrder, type)) return true;
		if (part === 'start') return focusFirstSegment('end');
		return false;
	}

	function focusPreviousSegment(
		part: DateRangePickerRangePart,
		type: DatePickerEditableSegmentType
	): boolean {
		if (focusPreviousDatePickerSegment(getSegmentRefs(part), segmentOrder, type)) return true;
		if (part === 'end') return focusLastDatePickerSegment(startSegmentRefs, segmentOrder);
		return false;
	}

	function focusLastSegment(part: DateRangePickerRangePart = 'end'): boolean {
		return focusLastDatePickerSegment(getSegmentRefs(part), segmentOrder);
	}

	function focusNextPlaceholderOrLastSegment(part: DateRangePickerRangePart): boolean {
		const refs = getSegmentRefs(part);
		for (const type of segmentOrder) {
			const element = refs[type];
			if (!element) continue;
			if (element.dataset.placeholder === 'true') {
				element.focus();
				return true;
			}
		}
		return focusLastSegment(part);
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
		part: DateRangePickerRangePart,
		type: Exclude<DatePickerSegmentType, 'literal'>,
		digit: string
	): boolean {
		if (!/^\d$/.test(digit)) return false;
		const maxLength = type === 'year' ? 4 : 2;
		const previous = getSegmentTypeBuffer(part)[type];
		const next = `${previous}${digit}`.slice(-maxLength);
		setSegmentTypeBuffer(part, { ...getSegmentTypeBuffer(part), [type]: next });
		setSegmentValueInternal(part, type, next, true);

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
			setSegmentTypeBuffer(part, { ...getSegmentTypeBuffer(part), [type]: '' });
		}
		if (didComplete) {
			setSegmentTypeBuffer(part, { ...getSegmentTypeBuffer(part), [type]: '' });
		}
		return didComplete;
	}

	function adjustSegmentValue(
		part: DateRangePickerRangePart,
		type: Exclude<DatePickerSegmentType, 'literal'>,
		step: number
	) {
		if (disabled || readonly) return;
		const current = getSegmentNumericValue(
			type,
			getDraft(part),
			part === 'start' ? (valueInternal?.start ?? null) : (valueInternal?.end ?? null)
		);
		const next = clampSegment(type, current + step);
		setSegmentValue(part, type, formatSegment(type, next));
	}

	function getSegments(part: DateRangePickerRangePart) {
		const draft = getDraft(part);
		const committedValue = part === 'start' ? valueInternal?.start : valueInternal?.end;
		const baseSegments = buildDatePickerSegments(resolvedLocale, committedValue);
		return baseSegments.map((segment) => {
			if (segment.type === 'literal') return segment;
			const draftValue = draft[segment.type];
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

	const context: DateRangePickerContext = {
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

	setDateRangePickerContext(context);
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
