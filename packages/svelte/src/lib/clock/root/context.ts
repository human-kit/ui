import { getContext, setContext } from 'svelte';
import type {
	TimePickerEditableSegmentType,
	TimePickerGranularity,
	TimePickerHourCycle
} from './time-utils';

const KEY = Symbol('clock');

export type ClockContext = {
	id: string;
	locale: string;
	isDisabled: boolean;
	granularity: TimePickerGranularity;
	hourCycle: TimePickerHourCycle;
	/** Whether the clock is visible and should align scroll positions. */
	open: boolean;
	selectWheelValue: (type: TimePickerEditableSegmentType, value: string) => void;
	getSelectedWheelValue: (type: TimePickerEditableSegmentType) => string | null;
	getWheelOptions: (
		type: TimePickerEditableSegmentType
	) => Array<{ value: string; label: string; disabled: boolean }>;
	getSegmentLabel: (type: TimePickerEditableSegmentType) => string;
};

export function setClockContext(context: ClockContext) {
	setContext(KEY, context);
}

export function getClockContext(): ClockContext | undefined {
	return getContext<ClockContext | undefined>(KEY);
}

export function useClockContext(): ClockContext {
	const context = getClockContext();
	if (!context) {
		throw new Error('Clock components must be used within Clock.Root.');
	}
	return context;
}

export type { TimePickerEditableSegmentType as ClockEditableSegmentType };
