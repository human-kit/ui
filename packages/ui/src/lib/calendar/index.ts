import type { ComponentProps } from 'svelte';
import type CalendarBodyCellComponent from './body-cell/calendar-body-cell.svelte';
import type CalendarGridBodyComponent from './grid-body/calendar-grid-body.svelte';
import type CalendarGridHeaderComponent from './grid-header/calendar-grid-header.svelte';
import type CalendarGridComponent from './grid/calendar-grid.svelte';
import type CalendarHeadingComponent from './heading/calendar-heading.svelte';
import type CalendarHeaderCellComponent from './header-cell/calendar-header-cell.svelte';
import type CalendarRootComponent from './root/calendar-root.svelte';
import type CalendarTriggerNextComponent from './trigger-next/calendar-trigger-next.svelte';
import type CalendarTriggerPreviousComponent from './trigger-previous/calendar-trigger-previous.svelte';

export * as Calendar from './index.parts.js';

export { default as CalendarRoot } from './root/calendar-root.svelte';
export { default as CalendarTriggerPrevious } from './trigger-previous/calendar-trigger-previous.svelte';
export { default as CalendarHeading } from './heading/calendar-heading.svelte';
export { default as CalendarTriggerNext } from './trigger-next/calendar-trigger-next.svelte';
export { default as CalendarGrid } from './grid/calendar-grid.svelte';
export { default as CalendarGridHeader } from './grid-header/calendar-grid-header.svelte';
export { default as CalendarHeaderCell } from './header-cell/calendar-header-cell.svelte';
export { default as CalendarGridBody } from './grid-body/calendar-grid-body.svelte';
export { default as CalendarBodyCell } from './body-cell/calendar-body-cell.svelte';
export type CalendarRootProps = ComponentProps<typeof CalendarRootComponent>;
export type CalendarTriggerPreviousProps = ComponentProps<typeof CalendarTriggerPreviousComponent>;
export type CalendarHeadingProps = ComponentProps<typeof CalendarHeadingComponent>;
export type CalendarTriggerNextProps = ComponentProps<typeof CalendarTriggerNextComponent>;
export type CalendarGridProps = ComponentProps<typeof CalendarGridComponent>;
export type CalendarGridHeaderProps = ComponentProps<typeof CalendarGridHeaderComponent>;
export type CalendarHeaderCellProps = ComponentProps<typeof CalendarHeaderCellComponent>;
export type CalendarGridBodyProps = ComponentProps<typeof CalendarGridBodyComponent>;
export type CalendarBodyCellProps = ComponentProps<typeof CalendarBodyCellComponent>;

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
} from './root/context.js';

import * as CalendarParts from './index.parts.js';
export default CalendarParts;
