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

export type CalendarMonth = {
  monthIndex: number;
  monthStart: Date;
  heading: string;
  weeks: CalendarDayCell[][];
};

export type CreateCalendarContextOptions = {
  visibleMonths?: number;
  locale?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  value?: CalendarDateValue;
  defaultValue?: CalendarDateValue;
  isDateUnavailable?: (date: CalendarDateValue) => boolean;
  onChange?: (value: CalendarDateValue) => void;
};

export type CalendarContext = {
  layoutVersion: Readable<number>;
  selectionVersion: Readable<number>;
  locale: string;
  firstDayOfWeek: number;
  visibleMonths: number;
  isDisabled: boolean;
  isReadOnly: boolean;
  months: CalendarMonth[];
  selectedValue: CalendarDateValue | undefined;
  focusedValue: CalendarDateValue;
  weekdayLabels: string[];
  headingLabel: string;
  isSelected: (date: CalendarDateValue) => boolean;
  isDateUnavailable: (date: CalendarDateValue) => boolean;
  isDateDisabled: (date: CalendarDateValue) => boolean;
  isOutsideVisibleRange: (date: CalendarDateValue, monthIndex: number) => boolean;
  setFocusedValue: (date: CalendarDateValue) => void;
  selectDate: (date: CalendarDateValue) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  handleCellKeydown: (event: KeyboardEvent, date: CalendarDateValue) => void;
  sync: (next: CreateCalendarContextOptions) => void;
};

export function createCalendarContext(options: CreateCalendarContextOptions): CalendarContext {
  let {
    visibleMonths = 1,
    locale = Intl.DateTimeFormat().resolvedOptions().locale,
    isDisabled = false,
    isReadOnly = false,
    isDateUnavailable,
    onChange
  } = options;

  const { value, defaultValue } = options;

  const fallbackToday = formatCalendarDate(getTodayUtcDate());
  const initialSelected = isValidCalendarDateValue(value ?? '')
    ? value
    : isValidCalendarDateValue(defaultValue ?? '')
      ? defaultValue
      : undefined;

  let currentSelected = initialSelected;
  let currentFocused = initialSelected ?? fallbackToday;
  let currentVisibleMonth = startOfMonth(parseCalendarDate(currentFocused) ?? getTodayUtcDate());
  let cachedMonths: CalendarMonth[] = [];
  let hasCachedMonths = false;
  let unavailableCache = new Map<CalendarDateValue, boolean>();
  let previousUnavailableFn = isDateUnavailable;
  let previousVisibleMonths = visibleMonths;
  let previousLocale = locale;
  let cachedFirstDayOfWeek = getFirstDayOfWeek(locale);
  const layoutVersion = writable(0);
  const selectionVersion = writable(0);

  function clearUnavailableCache() {
    unavailableCache = new Map();
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

    if (nextValue !== undefined) {
      if (isValidCalendarDateValue(nextValue)) {
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
    } else if (!currentSelected && nextDefaultValue && isValidCalendarDateValue(nextDefaultValue)) {
      currentSelected = nextDefaultValue;
      currentFocused = nextDefaultValue;
      currentVisibleMonth = startOfMonth(
        parseCalendarDate(nextDefaultValue) ?? currentVisibleMonth
      );
      shouldNotifySelection = true;
      shouldNotifyLayout = true;
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

    const firstDayOfWeek = getFirstDayOfWeek(locale);
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
    return currentSelected === date;
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
    return isDisabled || isUnavailable(date);
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

  function selectDate(date: CalendarDateValue) {
    if (!isValidCalendarDateValue(date)) return;
    if (isDisabled || isReadOnly || isUnavailable(date)) return;
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

  function moveFocusByDays(baseDate: CalendarDateValue, amount: number) {
    const parsed = parseCalendarDate(baseDate);
    if (!parsed) return;
    const next = addDays(parsed, amount);
    const nextValue = formatCalendarDate(next);
    const focusableValue = findFocusableDate(nextValue, amount);
    if (!focusableValue) return;
    setFocusedValue(focusableValue);
  }

  function moveFocusByMonths(baseDate: CalendarDateValue, amount: number) {
    const parsed = parseCalendarDate(baseDate);
    if (!parsed) return;
    const next = addMonths(parsed, amount);
    const nextValue = formatCalendarDate(next);
    const dayStep = amount >= 0 ? 1 : -1;
    const focusableValue = findFocusableDate(nextValue, dayStep);
    if (!focusableValue) return;
    setFocusedValue(focusableValue);
  }

  function moveToMonthEdge(baseDate: CalendarDateValue, edge: 'start' | 'end') {
    const parsed = parseCalendarDate(baseDate);
    if (!parsed) return;

    const monthStart = startOfMonth(parsed);
    const monthEnd = addDays(addMonths(monthStart, 1), -1);
    const targetDate = edge === 'start' ? monthStart : monthEnd;
    const nextValue = formatCalendarDate(targetDate);
    const dayStep = edge === 'start' ? 1 : -1;
    const focusableValue = findFocusableDate(nextValue, dayStep);
    if (!focusableValue) return;
    setFocusedValue(focusableValue);
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

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        moveFocusByDays(keyDate, 1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        moveFocusByDays(keyDate, -1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveFocusByDays(keyDate, 7);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveFocusByDays(keyDate, -7);
        break;
      case 'Home':
        event.preventDefault();
        moveToMonthEdge(keyDate, 'start');
        break;
      case 'End':
        event.preventDefault();
        moveToMonthEdge(keyDate, 'end');
        break;
      case 'PageUp':
        event.preventDefault();
        moveFocusByMonths(keyDate, -1);
        break;
      case 'PageDown':
        event.preventDefault();
        moveFocusByMonths(keyDate, 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        selectDate(keyDate);
        break;
    }
  }

  const context: CalendarContext = {
    layoutVersion,
    selectionVersion,
    get locale() {
      return locale;
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
    isDateUnavailable: isUnavailable,
    isDateDisabled,
    isOutsideVisibleRange,
    setFocusedValue,
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
