import { getContext, setContext } from 'svelte';
import type { CalendarWeekdayStyle } from '../root/date-utils';

const GRID_CONTEXT_KEY = Symbol('calendar-grid');

export type CalendarGridContext = {
	weekdayStyle: CalendarWeekdayStyle;
};

export function setCalendarGridContext(context: CalendarGridContext) {
	setContext(GRID_CONTEXT_KEY, context);
}

export function getCalendarGridContext(): CalendarGridContext | undefined {
	return getContext<CalendarGridContext | undefined>(GRID_CONTEXT_KEY);
}
