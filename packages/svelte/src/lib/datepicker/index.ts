import type { ComponentProps } from 'svelte';
import type DatePickerBodyCellComponent from '../calendar/body-cell/calendar-body-cell.svelte';
import type DatePickerGridBodyComponent from '../calendar/grid-body/calendar-grid-body.svelte';
import type DatePickerGridHeaderComponent from '../calendar/grid-header/calendar-grid-header.svelte';
import type DatePickerGridComponent from '../calendar/grid/calendar-grid.svelte';
import type DatePickerHeadingComponent from '../calendar/heading/calendar-heading.svelte';
import type DatePickerHeaderCellComponent from '../calendar/header-cell/calendar-header-cell.svelte';
import type DatePickerTriggerNextComponent from '../calendar/trigger-next/calendar-trigger-next.svelte';
import type DatePickerTriggerPreviousComponent from '../calendar/trigger-previous/calendar-trigger-previous.svelte';
import type DatePickerCalendarComponent from './calendar/date-picker-calendar.svelte';
import type DatePickerInputComponent from './input/date-picker-input.svelte';
import type DatePickerPopoverComponent from './popover/date-picker-popover.svelte';
import type DatePickerRootComponent from './root/date-picker-root.svelte';
import type DatePickerSegmentComponent from './segment/date-picker-segment.svelte';
import type DatePickerTriggerComponent from './trigger/date-picker-trigger.svelte';

export * as DatePicker from './index.parts.js';

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
export type DatePickerRootProps = ComponentProps<typeof DatePickerRootComponent>;
export type DatePickerInputProps = ComponentProps<typeof DatePickerInputComponent>;
export type DatePickerSegmentProps = ComponentProps<typeof DatePickerSegmentComponent>;
export type DatePickerTriggerProps = ComponentProps<typeof DatePickerTriggerComponent>;
export type DatePickerPopoverProps = ComponentProps<typeof DatePickerPopoverComponent>;
export type DatePickerCalendarProps = ComponentProps<typeof DatePickerCalendarComponent>;
export type DatePickerTriggerPreviousProps = ComponentProps<
	typeof DatePickerTriggerPreviousComponent
>;
export type DatePickerHeadingProps = ComponentProps<typeof DatePickerHeadingComponent>;
export type DatePickerTriggerNextProps = ComponentProps<typeof DatePickerTriggerNextComponent>;
export type DatePickerGridProps = ComponentProps<typeof DatePickerGridComponent>;
export type DatePickerGridHeaderProps = ComponentProps<typeof DatePickerGridHeaderComponent>;
export type DatePickerHeaderCellProps = ComponentProps<typeof DatePickerHeaderCellComponent>;
export type DatePickerGridBodyProps = ComponentProps<typeof DatePickerGridBodyComponent>;
export type DatePickerBodyCellProps = ComponentProps<typeof DatePickerBodyCellComponent>;

export {
	getDatePickerContext,
	setDatePickerContext,
	useDatePickerContext,
	type DatePickerContext,
	type DatePickerOpenChangeDetails,
	type DatePickerOpenChangeReason,
	type DatePickerSegmentPart,
	type DatePickerSegmentType
} from './root/context.js';

import * as DatePickerParts from './index.parts.js';
export default DatePickerParts;
