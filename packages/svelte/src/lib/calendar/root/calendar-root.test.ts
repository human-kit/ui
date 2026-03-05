import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CalendarRootTest from './calendar-root-test.svelte';
import CalendarRootBindValueTest from './calendar-root-bind-value-test.svelte';
import CalendarRootControlledClearTest from './calendar-root-controlled-clear-test.svelte';
import { expectNoFalseFocusAttributes } from '../../test-utils/focus-contract';

function pressKey(element: Element, key: string, options?: { shiftKey?: boolean }) {
	element.dispatchEvent(
		new KeyboardEvent('keydown', { key, bubbles: true, shiftKey: options?.shiftKey ?? false })
	);
}

function getGridCellByDate(date: string) {
	const element = document.querySelector<HTMLElement>(`[role="gridcell"][data-date="${date}"]`);
	if (!element) {
		throw new Error(`Grid cell "${date}" was not rendered.`);
	}

	return {
		element: () => element,
		click: () => element.click()
	};
}

describe('Calendar', () => {
	const februaryRangeAnchor = { start: '2026-02-10', end: '2026-02-10' };

	it('renders heading and grid', async () => {
		const screen = render(CalendarRootTest);
		const heading = screen.getByRole('heading');
		const grid = screen.getByRole('grid');

		await expect.element(heading).toBeInTheDocument();
		await expect.element(grid).toBeInTheDocument();
	});

	it('shows multiple grids when visibleMonths is greater than 1', async () => {
		render(CalendarRootTest, { visibleMonths: 2 });
		const grids = document.querySelectorAll('[role="grid"]');
		expect(grids.length).toBe(2);
	});

	it('hides outside days by default and removes fully outside rows', async () => {
		render(CalendarRootTest, { defaultValue: '2026-02-10' });
		const rows = document.querySelectorAll('tbody tr');
		expect(rows.length).toBe(4);
	});

	it('renders a 6-row grid when showOutsideDays is true', async () => {
		render(CalendarRootTest, { defaultValue: '2026-02-10', showOutsideDays: true });
		const rows = document.querySelectorAll('tbody tr');
		expect(rows.length).toBe(6);
	});

	it('navigates months with next trigger', async () => {
		const screen = render(CalendarRootTest);
		const heading = screen.getByRole('heading');
		const next = screen.getByRole('button', { name: 'Next' });

		const before = heading.element()?.textContent;
		await next.click();
		const after = heading.element()?.textContent;

		expect(before).not.toEqual(after);
	});

	it('selects a date when clicking a day cell', async () => {
		render(CalendarRootTest, { defaultValue: '2026-02-09' });
		const dayCell = getGridCellByDate('2026-02-10');

		await dayCell.click();

		await expect
			.poll(() =>
				document.querySelector('[data-selected] [role="gridcell"]')?.getAttribute('data-date')
			)
			.toBe('2026-02-10');
	});

	it('prevents selecting unavailable dates', async () => {
		const unavailableDate = '2026-02-15';
		render(CalendarRootTest, {
			defaultValue: '2026-02-10',
			isDateUnavailable: (date: string) => date === unavailableDate
		});

		const unavailableCell = getGridCellByDate(unavailableDate);
		expect(unavailableCell.element()?.getAttribute('aria-disabled')).toBe('true');

		const selectedCell = document.querySelector(
			`[data-selected] [role="gridcell"][data-date="${unavailableDate}"]`
		);
		expect(selectedCell).toBeFalsy();
	});

	it('updates bind:value when selecting a date', async () => {
		render(CalendarRootBindValueTest);
		const day = getGridCellByDate('2026-02-12');

		await day.click();
		expect(document.querySelector('[data-testid="calendar-value"]')?.textContent).toBe(
			'2026-02-12'
		);
	});

	it('clears selected state when controlled value becomes empty', async () => {
		const screen = render(CalendarRootControlledClearTest);

		await expect
			.poll(() =>
				document.querySelector('[data-selected] [role="gridcell"][data-date="2026-02-10"]')
			)
			.toBeTruthy();

		const clearButton = screen.getByTestId('clear-value');
		await clearButton.click();

		await expect.poll(() => document.querySelector('[data-selected]')).toBeFalsy();
		expect(document.querySelector('[data-testid="calendar-value"]')?.textContent).toBe('');
	});

	it('does not recompute unavailable predicate for cached visible dates on selection', async () => {
		const isDateUnavailable = vi.fn((date: string) => date === '2026-02-15');
		render(CalendarRootTest, {
			defaultValue: '2026-02-10',
			isDateUnavailable
		});

		const initialCalls = isDateUnavailable.mock.calls.length;
		const day = getGridCellByDate('2026-02-12');
		await day.click();

		expect(isDateUnavailable.mock.calls.length).toBe(initialCalls);
	});

	it('moves focus with arrow keys across dates', async () => {
		render(CalendarRootTest, { defaultValue: '2026-02-10' });
		const day = getGridCellByDate('2026-02-10');
		const dayElement = day.element()!;

		dayElement.focus();
		pressKey(dayElement, 'ArrowRight');

		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2026-02-11');
	});

	it('never serializes false focus attributes during keyboard navigation', async () => {
		const screen = render(CalendarRootTest, { defaultValue: '2026-02-10' });
		const day = getGridCellByDate('2026-02-10');
		const grid = screen.getByRole('grid');

		day.element()?.focus();
		pressKey(day.element()!, 'ArrowRight');
		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2026-02-11');
		expectNoFalseFocusAttributes(grid.element() ?? document);
	});

	it('moves focus across month boundary with arrows', async () => {
		render(CalendarRootTest, { defaultValue: '2026-02-28' });
		const day = getGridCellByDate('2026-02-28');
		const dayElement = day.element()!;

		dayElement.focus();
		pressKey(dayElement, 'ArrowRight');

		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2026-03-01');
	});

	it('moves by month with PageUp and PageDown keeping day number', async () => {
		render(CalendarRootTest, { defaultValue: '2026-10-10' });
		const day = getGridCellByDate('2026-10-10');
		const dayElement = day.element()!;

		dayElement.focus();
		pressKey(dayElement, 'PageUp');
		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2026-09-10');

		pressKey(document.activeElement!, 'PageDown');
		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2026-10-10');
	});

	it('moves to month start/end with Home and End', async () => {
		render(CalendarRootTest, { defaultValue: '2026-10-10' });
		const day = getGridCellByDate('2026-10-10');
		const dayElement = day.element()!;

		dayElement.focus();
		pressKey(dayElement, 'Home');
		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2026-10-01');

		pressKey(document.activeElement!, 'End');
		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2026-10-31');
	});

	it('focuses unavailable dates during keyboard navigation', async () => {
		render(CalendarRootTest, {
			defaultValue: '2026-02-14',
			isDateUnavailable: (date: string) => date === '2026-02-15'
		});
		const day = getGridCellByDate('2026-02-14');
		const dayElement = day.element()!;

		dayElement.focus();
		pressKey(dayElement, 'ArrowRight');

		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2026-02-15');
		expect(getGridCellByDate('2026-02-15').element()?.getAttribute('aria-disabled')).toBe('true');

		pressKey(document.activeElement!, 'Enter');
		await expect
			.poll(() =>
				document.querySelector('[data-selected] [role="gridcell"]')?.getAttribute('data-date')
			)
			.toBe('2026-02-14');
	});

	it('focuses disabled dates (out of min/max bounds) during keyboard navigation', async () => {
		render(CalendarRootTest, {
			defaultValue: '2026-02-14',
			isDateUnavailable: (date: string) => date > '2026-02-14'
		});
		const day = getGridCellByDate('2026-02-14');
		const dayElement = day.element()!;

		dayElement.focus();
		pressKey(dayElement, 'ArrowRight');

		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2026-02-15');
		expect(getGridCellByDate('2026-02-15').element()?.getAttribute('aria-disabled')).toBe('true');

		pressKey(document.activeElement!, 'Enter');
		await expect
			.poll(() =>
				document.querySelector('[data-selected] [role="gridcell"]')?.getAttribute('data-date')
			)
			.toBe('2026-02-14');
	});

	it('confirms a date range with two clicks in range mode', async () => {
		const screen = render(CalendarRootTest, {
			selectionMode: 'range'
		});

		const start = getGridCellByDate('2026-02-10');
		const end = getGridCellByDate('2026-02-14');

		await start.click();
		await end.click();

		await expect
			.poll(() =>
				document.querySelector('[data-range-start] [role="gridcell"][data-date="2026-02-10"]')
			)
			.toBeTruthy();
		await expect
			.poll(() =>
				document.querySelector('[data-range-end] [role="gridcell"][data-date="2026-02-14"]')
			)
			.toBeTruthy();
		await expect
			.poll(() =>
				document.querySelector('[data-in-range] [role="gridcell"][data-date="2026-02-12"]')
			)
			.toBeTruthy();
	});

	it('extends range with Arrow and confirms with Enter', async () => {
		render(CalendarRootTest, {
			selectionMode: 'range',
			defaultValue: { start: '2026-02-10' }
		});

		const focused = getGridCellByDate('2026-02-10');
		const focusedElement = focused.element()!;
		focusedElement.focus();

		pressKey(focusedElement, 'ArrowRight');
		pressKey(document.activeElement!, 'ArrowRight');
		pressKey(document.activeElement!, 'Enter');

		await expect
			.poll(() =>
				document.querySelector('[data-range-start] [role="gridcell"][data-date="2026-02-10"]')
			)
			.toBeTruthy();
		await expect
			.poll(() =>
				document.querySelector('[data-range-end] [role="gridcell"][data-date="2026-02-12"]')
			)
			.toBeTruthy();
	});

	it('does not confirm a range that crosses unavailable dates', async () => {
		render(CalendarRootTest, {
			selectionMode: 'range',
			defaultValue: februaryRangeAnchor,
			isDateUnavailable: (date: string) => date === '2026-02-07'
		});

		const start = getGridCellByDate('2026-02-02');
		const blockedCrossingEnd = getGridCellByDate('2026-02-08');

		await start.click();
		expect(blockedCrossingEnd.element()?.getAttribute('aria-disabled')).toBe('true');

		await expect
			.poll(() =>
				document.querySelector('[data-range-start] [role="gridcell"][data-date="2026-02-02"]')
			)
			.toBeTruthy();
		expect(
			document.querySelector('[data-range-end] [role="gridcell"][data-date="2026-02-08"]')
		).toBeFalsy();
		expect(document.querySelector('[data-in-range]')).toBeFalsy();
	});

	it('disables unreachable dates while waiting for range end', async () => {
		render(CalendarRootTest, {
			selectionMode: 'range',
			defaultValue: februaryRangeAnchor,
			isDateUnavailable: (date: string) => date === '2026-02-07'
		});

		const start = getGridCellByDate('2026-02-02');
		await start.click();

		const reachable = getGridCellByDate('2026-02-06');
		const unreachable = getGridCellByDate('2026-02-08');

		expect(reachable.element()?.getAttribute('aria-disabled')).toBeNull();
		expect(unreachable.element()?.getAttribute('aria-disabled')).toBe('true');
	});

	it('cancels pending range with Escape and restores previous committed range', async () => {
		render(CalendarRootTest, {
			selectionMode: 'range',
			defaultValue: { start: '2026-02-10', end: '2026-02-12' }
		});

		const newStart = getGridCellByDate('2026-02-15');
		await newStart.click();

		const focused = newStart.element()!;
		pressKey(focused, 'Escape');

		await expect
			.poll(() =>
				document.querySelector('[data-range-start] [role="gridcell"][data-date="2026-02-10"]')
			)
			.toBeTruthy();
		await expect
			.poll(() =>
				document.querySelector('[data-range-end] [role="gridcell"][data-date="2026-02-12"]')
			)
			.toBeTruthy();
	});

	it('shows range trace while moving with keyboard after selecting a range start', async () => {
		const screen = render(CalendarRootTest, {
			selectionMode: 'range'
		});

		const start = getGridCellByDate('2026-02-10');
		const startElement = start.element()!;
		startElement.focus();

		pressKey(startElement, 'Enter');
		pressKey(startElement, 'ArrowRight');

		await expect
			.poll(() =>
				document.querySelector('[data-range-end] [role="gridcell"][data-date="2026-02-11"]')
			)
			.toBeTruthy();
		await expect
			.poll(() =>
				document.querySelector('[data-in-range] [role="gridcell"][data-date="2026-02-10"]')
			)
			.toBeTruthy();
	});

	it('marks new range start as selected immediately when restarting range', async () => {
		render(CalendarRootTest, {
			selectionMode: 'range',
			defaultValue: { start: '2026-02-03', end: '2026-02-03' }
		});

		const newStart = getGridCellByDate('2026-02-05');
		await newStart.click();

		expect(newStart.element()?.getAttribute('aria-selected')).toBe('true');
		await expect
			.poll(() =>
				document.querySelector('[data-selected] [role="gridcell"][data-date="2026-02-05"]')
			)
			.toBeTruthy();
	});

	it('keeps focus on second click when selecting reverse range', async () => {
		const screen = render(CalendarRootTest, {
			selectionMode: 'range'
		});

		const first = getGridCellByDate('2026-02-06');
		const second = getGridCellByDate('2026-02-03');

		await first.click();
		await second.click();

		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2026-02-03');
	});

	it('allows focus to move past reachable range bounds but keeps it disabled', async () => {
		render(CalendarRootTest, {
			selectionMode: 'range',
			defaultValue: februaryRangeAnchor,
			isDateUnavailable: (date: string) => {
				if (!date.startsWith('2026-02-')) return true;
				const day = Number(date.slice(-2));
				return day < 9 || day > 13;
			}
		});

		const start = getGridCellByDate('2026-02-09');
		await start.click();
		const startElement = start.element()!;
		startElement.focus();

		pressKey(startElement, 'PageDown');
		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2026-03-09');
		expect(document.activeElement?.getAttribute('aria-disabled')).toBe('true');

		pressKey(document.activeElement!, 'PageUp');
		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2026-02-09');
	});
});
