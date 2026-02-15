import { getContext, setContext } from 'svelte';
import type { DatePickerDateValue, DatePickerSegmentPart, DatePickerSegmentType } from './date-utils';
import type {
	PopoverChangeReason,
	PopoverOpenChangeDetails
} from '../../popover/root/context';

const KEY = Symbol('date-picker');

export type DatePickerOpenChangeReason = PopoverChangeReason;

export type DatePickerOpenChangeDetails = PopoverOpenChangeDetails;

export type DatePickerContext = {
	id: string;
	isDisabled: boolean;
	isReadOnly: boolean;
	open: boolean;
	focusVisible: boolean;
	focusWithin: boolean;
	activeSegment: Exclude<DatePickerSegmentType, 'literal'> | null;
	value: DatePickerDateValue | undefined;
	locale: string;
	triggerRef: HTMLElement | null;
	setTriggerRef: (element: HTMLElement | null) => void;
	setFocusVisible: (visible: boolean) => void;
	syncFocusWithin: () => void;
	setActiveSegment: (segment: Exclude<DatePickerSegmentType, 'literal'> | null) => void;
	openPopover: (reason?: DatePickerOpenChangeReason, event?: Event) => void;
	closePopover: (reason?: DatePickerOpenChangeReason, event?: Event) => void;
	togglePopover: (reason?: DatePickerOpenChangeReason, event?: Event) => void;
	onOpenChange: (open: boolean, details: DatePickerOpenChangeDetails) => void;
	setValue: (nextValue: DatePickerDateValue, source?: 'calendar' | 'input') => void;
	typeSegmentDigit: (type: Exclude<DatePickerSegmentType, 'literal'>, digit: string) => boolean;
	adjustSegmentValue: (type: Exclude<DatePickerSegmentType, 'literal'>, step: number) => void;
	isDateOutOfRange: (value: DatePickerDateValue) => boolean;
	isDateUnavailable: (value: DatePickerDateValue) => boolean;
	getSegments: () => DatePickerSegmentPart[];
	getSegmentValue: (type: Exclude<DatePickerSegmentType, 'literal'>) => string;
	setSegmentValue: (type: Exclude<DatePickerSegmentType, 'literal'>, nextValue: string) => void;
};

export function setDatePickerContext(context: DatePickerContext) {
	setContext(KEY, context);
}

export function getDatePickerContext(): DatePickerContext | undefined {
	return getContext<DatePickerContext | undefined>(KEY);
}

export function useDatePickerContext(): DatePickerContext {
	const context = getDatePickerContext();
	if (!context) {
		throw new Error('DatePicker components must be used within DatePicker.Root.');
	}
	return context;
}

export type { DatePickerSegmentPart, DatePickerSegmentType };
