import type { ClockEditableSegmentType } from './context';
import type { TimePickerGranularity, TimePickerHourCycle } from './time-utils';

export type ClockColumnInfo = {
	type: ClockEditableSegmentType;
	label?: string;
};

export function resolveVisibleColumns(
	granularity: TimePickerGranularity,
	hourCycle: TimePickerHourCycle,
	getSegmentLabel?: (type: ClockEditableSegmentType) => string
): ClockColumnInfo[] {
	const columns: ClockEditableSegmentType[] = ['hour'];

	if (granularity !== 'hour') {
		columns.push('minute');
	}

	if (granularity === 'second') {
		columns.push('second');
	}

	if (hourCycle === 12) {
		columns.push('dayPeriod');
	}

	return columns.map((type) => ({
		type,
		label: getSegmentLabel?.(type)
	}));
}
