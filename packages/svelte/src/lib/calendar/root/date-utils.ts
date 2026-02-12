export type CalendarDateValue = string;

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidCalendarDateValue(value: string): boolean {
  const match = DATE_RE.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) return false;

  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function parseCalendarDate(value: CalendarDateValue): Date | null {
  if (!isValidCalendarDateValue(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatCalendarDate(date: Date): CalendarDateValue {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function getDaysInMonthUtc(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

export function addMonths(date: Date, amount: number): Date {
  const targetMonth = date.getUTCMonth() + amount;
  const targetYear = date.getUTCFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const targetDay = Math.min(date.getUTCDate(), getDaysInMonthUtc(targetYear, normalizedMonth));
  return new Date(Date.UTC(targetYear, normalizedMonth, targetDay));
}

export function addDays(date: Date, amount: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + amount));
}

export function compareDates(a: Date, b: Date): number {
  const at = a.getTime();
  const bt = b.getTime();
  if (at < bt) return -1;
  if (at > bt) return 1;
  return 0;
}

export function getTodayUtcDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function getFirstDayOfWeek(locale: string): number {
  try {
    const intlLocale = new Intl.Locale(locale);
    const weekInfo = (intlLocale as Intl.Locale & { weekInfo?: { firstDay?: number } }).weekInfo;
    if (weekInfo?.firstDay) {
      return weekInfo.firstDay % 7;
    }
  } catch {
    // ignore and fallback to sunday
  }
  return 0;
}

export function getWeekdayLabels(locale: string, firstDayOfWeek: number): string[] {
  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    timeZone: 'UTC'
  });

  const sunday = new Date(Date.UTC(2024, 0, 7));

  return Array.from({ length: 7 }, (_, index) => {
    const dayOffset = (firstDayOfWeek + index) % 7;
    return formatter.format(addDays(sunday, dayOffset));
  });
}

export type CalendarDayCell = {
  date: CalendarDateValue;
  isOutsideMonth: boolean;
};

export function buildMonthGrid(monthStart: Date, firstDayOfWeek: number): CalendarDayCell[][] {
  const firstOfMonth = startOfMonth(monthStart);
  const firstWeekday = firstOfMonth.getUTCDay();
  const startOffset = (firstWeekday - firstDayOfWeek + 7) % 7;
  const gridStart = addDays(firstOfMonth, -startOffset);

  const weeks: CalendarDayCell[][] = [];
  for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
    const week: CalendarDayCell[] = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const date = addDays(gridStart, weekIndex * 7 + dayIndex);
      week.push({
        date: formatCalendarDate(date),
        isOutsideMonth: date.getUTCMonth() !== firstOfMonth.getUTCMonth()
      });
    }
    weeks.push(week);
  }

  return weeks;
}

export function formatMonthHeading(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}
