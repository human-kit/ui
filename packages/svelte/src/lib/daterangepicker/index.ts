import type { ComponentProps } from 'svelte';
import type DateRangePickerBodyCellComponent from '../calendar/body-cell/calendar-body-cell.svelte';
import type DateRangePickerGridBodyComponent from '../calendar/grid-body/calendar-grid-body.svelte';
import type DateRangePickerGridHeaderComponent from '../calendar/grid-header/calendar-grid-header.svelte';
import type DateRangePickerGridComponent from '../calendar/grid/calendar-grid.svelte';
import type DateRangePickerHeadingComponent from '../calendar/heading/calendar-heading.svelte';
import type DateRangePickerHeaderCellComponent from '../calendar/header-cell/calendar-header-cell.svelte';
import type DateRangePickerTriggerNextComponent from '../calendar/trigger-next/calendar-trigger-next.svelte';
import type DateRangePickerTriggerPreviousComponent from '../calendar/trigger-previous/calendar-trigger-previous.svelte';
import type DateRangePickerCalendarComponent from './calendar/date-range-picker-calendar.svelte';
import type DateRangePickerInputComponent from './input/date-range-picker-input.svelte';
import type DateRangePickerPopoverComponent from './popover/date-range-picker-popover.svelte';
import type DateRangePickerRootComponent from './root/date-range-picker-root.svelte';
import type DateRangePickerSegmentComponent from './segment/date-range-picker-segment.svelte';
import type DateRangePickerTriggerComponent from './trigger/date-range-picker-trigger.svelte';

export * as DateRangePicker from './index.parts.js';

export { default as DateRangePickerRoot } from './root/date-range-picker-root.svelte';
export { default as DateRangePickerInput } from './input/date-range-picker-input.svelte';
export { default as DateRangePickerSegment } from './segment/date-range-picker-segment.svelte';
export { default as DateRangePickerTrigger } from './trigger/date-range-picker-trigger.svelte';
export { default as DateRangePickerPopover } from './popover/date-range-picker-popover.svelte';
export { default as DateRangePickerCalendar } from './calendar/date-range-picker-calendar.svelte';
export { default as DateRangePickerTriggerPrevious } from '../calendar/trigger-previous/calendar-trigger-previous.svelte';
export { default as DateRangePickerHeading } from '../calendar/heading/calendar-heading.svelte';
export { default as DateRangePickerTriggerNext } from '../calendar/trigger-next/calendar-trigger-next.svelte';
export { default as DateRangePickerGrid } from '../calendar/grid/calendar-grid.svelte';
export { default as DateRangePickerGridHeader } from '../calendar/grid-header/calendar-grid-header.svelte';
export { default as DateRangePickerHeaderCell } from '../calendar/header-cell/calendar-header-cell.svelte';
export { default as DateRangePickerGridBody } from '../calendar/grid-body/calendar-grid-body.svelte';
export { default as DateRangePickerBodyCell } from '../calendar/body-cell/calendar-body-cell.svelte';

export type DateRangePickerRootProps = ComponentProps<typeof DateRangePickerRootComponent>;
export type DateRangePickerInputProps = ComponentProps<typeof DateRangePickerInputComponent>;
export type DateRangePickerSegmentProps = ComponentProps<typeof DateRangePickerSegmentComponent>;
export type DateRangePickerTriggerProps = ComponentProps<typeof DateRangePickerTriggerComponent>;
export type DateRangePickerPopoverProps = ComponentProps<typeof DateRangePickerPopoverComponent>;
export type DateRangePickerCalendarProps = ComponentProps<typeof DateRangePickerCalendarComponent>;
export type DateRangePickerTriggerPreviousProps = ComponentProps<
	typeof DateRangePickerTriggerPreviousComponent
>;
export type DateRangePickerHeadingProps = ComponentProps<typeof DateRangePickerHeadingComponent>;
export type DateRangePickerTriggerNextProps = ComponentProps<
	typeof DateRangePickerTriggerNextComponent
>;
export type DateRangePickerGridProps = ComponentProps<typeof DateRangePickerGridComponent>;
export type DateRangePickerGridHeaderProps = ComponentProps<
	typeof DateRangePickerGridHeaderComponent
>;
export type DateRangePickerHeaderCellProps = ComponentProps<
	typeof DateRangePickerHeaderCellComponent
>;
export type DateRangePickerGridBodyProps = ComponentProps<typeof DateRangePickerGridBodyComponent>;
export type DateRangePickerBodyCellProps = ComponentProps<typeof DateRangePickerBodyCellComponent>;

export {
	getDateRangePickerContext,
	setDateRangePickerContext,
	useDateRangePickerContext,
	type DateRangePickerActiveSegment,
	type DateRangePickerContext,
	type DateRangePickerOpenChangeDetails,
	type DateRangePickerOpenChangeReason,
	type DateRangePickerRangePart,
	type DateRangePickerRangeValue,
	type DatePickerSegmentPart,
	type DatePickerSegmentType
} from './root/context';

import * as DateRangePickerParts from './index.parts.js';
export default DateRangePickerParts;
