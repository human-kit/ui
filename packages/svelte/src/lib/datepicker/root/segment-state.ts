import {
  isValidDatePickerValue,
  type DatePickerDateValue,
  type DatePickerSegmentType
} from './date-utils';

export type EditableSegmentType = Exclude<DatePickerSegmentType, 'literal'>;

export type DatePickerSegmentDraft = {
  day: string;
  month: string;
  year: string;
};

export function toDraftFromValue(nextValue: DatePickerDateValue): DatePickerSegmentDraft {
  const [year, month, day] = nextValue.split('-');
  return {
    day: `${Number(day)}`,
    month: `${Number(month)}`,
    year: `${Number(year)}`
  };
}

export function normalizeSegmentInput(type: EditableSegmentType, rawValue: string): string {
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

export function clampSegmentDraft(
  draft: DatePickerSegmentDraft,
  type: EditableSegmentType,
  fromTyping: boolean,
  rawNumericLength: number
): DatePickerSegmentDraft {
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

export function getCandidateValueFromDraft(draft: DatePickerSegmentDraft): DatePickerDateValue | null {
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

export function getSegmentBounds(type: EditableSegmentType): { min: number; max: number } {
  if (type === 'month') return { min: 1, max: 12 };
  if (type === 'day') return { min: 1, max: 31 };
  return { min: 1, max: 9999 };
}

export function getSegmentNumericValue(
  type: EditableSegmentType,
  draft: DatePickerSegmentDraft,
  valueInternal: DatePickerDateValue | undefined
): number {
  const draftValue = draft[type];
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

  if (type === 'year') return new Date().getUTCFullYear();
  return 1;
}

export function clampSegment(type: EditableSegmentType, valueToClamp: number): number {
  const { min, max } = getSegmentBounds(type);
  return Math.min(max, Math.max(min, valueToClamp));
}
