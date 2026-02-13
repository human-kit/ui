export * as Calendar from './index.parts.ts';

export { default as CalendarRoot } from './root/calendar-root.svelte';
export { default as CalendarTriggerPrevious } from './trigger-previous/calendar-trigger-previous.svelte';
export { default as CalendarHeading } from './heading/calendar-heading.svelte';
export { default as CalendarTriggerNext } from './trigger-next/calendar-trigger-next.svelte';
export { default as CalendarGrid } from './grid/calendar-grid.svelte';
export { default as CalendarGridHeader } from './grid-header/calendar-grid-header.svelte';
export { default as CalendarHeaderCell } from './header-cell/calendar-header-cell.svelte';
export { default as CalendarGridBody } from './grid-body/calendar-grid-body.svelte';
export { default as CalendarBodyCell } from './body-cell/calendar-body-cell.svelte';

export {
	getCalendarContext,
	setCalendarContext,
	useCalendarContext,
	createCalendarContext,
	type CalendarContext,
	type CalendarMonth,
	type CalendarSelectionMode,
	type CalendarRangeValue,
	type CalendarValueBySelectionMode,
	type CalendarValue,
	type CreateCalendarContextOptions
} from './root/context';

import * as CalendarParts from './index.parts.ts';
export default CalendarParts;
