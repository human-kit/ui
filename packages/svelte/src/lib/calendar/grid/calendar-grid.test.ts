import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CalendarRootTest from '../root/calendar-root-test.svelte';

describe('Calendar.Grid', () => {
	it('renders one grid by default', async () => {
		render(CalendarRootTest);
		const grids = document.querySelectorAll('[role="grid"]');
		expect(grids.length).toBe(1);
	});

	it('renders one grid per visible month', async () => {
		render(CalendarRootTest, { visibleMonths: 2 });
		const grids = document.querySelectorAll('[role="grid"]');
		const monthGroups = document.querySelectorAll('[data-calendar-month]');

		expect(grids.length).toBe(2);
		expect(monthGroups.length).toBe(2);
	});

	it('sets aria-readonly when calendar is readOnly', async () => {
		render(CalendarRootTest, { readonly: true });
		await expect
			.poll(() => document.querySelector('[role="grid"]')?.getAttribute('aria-readonly'))
			.toBe('true');
	});

	it('sets accessible name on each grid', async () => {
		render(CalendarRootTest, { defaultValue: '2026-02-10', visibleMonths: 2 });
		const grids = Array.from(document.querySelectorAll('[role="grid"]'));

		expect(grids.length).toBe(2);
		expect(grids.every((grid) => (grid.getAttribute('aria-label') ?? '').length > 0)).toBe(true);
	});

	it('uses unique accessible names per month when showing multiple grids', async () => {
		render(CalendarRootTest, { defaultValue: '2026-02-10', visibleMonths: 2 });
		const labels = Array.from(document.querySelectorAll('[role="grid"]'))
			.map((grid) => grid.getAttribute('aria-label'))
			.filter((label): label is string => Boolean(label));

		expect(labels.length).toBe(2);
		expect(new Set(labels).size).toBe(labels.length);
	});
});
