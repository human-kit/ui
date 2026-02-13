import { getContext, setContext } from 'svelte';

const MONTH_SCOPE_KEY = Symbol('calendar-month-scope');

export function setCalendarMonthIndex(monthIndex: number) {
	setContext(MONTH_SCOPE_KEY, monthIndex);
}

export function getCalendarMonthIndex(): number {
	return getContext<number>(MONTH_SCOPE_KEY) ?? 0;
}
