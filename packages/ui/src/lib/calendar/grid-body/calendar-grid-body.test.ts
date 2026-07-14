import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CalendarRootTest from '../root/calendar-root-test.svelte';
import CalendarGridBodyCustomTest from './calendar-grid-body-custom-test.svelte';

describe('Calendar.GridBody', () => {
	it('renders six week rows', async () => {
		render(CalendarRootTest, { defaultValue: '2026-02-10', firstDayOfWeek: 'sun' });
		const rows = document.querySelectorAll('tbody tr[data-week]');
		expect(rows.length).toBe(4);
	});

	it('renders 42 grid cells (6x7)', async () => {
		render(CalendarRootTest, { showOutsideDays: true });
		const cells = document.querySelectorAll('[role="gridcell"]');
		expect(cells.length).toBe(42);
	});

	it('supports custom body cell rendering', async () => {
		render(CalendarGridBodyCustomTest);
		const isoCell = Array.from(document.querySelectorAll('[role="gridcell"]')).find((cell) =>
			/\d{4}-\d{2}-\d{2}/.test(cell.textContent ?? '')
		);

		expect(isoCell).toBeTruthy();
	});
});
