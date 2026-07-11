import { getContext, setContext } from 'svelte';
import { asCommand } from '../../internal/as-command.js';
import {
	addDays,
	addMonths,
	buildMonthGrid,
	compareDates,
	formatCalendarDate,
	formatMonthHeading,
	getTodayUtcDate,
	getWeekdayLabels,
	isValidCalendarDateValue,
	parseCalendarDate,
	resolveFirstDayOfWeek,
	startOfMonth,
	type CalendarDateValue,
	type CalendarDayCell,
	type CalendarFirstDayOfWeek,
	type CalendarMonthHeadingStyle,
	type CalendarWeekdayStyle
} from './date-utils';

const KEY = Symbol('calendar');

export type CalendarSelectionMode = 'single' | 'range';
export type CalendarRangeValue = {
	start?: CalendarDateValue;
	end?: CalendarDateValue;
};
export type CalendarValue = CalendarDateValue | CalendarRangeValue;
export type CalendarValueBySelectionMode<TSelectionMode extends CalendarSelectionMode> =
	TSelectionMode extends 'range' ? CalendarRangeValue : CalendarDateValue;

export type CalendarMonth = {
	monthIndex: number;
	monthStart: Date;
	heading: string;
	weeks: CalendarDayCell[][];
};

export type CreateCalendarContextOptions<
	TSelectionMode extends CalendarSelectionMode = CalendarSelectionMode
> = {
	selectionMode?: TSelectionMode;
	visibleMonths?: number;
	showOutsideDays?: boolean;
	locale?: string;
	firstDayOfWeek?: CalendarFirstDayOfWeek;
	monthHeadingStyle?: CalendarMonthHeadingStyle;
	isDisabled?: boolean;
	isReadOnly?: boolean;
	minValue?: CalendarDateValue;
	maxValue?: CalendarDateValue;
	value?: CalendarValueBySelectionMode<TSelectionMode> | null;
	defaultValue?: CalendarValueBySelectionMode<TSelectionMode>;
	isDateUnavailable?: (date: CalendarDateValue) => boolean;
	onChange?: (value: CalendarValueBySelectionMode<TSelectionMode>) => void;
};

export type CalendarContext = {
	/**
	 * One-shot focus request counter. This is an event signal, not derivable
	 * state: keyboard navigation bumps it to ask the roving focus target to
	 * call `.focus()` exactly once. Consumers read it from an `$effect` and
	 * must hand it to `consumeFocusRequest` before focusing, so cells mounted
	 * after a request was already handled do not steal focus on mount.
	 */
	focusRequestVersion: number;
	locale: string;
	selectionMode: CalendarSelectionMode;
	firstDayOfWeek: number;
	visibleMonths: number;
	showOutsideDays: boolean;
	isDisabled: boolean;
	isReadOnly: boolean;
	months: CalendarMonth[];
	selectedValue: CalendarDateValue | undefined;
	rangeValue: CalendarRangeValue | undefined;
	focusedValue: CalendarDateValue;
	focusVisible: boolean;
	weekdayLabels: string[];
	headingLabel: string;
	getWeekdayLabels: (weekdayStyle?: CalendarWeekdayStyle) => string[];
	isSelected: (date: CalendarDateValue) => boolean;
	isRangeStart: (date: CalendarDateValue) => boolean;
	isRangeEnd: (date: CalendarDateValue) => boolean;
	isInRange: (date: CalendarDateValue) => boolean;
	isDateUnavailable: (date: CalendarDateValue) => boolean;
	isDateDisabled: (date: CalendarDateValue) => boolean;
	isOutsideVisibleRange: (date: CalendarDateValue, monthIndex: number) => boolean;
	/** True when the previous page (all `visibleMonths` before the current one) is entirely before `minValue`. */
	isPreviousPageDisabled: boolean;
	/** True when the next page (all `visibleMonths` after the current one) is entirely after `maxValue`. */
	isNextPageDisabled: boolean;
	setFocusedValue: (date: CalendarDateValue) => void;
	setFocusVisible: (visible: boolean) => void;
	consumeFocusRequest: (version: number) => boolean;
	setHoveredValue: (date: CalendarDateValue | undefined) => void;
	selectDate: (date: CalendarDateValue) => void;
	goToNextPage: () => void;
	goToPreviousPage: () => void;
	handleCellKeydown: (event: KeyboardEvent, date: CalendarDateValue) => void;
	sync: (next: CreateCalendarContextOptions) => void;
};

export function createCalendarContext(
	options: CreateCalendarContextOptions<'single'>
): CalendarContext;
export function createCalendarContext(
	options: CreateCalendarContextOptions<'range'>
): CalendarContext;
export function createCalendarContext(options: CreateCalendarContextOptions): CalendarContext;
export function createCalendarContext(options: CreateCalendarContextOptions): CalendarContext {
	const initialSelectionMode = options.selectionMode ?? 'single';
	const initialVisibleMonths = Math.max(1, options.visibleMonths ?? 1);
	const initialShowOutsideDays = options.showOutsideDays ?? false;
	const initialLocale = options.locale ?? Intl.DateTimeFormat().resolvedOptions().locale;
	const initialFirstDayOfWeek = options.firstDayOfWeek;
	const initialMonthHeadingStyle = options.monthHeadingStyle ?? 'composed';
	const initialUnavailableFn = options.isDateUnavailable;

	function normalizeBoundValue(bound: CalendarDateValue | undefined): CalendarDateValue | undefined {
		return bound && isValidCalendarDateValue(bound) ? bound : undefined;
	}

	const initialMinValue = normalizeBoundValue(options.minValue);
	const initialMaxValue = normalizeBoundValue(options.maxValue);

	let selectionMode = $state(initialSelectionMode);
	let visibleMonths = $state(initialVisibleMonths);
	let showOutsideDays = $state(initialShowOutsideDays);
	let locale = $state(initialLocale);
	let firstDayOfWeek = $state(initialFirstDayOfWeek);
	let monthHeadingStyle = $state(initialMonthHeadingStyle);
	let isDisabled = $state(options.isDisabled ?? false);
	let isReadOnly = $state(options.isReadOnly ?? false);
	let isDateUnavailable = $state(initialUnavailableFn);
	let minValue = $state(initialMinValue);
	let maxValue = $state(initialMaxValue);
	let onChange = options.onChange;

	const parsedMinValue = $derived(minValue ? parseCalendarDate(minValue) : null);
	const parsedMaxValue = $derived(maxValue ? parseCalendarDate(maxValue) : null);

	const { value, defaultValue } = options;

	function isRangeValue(
		valueToCheck: CalendarValue | null | undefined
	): valueToCheck is CalendarRangeValue {
		if (!valueToCheck || typeof valueToCheck === 'string') return false;
		return true;
	}

	function areExternalValuesEqual(
		a: CalendarValue | null | undefined,
		b: CalendarValue | null | undefined
	): boolean {
		if (a === b) return true;
		if (!isRangeValue(a) || !isRangeValue(b)) return false;
		return a.start === b.start && a.end === b.end;
	}

	function snapshotExternalValue(
		valueToSnapshot: CalendarValue | null | undefined
	): CalendarValue | null | undefined {
		if (!isRangeValue(valueToSnapshot)) return valueToSnapshot;
		return { start: valueToSnapshot.start, end: valueToSnapshot.end };
	}

	function normalizeRange(start: CalendarDateValue, end: CalendarDateValue): CalendarRangeValue {
		const parsedStart = parseCalendarDate(start);
		const parsedEnd = parseCalendarDate(end);
		if (!parsedStart || !parsedEnd) {
			return { start, end };
		}

		if (compareDates(parsedStart, parsedEnd) <= 0) {
			return { start, end };
		}

		return { start: end, end: start };
	}

	function isValueInsideRange(
		date: CalendarDateValue,
		range: CalendarRangeValue | undefined
	): boolean {
		if (!range?.start || !range?.end) return false;
		const parsedDate = parseCalendarDate(date);
		const parsedStart = parseCalendarDate(range.start);
		const parsedEnd = parseCalendarDate(range.end);
		if (!parsedDate || !parsedStart || !parsedEnd) return false;
		return compareDates(parsedDate, parsedStart) >= 0 && compareDates(parsedDate, parsedEnd) <= 0;
	}

	function isRangePathSelectable(start: CalendarDateValue, end: CalendarDateValue): boolean {
		const normalized = normalizeRange(start, end);
		if (!normalized.start || !normalized.end) return false;

		const parsedStart = parseCalendarDate(normalized.start);
		const parsedEnd = parseCalendarDate(normalized.end);
		if (!parsedStart || !parsedEnd) return false;

		for (
			let current = parsedStart;
			compareDates(current, parsedEnd) <= 0;
			current = addDays(current, 1)
		) {
			const currentValue = formatCalendarDate(current);
			if (isUnavailable(currentValue)) {
				return false;
			}
		}

		return true;
	}

	function getEffectiveRange(): CalendarRangeValue | undefined {
		if (currentRangeStart && currentRangeEnd) {
			return normalizeRange(currentRangeStart, currentRangeEnd);
		}

		if (currentRangeStart && currentPreviewEnd) {
			return normalizeRange(currentRangeStart, currentPreviewEnd);
		}

		if (currentRangeStart) {
			return { start: currentRangeStart };
		}

		return undefined;
	}

	const fallbackToday = formatCalendarDate(getTodayUtcDate());
	// `null` means "controlled and empty", so it must not fall back to defaultValue.
	const initialSingleSelected =
		initialSelectionMode === 'single' &&
		typeof value === 'string' &&
		isValidCalendarDateValue(value)
			? value
			: initialSelectionMode === 'single' &&
				  value !== null &&
				  typeof defaultValue === 'string' &&
				  isValidCalendarDateValue(defaultValue)
				? defaultValue
				: undefined;

	const initialRangeSelected =
		initialSelectionMode === 'range' && isRangeValue(value)
			? value
			: initialSelectionMode === 'range' && value !== null && isRangeValue(defaultValue)
				? defaultValue
				: undefined;

	let currentSelected = $state(initialSingleSelected);
	let currentRangeStart = $state(initialRangeSelected?.start);
	let currentRangeEnd = $state(initialRangeSelected?.end);
	let currentPreviewEnd = $state<CalendarDateValue | undefined>(undefined);
	// Only read from inside commands (never from a reactive scope), so these
	// stay plain, non-reactive bookkeeping.
	let currentRangeAnchor: CalendarDateValue | undefined;
	let currentHoveredDate: CalendarDateValue | undefined;
	let previousCommittedRange: CalendarRangeValue | undefined;
	let previousFocusedBeforeDraft: CalendarDateValue | undefined;
	const initialFocused =
		initialSingleSelected ??
		initialRangeSelected?.end ??
		initialRangeSelected?.start ??
		fallbackToday;
	let currentFocused = $state(initialFocused);
	let currentFocusVisible = $state(false);
	let currentVisibleMonth = $state(
		startOfMonth(parseCalendarDate(initialFocused) ?? getTodayUtcDate())
	);
	// PURE caches: intentionally non-reactive. They memoize pure computations
	// (unavailability lookups, pending-range path checks) and are invalidated
	// explicitly in the same code paths that invalidated them before the runes
	// migration. Making them reactive would trip `state_unsafe_mutation`,
	// because they are filled lazily from inside `$derived` reads.
	let unavailableCache = new Map<CalendarDateValue, boolean>();
	let pendingRangePathCache = new Map<CalendarDateValue, boolean>();
	let pendingRangePathCacheStart: CalendarDateValue | undefined;
	// Prop-sync guards: previous external inputs, compared inside `sync` so
	// parent rerenders with unchanged values do not reset internal state.
	let previousUnavailableFn = initialUnavailableFn;
	let previousMinValue = initialMinValue;
	let previousMaxValue = initialMaxValue;
	let previousValue = snapshotExternalValue(value);
	let previousDefaultValue = snapshotExternalValue(defaultValue);
	let previousVisibleMonths = initialVisibleMonths;
	let previousShowOutsideDays = initialShowOutsideDays;
	let previousLocale = initialLocale;
	let previousFirstDayOfWeek = initialFirstDayOfWeek;
	let previousMonthHeadingStyle = initialMonthHeadingStyle;
	const resolvedFirstDayOfWeek = $derived(resolveFirstDayOfWeek(locale, firstDayOfWeek));
	// One-shot focus request signal (see `CalendarContext.focusRequestVersion`).
	// Kept counter-based on purpose: "please focus the roving target now" is an
	// event, not state that can be derived from other state.
	let focusRequestVersion = $state(0);
	let lastConsumedFocusRequestVersion = 0;

	// Month grid, memoized by Svelte itself: it recomputes only when one of its
	// reactive inputs changes (replaces the manual months cache + layoutVersion).
	const months = $derived.by<CalendarMonth[]>(() => {
		const firstDay = resolvedFirstDayOfWeek;
		return Array.from({ length: visibleMonths }, (_, monthIndex) => {
			const monthStart = addMonths(startOfMonth(currentVisibleMonth), monthIndex);
			return {
				monthIndex,
				monthStart,
				heading: formatMonthHeading(monthStart, locale, monthHeadingStyle),
				weeks: buildMonthGrid(monthStart, firstDay, showOutsideDays)
			};
		});
	});

	const headingLabel = $derived.by(() => {
		if (months.length === 1) return months[0].heading;
		return `${months[0].heading} - ${months[months.length - 1].heading}`;
	});

	function clearUnavailableCache() {
		unavailableCache = new Map();
		pendingRangePathCache = new Map();
		pendingRangePathCacheStart = undefined;
	}

	function clearPendingRangePathCache() {
		pendingRangePathCache = new Map();
		pendingRangePathCacheStart = undefined;
	}

	function isPendingRangePathSelectable(date: CalendarDateValue): boolean {
		if (!currentRangeStart || currentRangeEnd) {
			return true;
		}

		if (pendingRangePathCacheStart !== currentRangeStart) {
			pendingRangePathCache = new Map();
			pendingRangePathCacheStart = currentRangeStart;
		}

		if (pendingRangePathCache.has(date)) {
			return pendingRangePathCache.get(date)!;
		}

		const result = isRangePathSelectable(currentRangeStart, date);
		pendingRangePathCache.set(date, result);
		return result;
	}

	function requestFocusedCellFocus() {
		focusRequestVersion += 1;
	}

	// Each focus request may be consumed at most once (by the roving focus
	// target). Cells mounted after a request was already handled (e.g. month
	// navigation with the mouse) must not steal focus on mount.
	function consumeFocusRequest(version: number): boolean {
		if (version <= lastConsumedFocusRequestVersion) return false;
		lastConsumedFocusRequestVersion = version;
		return true;
	}

	function syncExternal(next: CreateCalendarContextOptions) {
		const nextSelectionMode = next.selectionMode ?? 'single';
		const nextVisibleMonths = Math.max(1, next.visibleMonths ?? 1);
		const nextShowOutsideDays = next.showOutsideDays ?? false;
		const nextLocale = next.locale ?? Intl.DateTimeFormat().resolvedOptions().locale;
		const nextFirstDayOfWeek = next.firstDayOfWeek;
		const nextMonthHeadingStyle = next.monthHeadingStyle ?? 'composed';
		const nextUnavailableFn = next.isDateUnavailable;
		const nextMinValue = normalizeBoundValue(next.minValue);
		const nextMaxValue = normalizeBoundValue(next.maxValue);

		if (
			nextUnavailableFn !== previousUnavailableFn ||
			nextMinValue !== previousMinValue ||
			nextMaxValue !== previousMaxValue ||
			nextVisibleMonths !== previousVisibleMonths ||
			nextShowOutsideDays !== previousShowOutsideDays ||
			nextLocale !== previousLocale ||
			nextFirstDayOfWeek !== previousFirstDayOfWeek ||
			nextMonthHeadingStyle !== previousMonthHeadingStyle
		) {
			clearUnavailableCache();
		}

		previousUnavailableFn = nextUnavailableFn;
		previousMinValue = nextMinValue;
		previousMaxValue = nextMaxValue;
		previousVisibleMonths = nextVisibleMonths;
		previousShowOutsideDays = nextShowOutsideDays;
		previousLocale = nextLocale;
		previousFirstDayOfWeek = nextFirstDayOfWeek;
		previousMonthHeadingStyle = nextMonthHeadingStyle;

		const selectionModeChanged = selectionMode !== nextSelectionMode;
		if (selectionModeChanged) {
			selectionMode = nextSelectionMode;
			currentSelected = undefined;
			currentRangeStart = undefined;
			currentRangeEnd = undefined;
			currentRangeAnchor = undefined;
			currentPreviewEnd = undefined;
			currentHoveredDate = undefined;
			clearPendingRangePathCache();
		}

		visibleMonths = nextVisibleMonths;
		showOutsideDays = nextShowOutsideDays;
		locale = nextLocale;
		firstDayOfWeek = nextFirstDayOfWeek;
		monthHeadingStyle = nextMonthHeadingStyle;

		isDisabled = next.isDisabled ?? false;
		isReadOnly = next.isReadOnly ?? false;
		isDateUnavailable = nextUnavailableFn;
		minValue = nextMinValue;
		maxValue = nextMaxValue;
		onChange = next.onChange;

		const nextValue = next.value;
		const nextDefaultValue = next.defaultValue;
		// Only re-apply the external value when it actually changed, so parent
		// rerenders with the same value do not reset focus, the visible month or
		// an in-progress range draft.
		const valueChanged = !areExternalValuesEqual(nextValue, previousValue);
		const defaultValueChanged = !areExternalValuesEqual(nextDefaultValue, previousDefaultValue);
		previousValue = snapshotExternalValue(nextValue);
		previousDefaultValue = snapshotExternalValue(nextDefaultValue);
		const shouldApplyValue = valueChanged || selectionModeChanged;
		const shouldApplyDefaultValue = defaultValueChanged || selectionModeChanged;

		if (selectionMode === 'single') {
			if (shouldApplyValue && nextValue !== undefined) {
				if (typeof nextValue === 'string' && isValidCalendarDateValue(nextValue)) {
					currentSelected = nextValue;
					currentFocused = nextValue;
					currentVisibleMonth = startOfMonth(parseCalendarDate(nextValue) ?? currentVisibleMonth);
				} else if (currentSelected !== undefined) {
					// `null` (controlled and empty) or an invalid string clears the selection.
					currentSelected = undefined;
				}
			} else if (
				shouldApplyDefaultValue &&
				nextValue === undefined &&
				!currentSelected &&
				typeof nextDefaultValue === 'string' &&
				isValidCalendarDateValue(nextDefaultValue)
			) {
				currentSelected = nextDefaultValue;
				currentFocused = nextDefaultValue;
				currentVisibleMonth = startOfMonth(
					parseCalendarDate(nextDefaultValue) ?? currentVisibleMonth
				);
			}
			currentRangeStart = undefined;
			currentRangeEnd = undefined;
			currentRangeAnchor = undefined;
			currentPreviewEnd = undefined;
			currentHoveredDate = undefined;
			clearPendingRangePathCache();
		} else {
			if (shouldApplyValue && nextValue !== undefined) {
				if (isRangeValue(nextValue)) {
					const nextStart =
						nextValue.start && isValidCalendarDateValue(nextValue.start)
							? nextValue.start
							: undefined;
					const nextEnd =
						nextValue.end && isValidCalendarDateValue(nextValue.end) ? nextValue.end : undefined;
					const nextRange = nextStart && nextEnd ? normalizeRange(nextStart, nextEnd) : undefined;
					const shouldKeepFocused =
						!!nextRange &&
						isValidCalendarDateValue(currentFocused) &&
						isValueInsideRange(currentFocused, nextRange);
					const nextFocus = shouldKeepFocused
						? currentFocused
						: (nextRange?.end ?? nextRange?.start ?? nextEnd ?? nextStart);
					currentRangeStart = nextStart;
					currentRangeEnd = nextEnd;
					currentRangeAnchor = undefined;
					currentPreviewEnd = undefined;
					currentHoveredDate = undefined;
					clearPendingRangePathCache();
					if (nextFocus) {
						currentFocused = nextFocus;
						currentVisibleMonth = startOfMonth(parseCalendarDate(nextFocus) ?? currentVisibleMonth);
					}
				} else if (currentRangeStart || currentRangeEnd) {
					// `null` (controlled and empty) clears both ends of the range.
					currentRangeStart = undefined;
					currentRangeEnd = undefined;
					currentRangeAnchor = undefined;
					currentPreviewEnd = undefined;
					currentHoveredDate = undefined;
					clearPendingRangePathCache();
				}
			} else if (
				shouldApplyDefaultValue &&
				nextValue === undefined &&
				!currentRangeStart &&
				!currentRangeEnd &&
				isRangeValue(nextDefaultValue)
			) {
				const nextStart =
					nextDefaultValue.start && isValidCalendarDateValue(nextDefaultValue.start)
						? nextDefaultValue.start
						: undefined;
				const nextEnd =
					nextDefaultValue.end && isValidCalendarDateValue(nextDefaultValue.end)
						? nextDefaultValue.end
						: undefined;
				const nextRange = nextStart && nextEnd ? normalizeRange(nextStart, nextEnd) : undefined;
				const shouldKeepFocused =
					!!nextRange &&
					isValidCalendarDateValue(currentFocused) &&
					isValueInsideRange(currentFocused, nextRange);
				const nextFocus = shouldKeepFocused
					? currentFocused
					: (nextRange?.end ?? nextRange?.start ?? nextEnd ?? nextStart);

				currentRangeStart = nextStart;
				currentRangeEnd = nextEnd;
				currentRangeAnchor = undefined;
				currentPreviewEnd = undefined;
				currentHoveredDate = undefined;
				clearPendingRangePathCache();

				if (nextFocus) {
					currentFocused = nextFocus;
					currentVisibleMonth = startOfMonth(parseCalendarDate(nextFocus) ?? currentVisibleMonth);
				}
			}

			currentSelected = undefined;
		}
	}

	function getFirstOfVisibleRange(): Date {
		return startOfMonth(currentVisibleMonth);
	}

	function getLastOfVisibleRange(): Date {
		const lastVisibleMonthStart = addMonths(getFirstOfVisibleRange(), visibleMonths - 1);
		return addMonths(lastVisibleMonthStart, 1);
	}

	// The previous page is entirely out of range when every one of its days is
	// before `minValue`, i.e. when `minValue` falls on or after the first day of
	// the current page (dates are day-granular).
	const isPreviousPageDisabled = $derived.by(() => {
		if (!parsedMinValue) return false;
		return compareDates(parsedMinValue, startOfMonth(currentVisibleMonth)) >= 0;
	});

	// The next page is entirely out of range when every one of its days is after
	// `maxValue`, i.e. when `maxValue` is before the first day of the next page.
	const isNextPageDisabled = $derived.by(() => {
		if (!parsedMaxValue) return false;
		const nextPageStart = addMonths(startOfMonth(currentVisibleMonth), visibleMonths);
		return compareDates(parsedMaxValue, nextPageStart) < 0;
	});

	function ensureVisible(dateValue: CalendarDateValue) {
		const date = parseCalendarDate(dateValue);
		if (!date) return;

		const previousVisibleMonth = currentVisibleMonth.getTime();
		const first = getFirstOfVisibleRange();
		const afterLastExclusive = getLastOfVisibleRange();

		if (compareDates(date, first) < 0) {
			currentVisibleMonth = startOfMonth(date);
		} else if (compareDates(date, afterLastExclusive) >= 0) {
			currentVisibleMonth = startOfMonth(addMonths(date, -(visibleMonths - 1)));
		}

		if (currentVisibleMonth.getTime() !== previousVisibleMonth) {
			clearUnavailableCache();
		}
	}

	function isSelected(date: CalendarDateValue): boolean {
		if (selectionMode === 'range') {
			if (currentRangeStart && !currentRangeEnd && !currentPreviewEnd) {
				return currentRangeStart === date;
			}
			return isInRange(date);
		}
		return currentSelected === date;
	}

	function isRangeStart(date: CalendarDateValue): boolean {
		if (selectionMode !== 'range') return false;
		const range = getEffectiveRange();
		return range?.start === date;
	}

	function isRangeEnd(date: CalendarDateValue): boolean {
		if (selectionMode !== 'range') return false;
		const range = getEffectiveRange();
		return range?.end === date;
	}

	function isInRange(date: CalendarDateValue): boolean {
		if (selectionMode !== 'range') return false;
		return isValueInsideRange(date, getEffectiveRange());
	}

	function isOutOfBounds(date: CalendarDateValue): boolean {
		if (!parsedMinValue && !parsedMaxValue) return false;
		const parsed = parseCalendarDate(date);
		if (!parsed) return false;
		if (parsedMinValue && compareDates(parsed, parsedMinValue) < 0) return true;
		if (parsedMaxValue && compareDates(parsed, parsedMaxValue) > 0) return true;
		return false;
	}

	function isUnavailable(date: CalendarDateValue): boolean {
		if (unavailableCache.has(date)) {
			return unavailableCache.get(date)!;
		}

		// Dates outside [minValue, maxValue] report unavailable, merged with the
		// user-provided predicate. The cache is cleared whenever the bounds or the
		// predicate identity change (see `syncExternal`).
		const result = isOutOfBounds(date) || (isDateUnavailable?.(date) ?? false);
		unavailableCache.set(date, result);
		return result;
	}

	function isDateDisabled(date: CalendarDateValue): boolean {
		if (isDisabled) return true;

		if (selectionMode === 'range' && currentRangeStart && !currentRangeEnd) {
			return !isPendingRangePathSelectable(date);
		}

		return false;
	}

	function isOutsideVisibleRange(date: CalendarDateValue, monthIndex: number): boolean {
		const parsed = parseCalendarDate(date);
		if (!parsed) return true;
		const month = addMonths(startOfMonth(currentVisibleMonth), monthIndex);
		return (
			parsed.getUTCMonth() !== month.getUTCMonth() ||
			parsed.getUTCFullYear() !== month.getUTCFullYear()
		);
	}

	function setFocusedValue(date: CalendarDateValue) {
		if (!isValidCalendarDateValue(date)) return;
		if (currentFocused === date) return;

		currentFocused = date;
		ensureVisible(date);
	}

	function setFocusVisible(visible: boolean) {
		if (currentFocusVisible === visible) return;
		currentFocusVisible = visible;
	}

	function setHoveredValue(date: CalendarDateValue | undefined) {
		if (selectionMode !== 'range') return;
		if (isDisabled || isReadOnly) return;
		if (!currentRangeStart || currentRangeEnd) return;

		const nextHovered = date && isValidCalendarDateValue(date) ? date : undefined;
		if (nextHovered === currentHoveredDate) return;

		if (!nextHovered) {
			// Mouseleave: clear the hover preview so Enter cannot commit a stale end.
			currentHoveredDate = undefined;
			currentPreviewEnd = undefined;
			return;
		}

		if (!isRangePathSelectable(currentRangeStart, nextHovered)) {
			return;
		}

		currentHoveredDate = nextHovered;
		currentPreviewEnd = nextHovered;
	}

	function beginRangeSelection(date: CalendarDateValue) {
		previousCommittedRange =
			currentRangeStart && currentRangeEnd
				? { start: currentRangeStart, end: currentRangeEnd }
				: undefined;
		previousFocusedBeforeDraft = currentFocused;
		currentRangeStart = date;
		currentRangeEnd = undefined;
		currentRangeAnchor = date;
		currentPreviewEnd = undefined;
		currentHoveredDate = undefined;
		clearPendingRangePathCache();
	}

	function commitRangeSelection(start: CalendarDateValue, end: CalendarDateValue) {
		if (!isRangePathSelectable(start, end)) {
			return;
		}

		const normalized = normalizeRange(start, end);
		currentRangeStart = normalized.start;
		currentRangeEnd = normalized.end;
		currentRangeAnchor = normalized.start;
		currentPreviewEnd = undefined;
		currentHoveredDate = undefined;
		clearPendingRangePathCache();
		previousCommittedRange = { start: normalized.start, end: normalized.end };
		previousFocusedBeforeDraft = undefined;
		onChange?.({ start: normalized.start, end: normalized.end });
	}

	function cancelPendingRangeSelection() {
		if (selectionMode !== 'range') return;
		if (!currentRangeStart || currentRangeEnd) return;

		currentRangeStart = previousCommittedRange?.start;
		currentRangeEnd = previousCommittedRange?.end;
		currentRangeAnchor = previousCommittedRange?.start;
		currentPreviewEnd = undefined;
		currentHoveredDate = undefined;
		clearPendingRangePathCache();

		const restoredFocus =
			previousFocusedBeforeDraft ?? previousCommittedRange?.end ?? previousCommittedRange?.start;
		if (restoredFocus && isValidCalendarDateValue(restoredFocus)) {
			currentFocused = restoredFocus;
			ensureVisible(restoredFocus);
		}

		previousCommittedRange = undefined;
		previousFocusedBeforeDraft = undefined;
	}

	function selectDate(date: CalendarDateValue) {
		if (!isValidCalendarDateValue(date)) return;
		if (isDisabled || isReadOnly || isUnavailable(date)) return;

		if (selectionMode === 'range') {
			currentFocused = date;
			ensureVisible(date);

			if (!currentRangeStart || currentRangeEnd) {
				beginRangeSelection(date);
			} else {
				commitRangeSelection(currentRangeStart, date);
			}
			return;
		}

		if (currentSelected === date && currentFocused === date) return;

		currentSelected = date;
		currentFocused = date;
		ensureVisible(date);
		onChange?.(date);
	}

	function goToNextPage() {
		if (isNextPageDisabled) return;
		currentVisibleMonth = startOfMonth(addMonths(currentVisibleMonth, visibleMonths));
		const focused = parseCalendarDate(currentFocused);
		if (focused) {
			currentFocused = clampDateToBounds(formatCalendarDate(addMonths(focused, visibleMonths)));
		}
		clearUnavailableCache();
	}

	function goToPreviousPage() {
		if (isPreviousPageDisabled) return;
		currentVisibleMonth = startOfMonth(addMonths(currentVisibleMonth, -visibleMonths));
		const focused = parseCalendarDate(currentFocused);
		if (focused) {
			currentFocused = clampDateToBounds(formatCalendarDate(addMonths(focused, -visibleMonths)));
		}
		clearUnavailableCache();
	}

	function moveFocusByDays(
		baseDate: CalendarDateValue,
		amount: number
	): CalendarDateValue | undefined {
		const parsed = parseCalendarDate(baseDate);
		if (!parsed) return undefined;
		const next = addDays(parsed, amount);
		const nextValue = formatCalendarDate(next);
		const focusableValue = findFocusableDate(nextValue);
		if (!focusableValue) return undefined;
		setFocusedValue(focusableValue);
		return focusableValue;
	}

	function moveFocusByMonths(
		baseDate: CalendarDateValue,
		amount: number
	): CalendarDateValue | undefined {
		const parsed = parseCalendarDate(baseDate);
		if (!parsed) return undefined;
		const next = addMonths(parsed, amount);
		const nextValue = formatCalendarDate(next);
		const focusableValue = findFocusableDate(nextValue);
		if (!focusableValue) {
			if (selectionMode === 'range' && currentRangeStart && !currentRangeEnd) {
				return moveToMonthEdge(baseDate, amount >= 0 ? 'end' : 'start');
			}
			return undefined;
		}
		setFocusedValue(focusableValue);
		return focusableValue;
	}

	function moveToMonthEdge(
		baseDate: CalendarDateValue,
		edge: 'start' | 'end'
	): CalendarDateValue | undefined {
		const parsed = parseCalendarDate(baseDate);
		if (!parsed) return undefined;

		const monthStart = startOfMonth(parsed);
		const monthEnd = addDays(addMonths(monthStart, 1), -1);
		const targetDate = edge === 'start' ? monthStart : monthEnd;
		const nextValue = formatCalendarDate(targetDate);
		const focusableValue = findFocusableDate(nextValue);
		if (!focusableValue) return undefined;
		setFocusedValue(focusableValue);
		return focusableValue;
	}

	// Keyboard month navigation (PageUp/Down, arrows across months) clamps at
	// the bounds: focus lands on the nearest in-range date instead of walking
	// into fully-disabled months.
	function clampDateToBounds(targetDate: CalendarDateValue): CalendarDateValue {
		const parsed = parseCalendarDate(targetDate);
		if (!parsed) return targetDate;
		if (minValue && parsedMinValue && compareDates(parsed, parsedMinValue) < 0) return minValue;
		if (maxValue && parsedMaxValue && compareDates(parsed, parsedMaxValue) > 0) return maxValue;
		return targetDate;
	}

	function findFocusableDate(targetDate: CalendarDateValue): CalendarDateValue | undefined {
		if (isDisabled) return undefined;
		return clampDateToBounds(targetDate);
	}

	function handleCellKeydown(event: KeyboardEvent, date: CalendarDateValue) {
		const keyDate = isValidCalendarDateValue(currentFocused) ? currentFocused : date;
		let movedDate: CalendarDateValue | undefined;

		function extendRangeWithKeyboard(nextDate: CalendarDateValue | undefined) {
			if (selectionMode !== 'range') return;
			if (!nextDate) return;
			if (isDisabled || isReadOnly) return;
			if (!currentRangeStart || currentRangeEnd) return;

			const anchor = currentRangeAnchor ?? currentRangeStart;
			if (!isValidCalendarDateValue(anchor)) return;
			if (!isRangePathSelectable(anchor, nextDate)) {
				return;
			}
			currentPreviewEnd = nextDate;
			currentHoveredDate = nextDate;
		}

		switch (event.key) {
			case 'ArrowRight':
				event.preventDefault();
				setFocusVisible(true);
				movedDate = moveFocusByDays(keyDate, 1);
				if (movedDate) requestFocusedCellFocus();
				extendRangeWithKeyboard(movedDate);
				break;
			case 'ArrowLeft':
				event.preventDefault();
				setFocusVisible(true);
				movedDate = moveFocusByDays(keyDate, -1);
				if (movedDate) requestFocusedCellFocus();
				extendRangeWithKeyboard(movedDate);
				break;
			case 'ArrowDown':
				event.preventDefault();
				setFocusVisible(true);
				movedDate = moveFocusByDays(keyDate, 7);
				if (movedDate) requestFocusedCellFocus();
				extendRangeWithKeyboard(movedDate);
				break;
			case 'ArrowUp':
				event.preventDefault();
				setFocusVisible(true);
				movedDate = moveFocusByDays(keyDate, -7);
				if (movedDate) requestFocusedCellFocus();
				extendRangeWithKeyboard(movedDate);
				break;
			case 'Home':
				event.preventDefault();
				setFocusVisible(true);
				movedDate = moveToMonthEdge(keyDate, 'start');
				if (movedDate) requestFocusedCellFocus();
				extendRangeWithKeyboard(movedDate);
				break;
			case 'End':
				event.preventDefault();
				setFocusVisible(true);
				movedDate = moveToMonthEdge(keyDate, 'end');
				if (movedDate) requestFocusedCellFocus();
				extendRangeWithKeyboard(movedDate);
				break;
			case 'PageUp':
				event.preventDefault();
				setFocusVisible(true);
				movedDate = moveFocusByMonths(keyDate, -1);
				if (movedDate) requestFocusedCellFocus();
				extendRangeWithKeyboard(movedDate);
				break;
			case 'PageDown':
				event.preventDefault();
				setFocusVisible(true);
				movedDate = moveFocusByMonths(keyDate, 1);
				if (movedDate) requestFocusedCellFocus();
				extendRangeWithKeyboard(movedDate);
				break;
			case 'Enter':
			case ' ':
			// Legacy key value emitted by some older browsers/IMEs; kept in sync
			// with the body-cell press-state handling, which accepts it too.
			case 'Spacebar':
				event.preventDefault();
				setFocusVisible(true);
				if (
					selectionMode === 'range' &&
					currentRangeStart &&
					!currentRangeEnd &&
					currentPreviewEnd
				) {
					commitRangeSelection(currentRangeStart, currentPreviewEnd);
					break;
				}
				selectDate(keyDate);
				break;
			case 'Escape': {
				// Only consume Escape when there is a pending range draft to cancel,
				// so a second Escape can propagate (e.g. to close a popover).
				const hasPendingRangeSelection =
					selectionMode === 'range' && !!currentRangeStart && !currentRangeEnd;
				if (!hasPendingRangeSelection) break;
				event.preventDefault();
				setFocusVisible(true);
				cancelPendingRangeSelection();
				break;
			}
		}
	}

	const context: CalendarContext = {
		get focusRequestVersion() {
			return focusRequestVersion;
		},
		get locale() {
			return locale;
		},
		get selectionMode() {
			return selectionMode;
		},
		get firstDayOfWeek() {
			return resolvedFirstDayOfWeek;
		},
		get visibleMonths() {
			return visibleMonths;
		},
		get showOutsideDays() {
			return showOutsideDays;
		},
		get isDisabled() {
			return isDisabled;
		},
		get isReadOnly() {
			return isReadOnly;
		},
		get months() {
			return months;
		},
		get selectedValue() {
			return currentSelected;
		},
		get rangeValue() {
			return selectionMode === 'range' ? getEffectiveRange() : undefined;
		},
		get focusedValue() {
			return currentFocused;
		},
		get focusVisible() {
			return currentFocusVisible;
		},
		get weekdayLabels() {
			return getWeekdayLabels(locale, resolvedFirstDayOfWeek);
		},
		get headingLabel() {
			return headingLabel;
		},
		getWeekdayLabels(weekdayStyle: CalendarWeekdayStyle = 'short') {
			return getWeekdayLabels(locale, resolvedFirstDayOfWeek, weekdayStyle);
		},
		get isPreviousPageDisabled() {
			return isPreviousPageDisabled;
		},
		get isNextPageDisabled() {
			return isNextPageDisabled;
		},
		isSelected,
		isRangeStart,
		isRangeEnd,
		isInRange,
		isDateUnavailable: isUnavailable,
		isDateDisabled,
		isOutsideVisibleRange,
		setFocusedValue: asCommand(setFocusedValue),
		setFocusVisible: asCommand(setFocusVisible),
		consumeFocusRequest: asCommand(consumeFocusRequest),
		setHoveredValue: asCommand(setHoveredValue),
		selectDate: asCommand(selectDate),
		goToNextPage: asCommand(goToNextPage),
		goToPreviousPage: asCommand(goToPreviousPage),
		handleCellKeydown: asCommand(handleCellKeydown),
		sync: asCommand(syncExternal)
	};

	return context;
}

export function setCalendarContext(context: CalendarContext) {
	setContext(KEY, context);
}

export function getCalendarContext(): CalendarContext {
	return getContext<CalendarContext>(KEY);
}

export function useCalendarContext(): CalendarContext {
	const context = getCalendarContext();
	if (!context) {
		throw new Error('Calendar components must be used within Calendar.Root');
	}
	return context;
}
