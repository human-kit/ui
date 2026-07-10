import { getContext, setContext } from 'svelte';
import type {
	DatePickerDateValue,
	DatePickerEditableSegmentType,
	DatePickerSegmentPart,
	DatePickerSegmentType
} from '../../datepicker/root/date-utils';
import type { PopoverChangeReason, PopoverOpenChangeDetails } from '../../popover/root/context';

const KEY = Symbol('date-range-picker');

export type DateRangePickerOpenChangeReason = PopoverChangeReason;

export type DateRangePickerOpenChangeDetails = PopoverOpenChangeDetails;

export type DateRangePickerRangePart = 'start' | 'end';

export type DateRangePickerRangeValue = {
	start: DatePickerDateValue;
	end: DatePickerDateValue;
};

export type DateRangePickerActiveSegment = {
	part: DateRangePickerRangePart;
	type: Exclude<DatePickerSegmentType, 'literal'>;
};

export type DateRangePickerContext = {
	id: string;
	isDisabled: boolean;
	isReadOnly: boolean;
	open: boolean;
	focusVisible: boolean;
	focusWithin: boolean;
	isInvalidDraft: boolean;
	isPartInvalid: (part: DateRangePickerRangePart) => boolean;
	activeSegment: DateRangePickerActiveSegment | null;
	value: DateRangePickerRangeValue | null;
	locale: string;
	triggerRef: HTMLElement | null;
	setTriggerRef: (element: HTMLElement | null) => void;
	setFocusVisible: (visible: boolean) => void;
	syncFocusWithin: () => void;
	setActiveSegment: (
		part: DateRangePickerRangePart,
		segment: Exclude<DatePickerSegmentType, 'literal'> | null
	) => void;
	openPopover: (reason?: DateRangePickerOpenChangeReason, event?: Event) => void;
	closePopover: (reason?: DateRangePickerOpenChangeReason, event?: Event) => void;
	togglePopover: (reason?: DateRangePickerOpenChangeReason, event?: Event) => void;
	onOpenChange: (open: boolean, details: DateRangePickerOpenChangeDetails) => void;
	setValue: (nextValue: DateRangePickerRangeValue, source?: 'calendar' | 'input') => void;
	typeSegmentDigit: (
		part: DateRangePickerRangePart,
		type: Exclude<DatePickerSegmentType, 'literal'>,
		digit: string
	) => boolean;
	adjustSegmentValue: (
		part: DateRangePickerRangePart,
		type: Exclude<DatePickerSegmentType, 'literal'>,
		step: number
	) => void;
	isDateOutOfRange: (value: DatePickerDateValue) => boolean;
	isDateUnavailable: (value: DatePickerDateValue) => boolean;
	getSegments: (part: DateRangePickerRangePart) => DatePickerSegmentPart[];
	getSegmentValue: (
		part: DateRangePickerRangePart,
		type: Exclude<DatePickerSegmentType, 'literal'>
	) => string;
	setSegmentValue: (
		part: DateRangePickerRangePart,
		type: Exclude<DatePickerSegmentType, 'literal'>,
		nextValue: string
	) => void;
	getSegmentValueMax: (
		part: DateRangePickerRangePart,
		type: Exclude<DatePickerSegmentType, 'literal'>
	) => number;
	getSegmentLabel: (type: DatePickerEditableSegmentType) => string;
	registerSegmentRef: (
		part: DateRangePickerRangePart,
		type: DatePickerEditableSegmentType,
		element: HTMLElement | null
	) => void;
	focusNextPlaceholderOrLastSegment: (part: DateRangePickerRangePart) => boolean;
	focusNextSegment: (
		part: DateRangePickerRangePart,
		type: DatePickerEditableSegmentType
	) => boolean;
	focusPreviousSegment: (
		part: DateRangePickerRangePart,
		type: DatePickerEditableSegmentType
	) => boolean;
	focusLastSegment: (part?: DateRangePickerRangePart) => boolean;
};

export function setDateRangePickerContext(context: DateRangePickerContext) {
	setContext(KEY, context);
}

export function getDateRangePickerContext(): DateRangePickerContext | undefined {
	return getContext<DateRangePickerContext | undefined>(KEY);
}

export function useDateRangePickerContext(): DateRangePickerContext {
	const context = getDateRangePickerContext();
	if (!context) {
		throw new Error('DateRangePicker components must be used within DateRangePicker.Root.');
	}
	return context;
}

export type { DatePickerSegmentPart, DatePickerSegmentType };
