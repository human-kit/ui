import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CalendarRootTest from '../root/calendar-root-test.svelte';
import CalendarGridHeaderCustomTest from './calendar-grid-header-custom-test.svelte';

describe('Calendar.GridHeader', () => {
	it('renders seven weekday headers', async () => {
		render(CalendarRootTest);
		const headerCells = document.querySelectorAll('th[role="columnheader"]');
		expect(headerCells.length).toBe(7);
	});

	it('supports custom header cell rendering', async () => {
		render(CalendarGridHeaderCustomTest);
		const customCell = Array.from(document.querySelectorAll('th')).find((cell) =>
			cell.textContent?.startsWith('DAY-')
		);

		expect(customCell).toBeTruthy();
	});

	it('exposes the long weekday name as aria-label and abbr on each header cell', async () => {
		render(CalendarRootTest, {
			defaultValue: '2026-05-10',
			locale: 'en-US',
			firstDayOfWeek: 'sun',
			weekdayStyle: 'narrow'
		});

		const headerCells = Array.from(
			document.querySelectorAll<HTMLTableCellElement>('th[role="columnheader"]')
		);
		const longNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

		expect(headerCells.map((cell) => cell.getAttribute('aria-label'))).toEqual(longNames);
		expect(headerCells.map((cell) => cell.getAttribute('abbr'))).toEqual(longNames);
		// The visible (narrow) labels stay ambiguous on purpose; assistive tech
		// reads the aria-label instead.
		expect(headerCells.map((cell) => cell.textContent?.trim())).toEqual([
			'S',
			'M',
			'T',
			'W',
			'T',
			'F',
			'S'
		]);
	});
});
