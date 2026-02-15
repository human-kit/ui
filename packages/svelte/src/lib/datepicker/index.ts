export * as DatePicker from './index.parts.ts';

export { default as DatePickerRoot } from './root/date-picker-root.svelte';
export { default as DatePickerInput } from './input/date-picker-input.svelte';
export { default as DatePickerSegment } from './segment/date-picker-segment.svelte';
export { default as DatePickerTrigger } from './trigger/date-picker-trigger.svelte';
export { default as DatePickerPopover } from './popover/date-picker-popover.svelte';
export { default as DatePickerCalendar } from './calendar/date-picker-calendar.svelte';

export {
	getDatePickerContext,
	setDatePickerContext,
	useDatePickerContext,
	type DatePickerContext,
	type DatePickerSegmentPart,
	type DatePickerSegmentType
} from './root/context.ts';

import * as DatePickerParts from './index.parts.ts';
export default DatePickerParts;
