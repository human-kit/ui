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
		getCandidateValueFromDraft,
		getSegmentNumericValue,
		normalizeSegmentInput,
		toDraftFromValue,
		type DatePickerSegmentDraft,
		type EditableSegmentType
	} from './segment-state';
	import { applyTriggerSelectionCloseState, computeFocusWithin } from './focus-manager';
	import { createDatePickerOpenChangeDetails } from './open-change';

	type DatePickerRootProps = {
		id?: string;
		value?: DatePickerDateValue | null;
		defaultValue?: DatePickerDateValue;
		onChange?: (value: DatePickerDateValue | null) => void;
		isDisabled?: boolean;
		isReadOnly?: boolean;
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
		isDisabled = false,
		isReadOnly = false,
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
	let valueInternal = $state(
		(() => (isValidDatePickerValue(defaultValue) ? defaultValue : undefined))()
	);
	let segmentDraft = $state<DatePickerSegmentDraft>(
		(() => (valueInternal ? toDraftFromValue(valueInternal) : { day: '', month: '', year: '' }))()
	);
	let activeSegment = $state<Exclude<DatePickerSegmentType, 'literal'> | null>(null);
	let segmentTypeBuffer = $state<DatePickerSegmentDraft>({
		day: '',
		month: '',
		year: ''
	});
	let segmentRefs: Record<DatePickerEditableSegmentType, HTMLElement | null> = {
		day: null,
		month: null,
		year: null
	};

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
		if (value !== undefined) {
			const nextValue = value && isValidDatePickerValue(value) ? value : undefined;
			if (nextValue !== valueInternal) {
				valueInternal = nextValue;
				if (nextValue) {
					segmentDraft = toDraftFromValue(nextValue);
					segmentTypeBuffer = { day: '', month: '', year: '' };
				}
			}
		}
	});

	const normalizedMinValue = $derived(isValidDatePickerValue(minValue) ? minValue : undefined);
	const normalizedMaxValue = $derived(isValidDatePickerValue(maxValue) ? maxValue : undefined);
	const segmentOrder = $derived(getDatePickerSegmentOrder(resolvedLocale));

	function isDraftEmpty(draft: DatePickerSegmentDraft): boolean {
		return draft.day.length === 0 && draft.month.length === 0 && draft.year.length === 0;
	}

	function clearValue() {
		if (isDisabled || isReadOnly) return;
		let changed = false;

		if (valueInternal !== undefined) {
			valueInternal = undefined;
			changed = true;
		}

		if (value !== null) {
			value = null;
			changed = true;
		}

		if (changed) {
			onChange?.(null);
		}
	}

	function syncValueFromDraft(draft: DatePickerSegmentDraft) {
		const candidate = getCandidateValueFromDraft(draft);
		if (!candidate) {
			clearValue();
			return;
		}

		if (isDateUnavailableInternal(candidate)) {
			return;
		}

		setValue(candidate, 'input');
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
		details?: { reason?: DatePickerOpenChangeReason; event?: Event }
	) {
		if (openInternal === nextOpen) return;
		const eventDetails = createDatePickerOpenChangeDetails(details);

		onOpenChange?.(nextOpen, eventDetails);
		if (eventDetails.isCanceled) return;

		openInternal = nextOpen;
		open = nextOpen;
	}

	function setValue(nextValue: DatePickerDateValue, source: 'calendar' | 'input' = 'calendar') {
		if (!isValidDatePickerValue(nextValue) || isDateUnavailableInternal(nextValue)) return;
		if (isDisabled || isReadOnly) return;
		if (valueInternal === nextValue) {
			if (source === 'calendar' && closeOnSelect) {
				setOpen(false, { reason: 'close-press' });
				applyTriggerSelectionCloseState(triggerRef);
			}
			return;
		}

		valueInternal = nextValue;
		value = nextValue;
		onChange?.(nextValue);

		if (source === 'calendar') {
			segmentDraft = toDraftFromValue(nextValue);
			segmentTypeBuffer = { day: '', month: '', year: '' };
		}

		if (source === 'calendar' && closeOnSelect) {
			setOpen(false, { reason: 'close-press' });
			applyTriggerSelectionCloseState(triggerRef);
		}
	}

	function openPopover(reason: DatePickerOpenChangeReason = 'imperative-action', event?: Event) {
		if (isDisabled || isReadOnly) return;
		setOpen(true, { reason, event });
	}

	function closePopover(reason: DatePickerOpenChangeReason = 'imperative-action', event?: Event) {
		setOpen(false, { reason, event });
	}

	function togglePopover(reason: DatePickerOpenChangeReason = 'trigger-press', event?: Event) {
		if (isDisabled || isReadOnly) return;
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
		const nextWithin = computeFocusWithin(instanceId);
		if (!nextWithin && focusVisible) {
			focusVisible = false;
		}
		if (focusWithin === nextWithin) return;
		focusWithin = nextWithin;
	}

	function setActiveSegment(segment: Exclude<DatePickerSegmentType, 'literal'> | null) {
		if (activeSegment === segment) return;
		activeSegment = segment;
		segmentTypeBuffer = { day: '', month: '', year: '' };
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
		if (isDisabled || isReadOnly) return;

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
		syncValueFromDraft(nextDraft);
	}

	function setSegmentValue(type: Exclude<DatePickerSegmentType, 'literal'>, nextValue: string) {
		setSegmentValueInternal(type, nextValue, false);
	}

	function getSegmentOrderIndex(type: DatePickerEditableSegmentType): number {
		return segmentOrder.indexOf(type);
	}

	function registerSegmentRef(type: DatePickerEditableSegmentType, element: HTMLElement | null) {
		if (segmentRefs[type] === element) return;
		segmentRefs[type] = element;
	}

	function focusSegmentByType(type: DatePickerEditableSegmentType): boolean {
		const target = segmentRefs[type];
		if (!target) return false;
		target.focus();
		return true;
	}

	function focusNextSegment(type: DatePickerEditableSegmentType): boolean {
		const index = getSegmentOrderIndex(type);
		if (index < 0) return false;
		for (let nextIndex = index + 1; nextIndex < segmentOrder.length; nextIndex += 1) {
			const nextType = segmentOrder[nextIndex];
			if (focusSegmentByType(nextType)) {
				return true;
			}
		}
		return false;
	}

	function focusPreviousSegment(type: DatePickerEditableSegmentType): boolean {
		const index = getSegmentOrderIndex(type);
		if (index < 0) return false;
		for (let previousIndex = index - 1; previousIndex >= 0; previousIndex -= 1) {
			const previousType = segmentOrder[previousIndex];
			if (focusSegmentByType(previousType)) {
				return true;
			}
		}
		return false;
	}

	function focusLastSegment(): boolean {
		for (let index = segmentOrder.length - 1; index >= 0; index -= 1) {
			const type = segmentOrder[index];
			if (focusSegmentByType(type)) {
				return true;
			}
		}
		return false;
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
		if (isDisabled || isReadOnly) return;
		const current = getSegmentNumericValue(type, segmentDraft, valueInternal);
		const next = clampSegment(type, current + step);
		setSegmentValue(type, formatSegment(type, next));
	}

	function getSegments() {
		const baseSegments = buildDatePickerSegments(resolvedLocale, valueInternal);
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
			return isDisabled;
		},
		get isReadOnly() {
			return isReadOnly;
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
	data-disabled={isDisabled || undefined}
	data-readonly={isReadOnly || undefined}
	data-open={openInternal || undefined}
	data-focus-visible={focusVisible || undefined}
	data-focus-within={focusWithin || undefined}
	aria-label={ariaLabel}
>
	{#if children}
		{@render children()}
	{/if}
</div>
