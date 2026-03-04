import type {
	TimePickerDraft,
	TimePickerEditableSegmentType,
	TimePickerGranularity,
	TimePickerHourCycle,
	TimePickerTimeValue
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
	getCandidateFromPartial: (partial: Partial<TimePickerDraft>) => TimePickerTimeValue | null;
	isOutOfRange: (value: TimePickerTimeValue) => boolean;
}): WheelOption[] {
	const {
		type,
		hourCycle,
		hourStep,
		minuteStep,
		secondStep,
		hasRangeBounds,
		getCandidateFromPartial,
		isOutOfRange
	} = params;

	const options: WheelOption[] = [];

	if (type === 'dayPeriod') {
		for (const option of ['AM', 'PM']) {
			const disabled = hasRangeBounds
				? (() => {
						const candidate = getCandidateFromPartial({ dayPeriod: option });
						return candidate ? isOutOfRange(candidate) : false;
					})()
				: false;
			options.push({
				value: option,
				label: option,
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
			? (() => {
					const candidate = getCandidateFromPartial(
						type === 'hour'
							? { hour: valueString }
							: type === 'minute'
								? { minute: valueString }
								: { second: valueString }
					);
					return candidate ? isOutOfRange(candidate) : false;
				})()
			: false;

		options.push({
			value: valueString,
			label: String(current).padStart(2, '0'),
			disabled
		});
	}

	return options;
}
