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
});
