export * as DatePicker from './index.parts.ts';

export { default as DatePickerRoot } from './root/date-picker-root.svelte';
export { default as DatePickerInput } from './input/date-picker-input.svelte';
export { default as DatePickerSegment } from './segment/date-picker-segment.svelte';
export { default as DatePickerTrigger } from './trigger/date-picker-trigger.svelte';
export { default as DatePickerPopover } from './popover/date-picker-popover.svelte';
export { default as DatePickerCalendar } from './calendar/date-picker-calendar.svelte';
export { default as DatePickerTriggerPrevious } from '../calendar/trigger-previous/calendar-trigger-previous.svelte';
export { default as DatePickerHeading } from '../calendar/heading/calendar-heading.svelte';
export { default as DatePickerTriggerNext } from '../calendar/trigger-next/calendar-trigger-next.svelte';
export { default as DatePickerGrid } from '../calendar/grid/calendar-grid.svelte';
export { default as DatePickerGridHeader } from '../calendar/grid-header/calendar-grid-header.svelte';
export { default as DatePickerHeaderCell } from '../calendar/header-cell/calendar-header-cell.svelte';
export { default as DatePickerGridBody } from '../calendar/grid-body/calendar-grid-body.svelte';
export { default as DatePickerBodyCell } from '../calendar/body-cell/calendar-body-cell.svelte';

export {
	getDatePickerContext,
	setDatePickerContext,
	useDatePickerContext,
	type DatePickerContext,
	type DatePickerOpenChangeDetails,
	type DatePickerOpenChangeReason,
	type DatePickerSegmentPart,
	type DatePickerSegmentType
} from './root/context.ts';

import * as DatePickerParts from './index.parts.ts';
export default DatePickerParts;
