import {
	getLocalizedDayPeriod,
	type TimePickerDraft,
	type TimePickerEditableSegmentType,
	type TimePickerGranularity,
	type TimePickerHourCycle,
	type TimePickerTimeValue
} from './time-utils';

export type WheelOption = {
	value: string;
	label: string;
	disabled: boolean;
};

export function buildWheelOptions(params: {
	type: TimePickerEditableSegmentType;
	granularity: TimePickerGranularity;
	hourCycle: TimePickerHourCycle;
	hourStep: number;
	minuteStep: number;
	secondStep: number;
	hasRangeBounds: boolean;
	/**
	 * Whether fixing this one segment leaves no in-range time at all. Receives the
	 * partial draft for the option; the caller decides how much freedom the
	 * remaining segments have (see `create-time-selection-state`).
	 */
	isPartialOutOfRange: (partial: Partial<TimePickerDraft>) => boolean;
	locale?: string;
}): WheelOption[] {
	const {
		type,
		hourCycle,
		hourStep,
		minuteStep,
		secondStep,
		hasRangeBounds,
		isPartialOutOfRange,
		locale
	} = params;

	const options: WheelOption[] = [];

	if (type === 'dayPeriod') {
		for (const option of ['AM', 'PM'] as const) {
			const disabled = hasRangeBounds ? isPartialOutOfRange({ dayPeriod: option }) : false;
			options.push({
				value: option,
				label: locale ? getLocalizedDayPeriod(locale, option) : option,
				disabled
			});
		}
		return options;
	}

	let min = 0;
	let max = 59;
	let step = 1;
	if (type === 'hour') {
		if (hourCycle === 12) {
			min = 1;
			max = 12;
		} else {
			min = 0;
			max = 23;
		}
		step = Math.max(1, hourStep);
	} else if (type === 'minute') {
		min = 0;
		max = 59;
		step = Math.max(1, minuteStep);
	} else if (type === 'second') {
		min = 0;
		max = 59;
		step = Math.max(1, secondStep);
	}

	for (let current = min; current <= max; current += step) {
		const valueString = String(current);
		const disabled = hasRangeBounds
			? isPartialOutOfRange(
					type === 'hour'
						? { hour: valueString }
						: type === 'minute'
							? { minute: valueString }
							: { second: valueString }
				)
			: false;

		options.push({
			value: valueString,
			label: String(current).padStart(2, '0'),
			disabled
		});
	}

	return options;
}
