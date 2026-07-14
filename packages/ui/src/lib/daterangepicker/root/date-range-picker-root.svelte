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
		createEmptySegmentDraft,
		toDraftFromValue,
		type DatePickerSegmentDraft
	} from '../../datepicker/root/segment-state';
	import {
		applyDraftToSegments,
		createDateSegmentEngine
	} from '../../datepicker/root/segment-engine';
	import { evaluateDatePickerDraft } from '../../datepicker/root/draft-evaluation';
	import {
		applyTriggerSelectionCloseState,
		computeDatePickerFocusWithin
	} from '../../datepicker/root/focus-controller';
	import { getInteractionModality } from '../../primitives/input-modality';
	import { resolveDatePickerOpenChangeDetails } from '../../datepicker/root/open-controller';
	import { normalizeDateRangePickerValue } from './value-commit';
	import {
		addDays,
		compareDates,
		formatCalendarDate,
		parseCalendarDate
	} from '../../calendar/root/date-utils';
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
	// The embedded calendar memoizes availability results keyed by the identity
	// of its `isDateUnavailable` prop. Mint a NEW closure whenever the bounds or
	// the user predicate change, so that cache invalidates naturally (e.g.
	// changing `minValue` while the popover is open).
	const isDateUnavailableInternal = $derived.by(() => {
		const min = normalizedMinValue;
		const max = normalizedMaxValue;
		const userIsDateUnavailable = isDateUnavailable;
		return (valueToCheck: DatePickerDateValue): boolean => {
			if (!isValidDatePickerValue(valueToCheck)) return true;
			if (min && compareDatePickerValues(valueToCheck, min) < 0) return true;
			if (max && compareDatePickerValues(valueToCheck, max) > 0) return true;
			return userIsDateUnavailable?.(valueToCheck) ?? false;
		};
	});
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
	// A fully-typed range whose path crosses an unavailable day cannot be
	// committed (the calendar rejects the same range via isRangePathSelectable).
	const isDraftRangePathUnavailable = $derived.by(() => {
		if (!startDraftEvaluation.isCommitable || !startDraftEvaluation.value) return false;
		if (!endDraftEvaluation.isCommitable || !endDraftEvaluation.value) return false;
		return hasUnavailableInteriorDay({
			start: startDraftEvaluation.value,
			end: endDraftEvaluation.value
		});
	});
	// Validity is tracked per range part: an empty draft is never invalid, and
	// a completed start must not flag the still-empty end (and vice versa).
	// An unavailable interior day flags BOTH parts: the blocked path is a
	// property of the (start, end) pair, not of a single endpoint, so both
	// inputs surface data-invalid/aria-invalid through the per-part mechanism.
	const isStartPartInvalid = $derived(
		startDraftEvaluation.isInvalid || isDraftRangePathUnavailable
	);
	const isEndPartInvalid = $derived(endDraftEvaluation.isInvalid || isDraftRangePathUnavailable);
	const isInvalidDraft = $derived(isStartPartInvalid || isEndPartInvalid);

	function isPartInvalid(part: DateRangePickerRangePart): boolean {
		return part === 'start' ? isStartPartInvalid : isEndPartInvalid;
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

	// Mid-typing partial years (e.g. a committed "0002" while typing "2026"
	// digit by digit) momentarily produce multi-century spans; walking those
	// day-by-day on every keystroke would freeze the input. Spans beyond this
	// cap (~20 years) skip interior validation — endpoints are still validated,
	// matching the pre-validation behavior for such extreme, transient ranges.
	const MAX_INTERIOR_VALIDATION_DAYS = 7400;
	const DAY_IN_MS = 86_400_000;

	// Same day-by-day walk the calendar uses (isRangePathSelectable), restricted
	// to the interior days: the endpoints are already validated individually by
	// the per-part draft evaluation / setValue endpoint checks.
	function hasUnavailableInteriorDay(range: DateRangePickerRangeValue): boolean {
		// Bounds alone cannot make an interior day unavailable when both
		// endpoints are in range (the interval is contiguous), so skip the walk
		// when there is no user predicate.
		if (!isDateUnavailable) return false;

		const normalized = normalizeDateRangePickerValue(range);
		if (!normalized) return false;

		const parsedStart = parseCalendarDate(normalized.start);
		const parsedEnd = parseCalendarDate(normalized.end);
		if (!parsedStart || !parsedEnd) return false;

		const spanInDays = (parsedEnd.getTime() - parsedStart.getTime()) / DAY_IN_MS;
		if (spanInDays > MAX_INTERIOR_VALIDATION_DAYS) return false;

		for (
			let current = addDays(parsedStart, 1);
			compareDates(current, parsedEnd) < 0;
			current = addDays(current, 1)
		) {
			if (isDateUnavailableInternal(formatCalendarDate(current))) return true;
		}

		return false;
	}

	function setOpen(
		nextOpen: boolean,
		details?:
			DateRangePickerOpenChangeDetails | { reason?: DateRangePickerOpenChangeReason; event?: Event }
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
		// A range crossing an unavailable interior day is not committable, no
		// matter whether it was typed or (defensively) selected in the calendar.
		if (hasUnavailableInteriorDay(normalizedNextValue)) {
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
			// A typed range must validate the whole path, not just the endpoints:
			// when an interior day is unavailable the draft is treated as invalid
			// (both parts flag it, see `isDraftRangePathUnavailable`) and the
			// public value clears below instead of committing.
			if (nextRange && !hasUnavailableInteriorDay(nextRange)) {
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

	function createPartSegmentEngine(part: DateRangePickerRangePart) {
		return createDateSegmentEngine({
			isEditable: () => !disabled && !readonly,
			getDraft: () => getDraft(part),
			setDraft: (nextDraft) => setDraft(part, nextDraft),
			getTypeBuffer: () => getSegmentTypeBuffer(part),
			setTypeBuffer: (nextBuffer) => setSegmentTypeBuffer(part, nextBuffer),
			getCommittedValue: () =>
				part === 'start' ? (valueInternal?.start ?? null) : (valueInternal?.end ?? null),
			commitDraft: maybeCommitDrafts
		});
	}

	const segmentEngines = {
		start: createPartSegmentEngine('start'),
		end: createPartSegmentEngine('end')
	};

	function getSegmentValue(
		part: DateRangePickerRangePart,
		type: Exclude<DatePickerSegmentType, 'literal'>
	): string {
		return segmentEngines[part].getSegmentValue(type);
	}

	function setSegmentValue(
		part: DateRangePickerRangePart,
		type: Exclude<DatePickerSegmentType, 'literal'>,
		nextValue: string
	) {
		segmentEngines[part].setSegmentValue(type, nextValue);
	}

	function typeSegmentDigit(
		part: DateRangePickerRangePart,
		type: Exclude<DatePickerSegmentType, 'literal'>,
		digit: string
	): boolean {
		return segmentEngines[part].typeSegmentDigit(type, digit);
	}

	function adjustSegmentValue(
		part: DateRangePickerRangePart,
		type: Exclude<DatePickerSegmentType, 'literal'>,
		step: number
	) {
		segmentEngines[part].adjustSegmentValue(type, step);
	}

	function getSegmentValueMax(
		part: DateRangePickerRangePart,
		type: Exclude<DatePickerSegmentType, 'literal'>
	): number {
		return segmentEngines[part].getSegmentValueMax(type);
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

	function getSegments(part: DateRangePickerRangePart) {
		const draft = getDraft(part);
		const committedValue = part === 'start' ? valueInternal?.start : valueInternal?.end;
		const baseSegments = buildDatePickerSegments(resolvedLocale, committedValue);
		return applyDraftToSegments(baseSegments, draft);
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
		isPartInvalid,
		get activeSegment() {
			return activeSegment;
		},
		get value() {
			return valueInternal;
		},
		get locale() {
			return resolvedLocale;
		},
		get minValue() {
			return normalizedMinValue;
		},
		get maxValue() {
			return normalizedMaxValue;
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
		// Getter: the predicate identity changes with the bounds (see the
		// `isDateUnavailableInternal` derived above).
		get isDateUnavailable() {
			return isDateUnavailableInternal;
		},
		getSegments,
		getSegmentValue,
		setSegmentValue,
		getSegmentValueMax,
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
	role={ariaLabel ? 'group' : undefined}
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
