export type TimePickerGranularity = 'hour' | 'minute' | 'second';
export type TimePickerHourCycle = 12 | 24;
export type TimePickerTimeValue = string;

export type TimePickerSegmentType = 'hour' | 'minute' | 'second' | 'dayPeriod' | 'literal';
export type TimePickerEditableSegmentType = Exclude<TimePickerSegmentType, 'literal'>;

export type TimePickerSegmentPart = {
  type: TimePickerSegmentType;
  text: string;
  isPlaceholder: boolean;
};

export type TimePickerDraft = {
  hour: string;
  minute: string;
  second: string;
  dayPeriod: string;
};

export type TimeParts = {
  hour: number;
  minute: number;
  second: number;
};

const timeValuePattern = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

export function createEmptyTimePickerDraft(): TimePickerDraft {
  return {
    hour: '',
    minute: '',
    second: '',
    dayPeriod: ''
  };
}

export function isValidTimePickerValue(value: unknown): value is TimePickerTimeValue {
  return typeof value === 'string' && timeValuePattern.test(value);
}

export function parseTimePickerValue(value: TimePickerTimeValue): TimeParts | null {
  if (!isValidTimePickerValue(value)) return null;
  const [hourPart, minutePart, secondPart] = value.split(':');
  return {
    hour: Number(hourPart),
    minute: Number(minutePart),
    second: Number(secondPart ?? '0')
  };
}

function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}

function formatDraftTwoDigits(value: string): string {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return value;
  return pad2(Math.trunc(numeric));
}

export function formatTimePickerValue(
  parts: TimeParts,
  granularity: TimePickerGranularity
): TimePickerTimeValue {
  const hour = pad2(parts.hour);
  if (granularity === 'hour') {
    return `${hour}:00`;
  }

  const minute = pad2(parts.minute);
  if (granularity === 'minute') {
    return `${hour}:${minute}`;
  }

  return `${hour}:${minute}:${pad2(parts.second)}`;
}

export function toDraftFromTimeValue(
  value: TimePickerTimeValue,
  hourCycle: TimePickerHourCycle
): TimePickerDraft {
  const parsed = parseTimePickerValue(value);
  if (!parsed) return createEmptyTimePickerDraft();

  if (hourCycle === 24) {
    return {
      hour: String(parsed.hour),
      minute: String(parsed.minute),
      second: String(parsed.second),
      dayPeriod: ''
    };
  }

  const isPm = parsed.hour >= 12;
  const hour12 = parsed.hour % 12 || 12;

  return {
    hour: String(hour12),
    minute: String(parsed.minute),
    second: String(parsed.second),
    dayPeriod: isPm ? 'PM' : 'AM'
  };
}

export function getRequiredSegments(
  granularity: TimePickerGranularity,
  hourCycle: TimePickerHourCycle
): TimePickerEditableSegmentType[] {
  const required: TimePickerEditableSegmentType[] = ['hour'];
  if (granularity !== 'hour') {
    required.push('minute');
  }
  if (granularity === 'second') {
    required.push('second');
  }
  if (hourCycle === 12) {
    required.push('dayPeriod');
  }
  return required;
}

export function normalizeSegmentNumberInput(value: string, maxDigits = 2): string {
  const digits = value.replace(/\D+/g, '').slice(0, maxDigits);
  if (!digits) return '';
  const numeric = Number(digits);
  if (!Number.isFinite(numeric)) return '';
  return String(numeric);
}

export function isSegmentValueEmpty(value: string | undefined): boolean {
  return !value || value.trim().length === 0;
}

export function buildTimePartsFromDraft(
  draft: TimePickerDraft,
  granularity: TimePickerGranularity,
  hourCycle: TimePickerHourCycle
): TimeParts | null {
  const hourRaw = draft.hour.trim();
  const minuteRaw = draft.minute.trim();
  const secondRaw = draft.second.trim();
  const dayPeriodRaw = draft.dayPeriod.trim().toUpperCase();

  if (!hourRaw) return null;
  if (granularity !== 'hour' && !minuteRaw) return null;
  if (granularity === 'second' && !secondRaw) return null;
  if (hourCycle === 12 && !dayPeriodRaw) return null;

  const hourNumeric = Number(hourRaw);
  if (!Number.isInteger(hourNumeric)) return null;

  let hour24 = hourNumeric;
  if (hourCycle === 12) {
    if (hourNumeric < 1 || hourNumeric > 12) return null;
    if (dayPeriodRaw !== 'AM' && dayPeriodRaw !== 'PM') return null;
    hour24 = hourNumeric % 12;
    if (dayPeriodRaw === 'PM') {
      hour24 += 12;
    }
  } else if (hourNumeric < 0 || hourNumeric > 23) {
    return null;
  }

  const minute = granularity === 'hour' ? 0 : Number(minuteRaw);
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) return null;

  const second = granularity === 'second' ? Number(secondRaw) : 0;
  if (!Number.isInteger(second) || second < 0 || second > 59) return null;

  return {
    hour: hour24,
    minute,
    second
  };
}

export function compareTimeParts(left: TimeParts, right: TimeParts): number {
  const leftTotal = left.hour * 3600 + left.minute * 60 + left.second;
  const rightTotal = right.hour * 3600 + right.minute * 60 + right.second;
  if (leftTotal < rightTotal) return -1;
  if (leftTotal > rightTotal) return 1;
  return 0;
}

function truncateToGranularity(parts: TimeParts, granularity: TimePickerGranularity): TimeParts {
  if (granularity === 'hour') return { hour: parts.hour, minute: 0, second: 0 };
  if (granularity === 'minute') return { hour: parts.hour, minute: parts.minute, second: 0 };
  return parts;
}

export function isTimeOutOfRange(
  value: TimePickerTimeValue,
  minValue: TimePickerTimeValue | undefined,
  maxValue: TimePickerTimeValue | undefined,
  granularity: TimePickerGranularity = 'second'
): boolean {
  const currentRaw = parseTimePickerValue(value);
  if (!currentRaw) return true;
  const current = truncateToGranularity(currentRaw, granularity);

  if (minValue) {
    const minRaw = parseTimePickerValue(minValue);
    if (minRaw) {
      const min = truncateToGranularity(minRaw, granularity);
      if (compareTimeParts(current, min) < 0) return true;
    }
  }

  if (maxValue) {
    const maxRaw = parseTimePickerValue(maxValue);
    if (maxRaw) {
      const max = truncateToGranularity(maxRaw, granularity);
      if (compareTimeParts(current, max) > 0) return true;
    }
  }

  if (minValue && maxValue) {
    const minRaw = parseTimePickerValue(minValue);
    const maxRaw = parseTimePickerValue(maxValue);
    if (minRaw && maxRaw) {
      const min = truncateToGranularity(minRaw, granularity);
      const max = truncateToGranularity(maxRaw, granularity);
      if (compareTimeParts(min, max) > 0) return true;
    }
  }

  return false;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampToStep(value: number, step: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  const safeStep = Number.isFinite(step) && step > 0 ? step : 1;
  const clamped = clamp(value, min, max);
  const stepped = Math.round(clamped / safeStep) * safeStep;
  return clamp(stepped, min, max);
}

function wrapCircular(value: number, min: number, max: number): number {
  const range = max - min + 1;
  if (range <= 0) return min;
  let normalized = (value - min) % range;
  if (normalized < 0) normalized += range;
  return normalized + min;
}

export function adjustSegmentWithStep(
  currentValue: string,
  type: Exclude<TimePickerSegmentType, 'literal' | 'dayPeriod'>,
  delta: number,
  options: {
    hourCycle: TimePickerHourCycle;
    hourStep: number;
    minuteStep: number;
    secondStep: number;
  }
): string {
  let min = 0;
  let max = 59;
  let step = 1;

  if (type === 'hour') {
    if (options.hourCycle === 12) {
      min = 1;
      max = 12;
    } else {
      min = 0;
      max = 23;
    }
    step = Math.max(1, options.hourStep);
  }
  if (type === 'minute') {
    min = 0;
    max = 59;
    step = Math.max(1, options.minuteStep);
  }
  if (type === 'second') {
    min = 0;
    max = 59;
    step = Math.max(1, options.secondStep);
  }

  const current = Number(currentValue || String(min));
  const base = Number.isFinite(current) ? current : min;
  const next = wrapCircular(base + step * delta, min, max);
  return String(next);
}

export function buildTimePickerSegments(params: {
  locale: string;
  hourCycle: TimePickerHourCycle;
  granularity: TimePickerGranularity;
  draft: TimePickerDraft;
}): TimePickerSegmentPart[] {
  const { locale, hourCycle, granularity, draft } = params;
  const formatOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: granularity !== 'hour' ? '2-digit' : undefined,
    second: granularity === 'second' ? '2-digit' : undefined,
    hourCycle: hourCycle === 12 ? 'h12' : 'h23',
    timeZone: 'UTC'
  };

  const sampleDate = new Date(Date.UTC(2024, 0, 1, 14, 30, 45));
  const formatter = new Intl.DateTimeFormat(locale, formatOptions);
  const parts = formatter.formatToParts(sampleDate);

  return parts
    .map((part): TimePickerSegmentPart | null => {
      if (part.type === 'literal') {
        return {
          type: 'literal',
          text: part.value,
          isPlaceholder: false
        };
      }

      if (part.type === 'hour') {
        const isPlaceholder = isSegmentValueEmpty(draft.hour);
        return {
          type: 'hour',
          text: isPlaceholder ? (hourCycle === 12 ? 'hh' : 'HH') : draft.hour,
          isPlaceholder
        };
      }

      if (part.type === 'minute' && granularity !== 'hour') {
        const isPlaceholder = isSegmentValueEmpty(draft.minute);
        return {
          type: 'minute',
          text: isPlaceholder ? 'mm' : formatDraftTwoDigits(draft.minute),
          isPlaceholder
        };
      }

      if (part.type === 'second' && granularity === 'second') {
        const isPlaceholder = isSegmentValueEmpty(draft.second);
        return {
          type: 'second',
          text: isPlaceholder ? 'ss' : formatDraftTwoDigits(draft.second),
          isPlaceholder
        };
      }

      if (part.type === 'dayPeriod' && hourCycle === 12) {
        const isPlaceholder = isSegmentValueEmpty(draft.dayPeriod);
        return {
          type: 'dayPeriod',
          text: isPlaceholder ? 'AM' : draft.dayPeriod,
          isPlaceholder
        };
      }

      return null;
    })
    .filter((part): part is TimePickerSegmentPart => part !== null);
}

export function getEditableSegmentOrder(
  segments: TimePickerSegmentPart[]
): TimePickerEditableSegmentType[] {
  return segments
    .filter((segment) => segment.type !== 'literal')
    .map((segment) => segment.type as TimePickerEditableSegmentType);
}

export function getSegmentLabel(type: TimePickerEditableSegmentType, locale: string): string {
  if (type === 'dayPeriod') {
    return locale.toLowerCase().startsWith('es') ? 'Período del día' : 'Day period';
  }

  try {
    const displayNames = new Intl.DisplayNames([locale], { type: 'dateTimeField' });
    return displayNames.of(type) ?? type;
  } catch {
    if (type === 'hour') return 'Hour';
    if (type === 'minute') return 'Minute';
    if (type === 'second') return 'Second';
    return 'Day period';
  }
}
