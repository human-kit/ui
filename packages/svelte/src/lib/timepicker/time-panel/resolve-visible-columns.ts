import type { TimePickerEditableSegmentType } from '../root/context';
import type { TimePickerGranularity, TimePickerHourCycle } from '../root/time-utils';

export type TimePanelColumnInfo = {
	type: TimePickerEditableSegmentType;
	label?: string;
};

export function resolveVisibleColumns(
	granularity: TimePickerGranularity,
	hourCycle: TimePickerHourCycle,
	getSegmentLabel?: (type: TimePickerEditableSegmentType) => string
): TimePanelColumnInfo[] {
	const columns: TimePickerEditableSegmentType[] = ['hour'];

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
