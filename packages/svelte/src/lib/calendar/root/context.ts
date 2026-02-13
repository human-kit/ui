import { getContext, setContext } from 'svelte';
import { writable, type Readable } from 'svelte/store';
import {
  addDays,
  addMonths,
  buildMonthGrid,
  compareDates,
  formatCalendarDate,
  formatMonthHeading,
  getFirstDayOfWeek,
  getTodayUtcDate,
  getWeekdayLabels,
  isValidCalendarDateValue,
  parseCalendarDate,
  startOfMonth,
  type CalendarDateValue,
  type CalendarDayCell
} from './date-utils';

const KEY = Symbol('calendar');
const MAX_FOCUS_SEARCH_DAYS = 370;

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
  locale?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  value?: CalendarValueBySelectionMode<TSelectionMode>;
  defaultValue?: CalendarValueBySelectionMode<TSelectionMode>;
  isDateUnavailable?: (date: CalendarDateValue) => boolean;
  onChange?: (value: CalendarValueBySelectionMode<TSelectionMode>) => void;
};

export type CalendarContext = {
  layoutVersion: Readable<number>;
  selectionVersion: Readable<number>;
  locale: string;
  selectionMode: CalendarSelectionMode;
  firstDayOfWeek: number;
  visibleMonths: number;
  isDisabled: boolean;
  isReadOnly: boolean;
  months: CalendarMonth[];
  selectedValue: CalendarDateValue | undefined;
  rangeValue: CalendarRangeValue | undefined;
  focusedValue: CalendarDateValue;
  weekdayLabels: string[];
  headingLabel: string;
  isSelected: (date: CalendarDateValue) => boolean;
  isRangeStart: (date: CalendarDateValue) => boolean;
  isRangeEnd: (date: CalendarDateValue) => boolean;
  isInRange: (date: CalendarDateValue) => boolean;
  isDateUnavailable: (date: CalendarDateValue) => boolean;
  isDateDisabled: (date: CalendarDateValue) => boolean;
  isOutsideVisibleRange: (date: CalendarDateValue, monthIndex: number) => boolean;
  setFocusedValue: (date: CalendarDateValue) => void;
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
export function createCalendarContext(
  options: CreateCalendarContextOptions
): CalendarContext;
export function createCalendarContext(options: CreateCalendarContextOptions): CalendarContext {
  let {
    selectionMode = 'single',
    visibleMonths = 1,
    locale = Intl.DateTimeFormat().resolvedOptions().locale,
    isDisabled = false,
    isReadOnly = false,
    isDateUnavailable,
    onChange
  } = options;

  const { value, defaultValue } = options;

  function isRangeValue(valueToCheck: CalendarValue | undefined): valueToCheck is CalendarRangeValue {
    if (!valueToCheck || typeof valueToCheck === 'string') return false;
    return true;
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

  function isValueInsideRange(date: CalendarDateValue, range: CalendarRangeValue | undefined): boolean {
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
  const initialSingleSelected =
    selectionMode === 'single' && typeof value === 'string' && isValidCalendarDateValue(value)
      ? value
      : selectionMode === 'single' && typeof defaultValue === 'string' && isValidCalendarDateValue(defaultValue)
        ? defaultValue
        : undefined;

  const initialRangeSelected =
    selectionMode === 'range' && isRangeValue(value)
      ? value
      : selectionMode === 'range' && isRangeValue(defaultValue)
        ? defaultValue
        : undefined;

  let currentSelected = initialSingleSelected;
  let currentRangeStart = initialRangeSelected?.start;
  let currentRangeEnd = initialRangeSelected?.end;
  let currentRangeAnchor: CalendarDateValue | undefined;
  let currentPreviewEnd: CalendarDateValue | undefined;
  let currentHoveredDate: CalendarDateValue | undefined;
  let previousCommittedRange: CalendarRangeValue | undefined;
  let previousFocusedBeforeDraft: CalendarDateValue | undefined;
  let currentFocused =
    initialSingleSelected ?? initialRangeSelected?.end ?? initialRangeSelected?.start ?? fallbackToday;
  let currentVisibleMonth = startOfMonth(parseCalendarDate(currentFocused) ?? getTodayUtcDate());
  let cachedMonths: CalendarMonth[] = [];
  let hasCachedMonths = false;
  let unavailableCache = new Map<CalendarDateValue, boolean>();
  let pendingRangePathCache = new Map<CalendarDateValue, boolean>();
  let pendingRangePathCacheStart: CalendarDateValue | undefined;
  let previousUnavailableFn = isDateUnavailable;
  let previousVisibleMonths = visibleMonths;
  let previousLocale = locale;
  let cachedFirstDayOfWeek = getFirstDayOfWeek(locale);
  const layoutVersion = writable(0);
  const selectionVersion = writable(0);

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

  function notifyLayout() {
    hasCachedMonths = false;
    layoutVersion.update((value) => value + 1);
  }

  function notifySelection() {
    selectionVersion.update((value) => value + 1);
  }

  function syncExternal(next: CreateCalendarContextOptions) {
    let shouldNotifyLayout = false;
    let shouldNotifySelection = false;

    const nextSelectionMode = next.selectionMode ?? 'single';
    const nextVisibleMonths = Math.max(1, next.visibleMonths ?? 1);
    const nextLocale = next.locale ?? Intl.DateTimeFormat().resolvedOptions().locale;
    const nextUnavailableFn = next.isDateUnavailable;

    if (
      nextUnavailableFn !== previousUnavailableFn ||
      nextVisibleMonths !== previousVisibleMonths ||
      nextLocale !== previousLocale
    ) {
      clearUnavailableCache();
      shouldNotifyLayout = true;
    }

    previousUnavailableFn = nextUnavailableFn;
    previousVisibleMonths = nextVisibleMonths;
    previousLocale = nextLocale;

    if (selectionMode !== nextSelectionMode) {
      selectionMode = nextSelectionMode;
      currentSelected = undefined;
      currentRangeStart = undefined;
      currentRangeEnd = undefined;
      currentRangeAnchor = undefined;
      currentPreviewEnd = undefined;
      currentHoveredDate = undefined;
      clearPendingRangePathCache();
      shouldNotifySelection = true;
      shouldNotifyLayout = true;
    }

    visibleMonths = nextVisibleMonths;
    locale = nextLocale;
    cachedFirstDayOfWeek = getFirstDayOfWeek(locale);

    if (isDisabled !== (next.isDisabled ?? false) || isReadOnly !== (next.isReadOnly ?? false)) {
      shouldNotifyLayout = true;
    }

    isDisabled = next.isDisabled ?? false;
    isReadOnly = next.isReadOnly ?? false;
    isDateUnavailable = nextUnavailableFn;
    onChange = next.onChange;

    const nextValue = next.value;
    const nextDefaultValue = next.defaultValue;

    if (selectionMode === 'single') {
      if (nextValue !== undefined) {
        if (typeof nextValue === 'string' && isValidCalendarDateValue(nextValue)) {
          if (currentSelected !== nextValue || currentFocused !== nextValue) {
            shouldNotifySelection = true;
          }
          currentSelected = nextValue;
          currentFocused = nextValue;
          currentVisibleMonth = startOfMonth(parseCalendarDate(nextValue) ?? currentVisibleMonth);
          shouldNotifyLayout = true;
        } else if (currentSelected !== undefined) {
          currentSelected = undefined;
          shouldNotifySelection = true;
        }
      } else if (
        !currentSelected &&
        typeof nextDefaultValue === 'string' &&
        isValidCalendarDateValue(nextDefaultValue)
      ) {
        currentSelected = nextDefaultValue;
        currentFocused = nextDefaultValue;
        currentVisibleMonth = startOfMonth(
          parseCalendarDate(nextDefaultValue) ?? currentVisibleMonth
        );
        shouldNotifySelection = true;
        shouldNotifyLayout = true;
      }
      currentRangeStart = undefined;
      currentRangeEnd = undefined;
      currentRangeAnchor = undefined;
      currentPreviewEnd = undefined;
      currentHoveredDate = undefined;
      clearPendingRangePathCache();
    } else {
      if (nextValue !== undefined) {
        if (isRangeValue(nextValue)) {
          const nextStart =
            nextValue.start && isValidCalendarDateValue(nextValue.start) ? nextValue.start : undefined;
          const nextEnd =
            nextValue.end && isValidCalendarDateValue(nextValue.end) ? nextValue.end : undefined;
          const nextRange = nextStart && nextEnd ? normalizeRange(nextStart, nextEnd) : undefined;
          const shouldKeepFocused =
            !!nextRange &&
            isValidCalendarDateValue(currentFocused) &&
            isValueInsideRange(currentFocused, nextRange);
          const nextFocus = shouldKeepFocused
            ? currentFocused
            : nextRange?.end ?? nextRange?.start ?? nextEnd ?? nextStart;
          if (
            currentRangeStart !== nextStart ||
            currentRangeEnd !== nextEnd ||
            currentFocused !== (nextFocus ?? currentFocused)
          ) {
            shouldNotifySelection = true;
          }
          currentRangeStart = nextStart;
          currentRangeEnd = nextEnd;
          currentRangeAnchor = undefined;
          currentPreviewEnd = undefined;
          currentHoveredDate = undefined;
          clearPendingRangePathCache();
          if (nextFocus) {
            currentFocused = nextFocus;
            currentVisibleMonth = startOfMonth(parseCalendarDate(nextFocus) ?? currentVisibleMonth);
            shouldNotifyLayout = true;
          }
        } else if (currentRangeStart || currentRangeEnd) {
          currentRangeStart = undefined;
          currentRangeEnd = undefined;
          currentRangeAnchor = undefined;
          currentPreviewEnd = undefined;
          currentHoveredDate = undefined;
          clearPendingRangePathCache();
          shouldNotifySelection = true;
        }
      } else if (!currentRangeStart && !currentRangeEnd && isRangeValue(nextDefaultValue)) {
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
          : nextRange?.end ?? nextRange?.start ?? nextEnd ?? nextStart;

        currentRangeStart = nextStart;
        currentRangeEnd = nextEnd;
        currentRangeAnchor = undefined;
        currentPreviewEnd = undefined;
        currentHoveredDate = undefined;
        clearPendingRangePathCache();

        if (nextFocus) {
          currentFocused = nextFocus;
          currentVisibleMonth = startOfMonth(parseCalendarDate(nextFocus) ?? currentVisibleMonth);
          shouldNotifyLayout = true;
        }
        shouldNotifySelection = true;
      }

      currentSelected = undefined;
    }

    if (shouldNotifyLayout) notifyLayout();
    if (shouldNotifySelection) notifySelection();
  }

  function getFirstOfVisibleRange(): Date {
    return startOfMonth(currentVisibleMonth);
  }

  function getLastOfVisibleRange(): Date {
    const lastVisibleMonthStart = addMonths(getFirstOfVisibleRange(), visibleMonths - 1);
    return addMonths(lastVisibleMonthStart, 1);
  }

  function ensureVisible(dateValue: CalendarDateValue): boolean {
    const date = parseCalendarDate(dateValue);
    if (!date) return false;

    const previousVisibleMonth = currentVisibleMonth.getTime();
    const first = getFirstOfVisibleRange();
    const afterLastExclusive = getLastOfVisibleRange();

    if (compareDates(date, first) < 0) {
      currentVisibleMonth = startOfMonth(date);
    } else if (compareDates(date, afterLastExclusive) >= 0) {
      currentVisibleMonth = startOfMonth(addMonths(date, -(visibleMonths - 1)));
    }

    const didChange = currentVisibleMonth.getTime() !== previousVisibleMonth;
    if (didChange) {
      clearUnavailableCache();
    }

    return didChange;
  }

  function getMonths(): CalendarMonth[] {
    if (hasCachedMonths) {
      return cachedMonths;
    }

    const firstDayOfWeek = cachedFirstDayOfWeek;
    cachedMonths = Array.from({ length: visibleMonths }, (_, monthIndex) => {
      const monthStart = addMonths(startOfMonth(currentVisibleMonth), monthIndex);
      return {
        monthIndex,
        monthStart,
        heading: formatMonthHeading(monthStart, locale),
        weeks: buildMonthGrid(monthStart, firstDayOfWeek)
      };
    });

    hasCachedMonths = true;
    return cachedMonths;
  }

  function getHeadingLabel(): string {
    const months = getMonths();
    if (months.length === 1) return months[0].heading;
    return `${months[0].heading} - ${months[months.length - 1].heading}`;
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

  function isUnavailable(date: CalendarDateValue): boolean {
    if (unavailableCache.has(date)) {
      return unavailableCache.get(date)!;
    }

    const result = isDateUnavailable?.(date) ?? false;
    unavailableCache.set(date, result);
    return result;
  }

  function isDateDisabled(date: CalendarDateValue): boolean {
    if (isDisabled || isUnavailable(date)) return true;

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
    const didChangeMonth = ensureVisible(date);
    if (didChangeMonth) {
      notifyLayout();
    }
    notifySelection();
  }

  function setHoveredValue(date: CalendarDateValue | undefined) {
    if (selectionMode !== 'range') return;
    if (isDisabled || isReadOnly) return;
    if (!currentRangeStart || currentRangeEnd) return;

    const nextHovered = date && isValidCalendarDateValue(date) ? date : undefined;
    if (nextHovered === currentHoveredDate) return;

    if (!nextHovered) {
      return;
    }

    if (nextHovered && !isRangePathSelectable(currentRangeStart, nextHovered)) {
      return;
    }

    currentHoveredDate = nextHovered;
    currentPreviewEnd = nextHovered;
    notifySelection();
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

    const restoredFocus = previousFocusedBeforeDraft ?? previousCommittedRange?.end ?? previousCommittedRange?.start;
    if (restoredFocus && isValidCalendarDateValue(restoredFocus)) {
      currentFocused = restoredFocus;
      const didChangeMonth = ensureVisible(restoredFocus);
      if (didChangeMonth) {
        notifyLayout();
      }
    }

    previousCommittedRange = undefined;
    previousFocusedBeforeDraft = undefined;
    notifySelection();
  }

  function selectDate(date: CalendarDateValue) {
    if (!isValidCalendarDateValue(date)) return;
    if (isDisabled || isReadOnly || isUnavailable(date)) return;

    if (selectionMode === 'range') {
      currentFocused = date;
      const didChangeMonth = ensureVisible(date);

      if (!currentRangeStart || currentRangeEnd) {
        beginRangeSelection(date);
      } else {
        commitRangeSelection(currentRangeStart, date);
      }

      if (didChangeMonth) {
        notifyLayout();
      }
      notifySelection();
      return;
    }

    if (currentSelected === date && currentFocused === date) return;

    currentSelected = date;
    currentFocused = date;
    const didChangeMonth = ensureVisible(date);
    if (didChangeMonth) {
      notifyLayout();
    }
    notifySelection();
    onChange?.(date);
  }

  function goToNextPage() {
    currentVisibleMonth = startOfMonth(addMonths(currentVisibleMonth, visibleMonths));
    const focused = parseCalendarDate(currentFocused);
    if (focused) {
      currentFocused = formatCalendarDate(addMonths(focused, visibleMonths));
    }
    clearUnavailableCache();
    notifyLayout();
    notifySelection();
  }

  function goToPreviousPage() {
    currentVisibleMonth = startOfMonth(addMonths(currentVisibleMonth, -visibleMonths));
    const focused = parseCalendarDate(currentFocused);
    if (focused) {
      currentFocused = formatCalendarDate(addMonths(focused, -visibleMonths));
    }
    clearUnavailableCache();
    notifyLayout();
    notifySelection();
  }

  function moveFocusByDays(baseDate: CalendarDateValue, amount: number): CalendarDateValue | undefined {
    const parsed = parseCalendarDate(baseDate);
    if (!parsed) return undefined;
    const next = addDays(parsed, amount);
    const nextValue = formatCalendarDate(next);
    const focusableValue = findFocusableDate(nextValue, amount);
    if (!focusableValue) return undefined;
    setFocusedValue(focusableValue);
    return focusableValue;
  }

  function moveFocusByMonths(baseDate: CalendarDateValue, amount: number): CalendarDateValue | undefined {
    const parsed = parseCalendarDate(baseDate);
    if (!parsed) return undefined;
    const next = addMonths(parsed, amount);
    const nextValue = formatCalendarDate(next);
    const dayStep = amount >= 0 ? 1 : -1;
    const focusableValue = findFocusableDate(nextValue, dayStep);
    if (!focusableValue) {
      if (selectionMode === 'range' && currentRangeStart && !currentRangeEnd) {
        return moveToMonthEdge(baseDate, amount >= 0 ? 'end' : 'start');
      }
      return undefined;
    }
    setFocusedValue(focusableValue);
    return focusableValue;
  }

  function moveToMonthEdge(baseDate: CalendarDateValue, edge: 'start' | 'end'): CalendarDateValue | undefined {
    const parsed = parseCalendarDate(baseDate);
    if (!parsed) return undefined;

    const monthStart = startOfMonth(parsed);
    const monthEnd = addDays(addMonths(monthStart, 1), -1);
    const targetDate = edge === 'start' ? monthStart : monthEnd;
    const nextValue = formatCalendarDate(targetDate);
    const dayStep = edge === 'start' ? 1 : -1;
    const focusableValue = findFocusableDate(nextValue, dayStep);
    if (!focusableValue) return undefined;
    setFocusedValue(focusableValue);
    return focusableValue;
  }

  function findFocusableDate(
    targetDate: CalendarDateValue,
    dayStep: number
  ): CalendarDateValue | undefined {
    if (isDisabled) return undefined;
    if (!isDateDisabled(targetDate)) return targetDate;

    if (dayStep === 0) return undefined;

    let current = parseCalendarDate(targetDate);
    if (!current) return undefined;

    for (let index = 0; index < MAX_FOCUS_SEARCH_DAYS; index++) {
      current = addDays(current, dayStep > 0 ? 1 : -1);
      const candidate = formatCalendarDate(current);
      if (!isDateDisabled(candidate)) {
        return candidate;
      }
    }

    return undefined;
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
      notifySelection();
    }

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        movedDate = moveFocusByDays(keyDate, 1);
        extendRangeWithKeyboard(movedDate);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        movedDate = moveFocusByDays(keyDate, -1);
        extendRangeWithKeyboard(movedDate);
        break;
      case 'ArrowDown':
        event.preventDefault();
        movedDate = moveFocusByDays(keyDate, 7);
        extendRangeWithKeyboard(movedDate);
        break;
      case 'ArrowUp':
        event.preventDefault();
        movedDate = moveFocusByDays(keyDate, -7);
        extendRangeWithKeyboard(movedDate);
        break;
      case 'Home':
        event.preventDefault();
        movedDate = moveToMonthEdge(keyDate, 'start');
        extendRangeWithKeyboard(movedDate);
        break;
      case 'End':
        event.preventDefault();
        movedDate = moveToMonthEdge(keyDate, 'end');
        extendRangeWithKeyboard(movedDate);
        break;
      case 'PageUp':
        event.preventDefault();
        movedDate = moveFocusByMonths(keyDate, -1);
        extendRangeWithKeyboard(movedDate);
        break;
      case 'PageDown':
        event.preventDefault();
        movedDate = moveFocusByMonths(keyDate, 1);
        extendRangeWithKeyboard(movedDate);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (
          selectionMode === 'range' &&
          currentRangeStart &&
          !currentRangeEnd &&
          currentPreviewEnd
        ) {
          commitRangeSelection(currentRangeStart, currentPreviewEnd);
          notifySelection();
          break;
        }
        selectDate(keyDate);
        break;
      case 'Escape':
        event.preventDefault();
        cancelPendingRangeSelection();
        break;
    }
  }

  const context: CalendarContext = {
    layoutVersion,
    selectionVersion,
    get locale() {
      return locale;
    },
    get selectionMode() {
      return selectionMode;
    },
    get firstDayOfWeek() {
      return cachedFirstDayOfWeek;
    },
    get visibleMonths() {
      return visibleMonths;
    },
    get isDisabled() {
      return isDisabled;
    },
    get isReadOnly() {
      return isReadOnly;
    },
    get months() {
      return getMonths();
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
    get weekdayLabels() {
      return getWeekdayLabels(locale, cachedFirstDayOfWeek);
    },
    get headingLabel() {
      return getHeadingLabel();
    },
    isSelected,
    isRangeStart,
    isRangeEnd,
    isInRange,
    isDateUnavailable: isUnavailable,
    isDateDisabled,
    isOutsideVisibleRange,
    setFocusedValue,
    setHoveredValue,
    selectDate,
    goToNextPage,
    goToPreviousPage,
    handleCellKeydown,
    sync: syncExternal
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
