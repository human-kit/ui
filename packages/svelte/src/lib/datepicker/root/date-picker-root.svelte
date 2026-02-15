<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { useLocaleContextOptional } from '../../locale-provider/context';
	import { setDatePickerContext, type DatePickerContext } from './context';
	import {
		buildDatePickerSegments,
		compareDatePickerValues,
		isValidDatePickerValue,
		type DatePickerDateValue,
		type DatePickerSegmentType
	} from './date-utils';

	type DatePickerRootProps = {
		id?: string;
		value?: DatePickerDateValue | null;
		defaultValue?: DatePickerDateValue;
		onChange?: (value: DatePickerDateValue | null) => void;
		isDisabled?: boolean;
		isReadOnly?: boolean;
		minValue?: DatePickerDateValue;
		maxValue?: DatePickerDateValue;
		open?: boolean;
		defaultOpen?: boolean;
		onOpenChange?: (open: boolean) => void;
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
		open = $bindable(),
		defaultOpen = false,
		onOpenChange,
		closeOnSelect = true,
		children,
		class: className = '',
		'aria-label': ariaLabel
	}: DatePickerRootProps = $props();

	const instanceId = untrack(() => id) ?? generatedInstanceId;

	function toDraftFromValue(nextValue: DatePickerDateValue): {
		day: string;
		month: string;
		year: string;
	} {
		const [year, month, day] = nextValue.split('-');
		return {
			day: `${Number(day)}`,
			month: `${Number(month)}`,
			year: `${Number(year)}`
		};
	}

	let triggerRef: HTMLElement | null = $state(null);
	let openInternal = $state((() => defaultOpen)());
	let focusVisible = $state(false);
	let focusWithin = $state(false);
	let valueInternal = $state(
		(() => (isValidDatePickerValue(defaultValue) ? defaultValue : undefined))()
	);
	let segmentDraft = $state<{ day: string; month: string; year: string }>(
		(() => (valueInternal ? toDraftFromValue(valueInternal) : { day: '', month: '', year: '' }))()
	);
	let activeSegment = $state<Exclude<DatePickerSegmentType, 'literal'> | null>(null);
	let segmentTypeBuffer = $state<{ day: string; month: string; year: string }>({
		day: '',
		month: '',
		year: ''
	});

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

	function normalizeSegmentInput(
		type: Exclude<DatePickerSegmentType, 'literal'>,
		rawValue: string
	): string {
		const maxLength = type === 'year' ? 4 : 2;
		const numeric = rawValue.replace(/\D/g, '').slice(0, maxLength);
		if (numeric.length === 0) return '';
		return numeric.replace(/^0+(?=\d)/, '');
	}

	function getMaxValidDayInMonth(year: number, month: number): number {
		const yearText = `${year}`.padStart(4, '0');
		const monthText = `${month}`.padStart(2, '0');

		for (let day = 31; day >= 28; day -= 1) {
			const candidate = `${yearText}-${monthText}-${`${day}`.padStart(2, '0')}`;
			if (isValidDatePickerValue(candidate)) {
				return day;
			}
		}

		return 28;
	}

	function clampSegmentDraft(
		draft: { day: string; month: string; year: string },
		type: Exclude<DatePickerSegmentType, 'literal'>,
		fromTyping: boolean,
		rawNumericLength: number
	): { day: string; month: string; year: string } {
		const nextDraft = { ...draft };

		if (nextDraft.year.length > 0) {
			const parsedYear = Number(nextDraft.year);
			if (Number.isFinite(parsedYear)) {
				nextDraft.year = `${Math.min(9999, Math.max(1, parsedYear))}`;
			}
		}

		if (nextDraft.month.length > 0) {
			const parsedMonth = Number(nextDraft.month);
			if (Number.isFinite(parsedMonth)) {
				if (parsedMonth <= 0) {
					if (!(fromTyping && type === 'month' && rawNumericLength < 2)) {
						nextDraft.month = '1';
					}
				} else if (parsedMonth > 12) {
					nextDraft.month = '12';
				}
			}
		}

		if (nextDraft.day.length > 0) {
			const parsedDay = Number(nextDraft.day);
			if (Number.isFinite(parsedDay)) {
				if (parsedDay <= 0) {
					if (!(fromTyping && type === 'day' && rawNumericLength < 2)) {
						nextDraft.day = '1';
					}
				} else if (parsedDay > 31) {
					nextDraft.day = '31';
				}
			}
		}

		if (nextDraft.day && nextDraft.month && nextDraft.year) {
			const year = Number(nextDraft.year);
			const month = Number(nextDraft.month);
			const day = Number(nextDraft.day);
			if (
				Number.isFinite(year) &&
				Number.isFinite(month) &&
				Number.isFinite(day) &&
				year >= 1 &&
				month >= 1 &&
				month <= 12
			) {
				const maxDayInMonth = getMaxValidDayInMonth(year, month);
				if (day > maxDayInMonth) {
					nextDraft.day = `${maxDayInMonth}`;
				}
			}
		}

		return nextDraft;
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

	function getCandidateValueFromDraft(draft: {
		day: string;
		month: string;
		year: string;
	}): DatePickerDateValue | null {
		if (!draft.day || !draft.month || !draft.year) return null;

		const day = Number(draft.day);
		const month = Number(draft.month);
		const year = Number(draft.year);

		if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
			return null;
		}

		if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) {
			return null;
		}

		const candidate = `${`${year}`.padStart(4, '0')}-${`${month}`.padStart(2, '0')}-${`${day}`.padStart(2, '0')}`;
		if (!isValidDatePickerValue(candidate)) {
			return null;
		}

		return candidate;
	}

	function syncValueFromDraft(draft: { day: string; month: string; year: string }) {
		const candidate = getCandidateValueFromDraft(draft);
		if (!candidate || isDateOutOfRange(candidate)) {
			clearValue();
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

	function setOpen(nextOpen: boolean) {
		if (openInternal === nextOpen) return;
		openInternal = nextOpen;
		open = nextOpen;
		onOpenChange?.(nextOpen);
	}

	function applyTriggerSelectionCloseState() {
		if (!triggerRef) return;
		requestAnimationFrame(() => {
			if (!triggerRef || !triggerRef.isConnected) return;
			triggerRef.focus();
			triggerRef.dataset.focused = 'true';
			delete triggerRef.dataset.focusVisible;

			const clearFocusData = () => {
				if (!triggerRef) return;
				delete triggerRef.dataset.focused;
				delete triggerRef.dataset.focusVisible;
			};

			triggerRef.addEventListener('blur', clearFocusData, { once: true });
		});
	}

	function setValue(nextValue: DatePickerDateValue, source: 'calendar' | 'input' = 'calendar') {
		if (!isValidDatePickerValue(nextValue) || isDateOutOfRange(nextValue)) return;
		if (isDisabled || isReadOnly) return;
		if (valueInternal === nextValue) {
			if (source === 'calendar' && closeOnSelect) {
				setOpen(false);
				applyTriggerSelectionCloseState();
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
			setOpen(false);
			applyTriggerSelectionCloseState();
		}
	}

	function openPopover() {
		if (isDisabled) return;
		setOpen(true);
	}

	function closePopover() {
		setOpen(false);
	}

	function togglePopover() {
		if (isDisabled) return;
		setOpen(!openInternal);
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
		const root = document.getElementById(instanceId);
		const activeElement = document.activeElement;
		const nextWithin = !!root && !!activeElement && root.contains(activeElement);
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
		type: Exclude<DatePickerSegmentType, 'literal'>,
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

	function getSegmentNumericValue(type: Exclude<DatePickerSegmentType, 'literal'>): number {
		const draftValue = segmentDraft[type];
		if (draftValue.length > 0) {
			const parsed = Number(draftValue);
			if (Number.isFinite(parsed)) return parsed;
		}

		if (valueInternal && isValidDatePickerValue(valueInternal)) {
			const [year, month, day] = valueInternal.split('-');
			if (type === 'day') return Number(day);
			if (type === 'month') return Number(month);
			return Number(year);
		}

		if (type === 'year') {
			return new Date().getUTCFullYear();
		}

		return 1;
	}

	function getSegmentBounds(type: Exclude<DatePickerSegmentType, 'literal'>): {
		min: number;
		max: number;
	} {
		if (type === 'month') return { min: 1, max: 12 };
		if (type === 'day') return { min: 1, max: 31 };
		return { min: 1, max: 9999 };
	}

	function formatSegment(
		type: Exclude<DatePickerSegmentType, 'literal'>,
		valueToFormat: number
	): string {
		if (type === 'year') return `${valueToFormat}`;
		return `${valueToFormat}`;
	}

	function clampSegment(
		type: Exclude<DatePickerSegmentType, 'literal'>,
		valueToClamp: number
	): number {
		const { min, max } = getSegmentBounds(type);
		return Math.min(max, Math.max(min, valueToClamp));
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
		const current = getSegmentNumericValue(type);
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
		onOpenChange: setOpen,
		setValue,
		typeSegmentDigit,
		adjustSegmentValue,
		isDateOutOfRange,
		isDateUnavailable: isDateOutOfRange,
		getSegments,
		getSegmentValue,
		setSegmentValue
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
