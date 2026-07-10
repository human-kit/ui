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

function releaseKey(element: Element, key: string) {
	element.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
}

function getGridCellByDate(date: string) {
	const element = document.querySelector<HTMLElement>(`[role="button"][data-date="${date}"]`);
	if (!element) {
		throw new Error(`Calendar cell button "${date}" was not rendered.`);
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

	it('renders narrow weekday labels for the current locale', () => {
		render(CalendarRootTest, {
			defaultValue: '2026-05-10',
			locale: 'es-AR',
			firstDayOfWeek: 'sun',
			weekdayStyle: 'narrow'
		});

		const headers = Array.from(document.querySelectorAll('thead th')).map((header) =>
			header.textContent?.trim()
		);
		expect(headers).toEqual(['D', 'L', 'M', 'M', 'J', 'V', 'S']);
	});

	it('renders month-year headings without locale connectors', async () => {
		const screen = render(CalendarRootTest, {
			defaultValue: '2026-05-10',
			locale: 'es-AR',
			monthHeadingStyle: 'month-year'
		});

		const heading = screen.getByRole('heading');
		expect(heading.element()?.textContent).toBe('mayo 2026');
	});

	it('shows multiple grids when visibleMonths is greater than 1', async () => {
		render(CalendarRootTest, { visibleMonths: 2 });
		const grids = document.querySelectorAll('[role="grid"]');
		expect(grids.length).toBe(2);
	});

	it('hides outside days by default and removes fully outside rows', async () => {
		render(CalendarRootTest, { defaultValue: '2026-02-10', firstDayOfWeek: 'sun' });
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
				document.querySelector('[role="button"][data-selected]')?.getAttribute('data-date')
			)
			.toBe('2026-02-10');
	});

	it('renders gridcell semantics on the table cell and button semantics on the inner cell', () => {
		render(CalendarRootTest, { defaultValue: '2026-02-10' });
		const dayCell = getGridCellByDate('2026-02-10').element();
		const gridCell = dayCell?.closest('[role="gridcell"]');

		expect(dayCell?.getAttribute('role')).toBe('button');
		expect(gridCell).toBeTruthy();
		expect(gridCell?.getAttribute('data-date')).toBe('2026-02-10');
		expect(gridCell?.getAttribute('aria-selected')).toBe('true');
	});

	it('exposes button-like hover and pressed interaction states', async () => {
		render(CalendarRootTest, { defaultValue: '2026-02-10' });
		const dayCell = getGridCellByDate('2026-02-10').element()!;

		dayCell.dispatchEvent(new MouseEvent('mouseenter'));
		await expect.poll(() => dayCell.getAttribute('data-hovered')).toBe('true');

		dayCell.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
		await expect.poll(() => dayCell.getAttribute('data-pressed')).toBe('true');

		dayCell.dispatchEvent(new PointerEvent('pointerup', { button: 0, bubbles: true }));
		await expect.poll(() => dayCell.getAttribute('data-pressed')).toBeNull();

		dayCell.dispatchEvent(new MouseEvent('mouseleave'));
		await expect.poll(() => dayCell.getAttribute('data-hovered')).toBeNull();
	});

	it('exposes pressed state while activating with keyboard', async () => {
		render(CalendarRootTest, { defaultValue: '2026-02-10' });
		const dayCell = getGridCellByDate('2026-02-10').element()!;

		dayCell.focus();
		pressKey(dayCell, 'Enter');
		await expect.poll(() => dayCell.getAttribute('data-pressed')).toBe('true');

		releaseKey(dayCell, 'Enter');
		await expect.poll(() => dayCell.getAttribute('data-pressed')).toBeNull();
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
			`[role="button"][data-selected][data-date="${unavailableDate}"]`
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
			.poll(() => document.querySelector('[role="button"][data-selected][data-date="2026-02-10"]'))
			.toBeTruthy();

		const clearButton = screen.getByTestId('clear-value');
		await clearButton.click();

		await expect.poll(() => document.querySelector('[data-selected]')).toBeFalsy();
		expect(document.querySelector('[data-testid="calendar-value"]')?.textContent).toBe('');
	});

	it('clears selected state when controlled value becomes null', async () => {
		const screen = render(CalendarRootControlledClearTest);

		await expect
			.poll(() => document.querySelector('[role="button"][data-selected][data-date="2026-02-10"]'))
			.toBeTruthy();

		const clearButton = screen.getByTestId('clear-value-null');
		await clearButton.click();

		await expect.poll(() => document.querySelector('[data-selected]')).toBeFalsy();
		await expect.poll(() => document.querySelector('[aria-selected="true"]')).toBeFalsy();
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

	it('keeps focus on the next trigger after month navigation with the mouse', async () => {
		const screen = render(CalendarRootTest, { defaultValue: '2026-02-10' });
		const day = getGridCellByDate('2026-02-10');
		const dayElement = day.element()!;

		dayElement.focus();
		pressKey(dayElement, 'ArrowRight');
		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2026-02-11');

		const next = screen.getByRole('button', { name: 'Next' });
		const nextElement = next.element() as HTMLButtonElement;
		nextElement.focus();
		nextElement.click();

		await expect
			.poll(() => document.querySelector('[role="button"][data-date="2026-03-11"]'))
			.toBeTruthy();
		expect(document.activeElement).toBe(nextElement);
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
				document.querySelector('[role="button"][data-selected]')?.getAttribute('data-date')
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
				document.querySelector('[role="button"][data-selected]')?.getAttribute('data-date')
			)
			.toBe('2026-02-14');
	});

	it('confirms a date range with two clicks in range mode', async () => {
		render(CalendarRootTest, {
			selectionMode: 'range',
			defaultValue: februaryRangeAnchor
		});

		const start = getGridCellByDate('2026-02-10');
		const end = getGridCellByDate('2026-02-14');

		await start.click();
		await end.click();

		await expect
			.poll(() =>
				document.querySelector('[role="button"][data-range-start][data-date="2026-02-10"]')
			)
			.toBeTruthy();
		await expect
			.poll(() => document.querySelector('[role="button"][data-range-end][data-date="2026-02-14"]'))
			.toBeTruthy();
		await expect
			.poll(() => document.querySelector('[role="button"][data-in-range][data-date="2026-02-12"]'))
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
				document.querySelector('[role="button"][data-range-start][data-date="2026-02-10"]')
			)
			.toBeTruthy();
		await expect
			.poll(() => document.querySelector('[role="button"][data-range-end][data-date="2026-02-12"]'))
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
				document.querySelector('[role="button"][data-range-start][data-date="2026-02-02"]')
			)
			.toBeTruthy();
		expect(
			document.querySelector('[role="button"][data-range-end][data-date="2026-02-08"]')
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
				document.querySelector('[role="button"][data-range-start][data-date="2026-02-10"]')
			)
			.toBeTruthy();
		await expect
			.poll(() => document.querySelector('[role="button"][data-range-end][data-date="2026-02-12"]'))
			.toBeTruthy();
	});

	it('consumes Escape only while a pending range selection exists', async () => {
		render(CalendarRootTest, {
			selectionMode: 'range',
			defaultValue: { start: '2026-02-10', end: '2026-02-12' }
		});

		const newStart = getGridCellByDate('2026-02-15');
		await newStart.click();

		const focused = newStart.element()!;
		const firstEscape = new KeyboardEvent('keydown', {
			key: 'Escape',
			bubbles: true,
			cancelable: true
		});
		focused.dispatchEvent(firstEscape);
		expect(firstEscape.defaultPrevented).toBe(true);

		await expect
			.poll(() => document.querySelector('[role="button"][data-range-end][data-date="2026-02-12"]'))
			.toBeTruthy();

		const secondEscape = new KeyboardEvent('keydown', {
			key: 'Escape',
			bubbles: true,
			cancelable: true
		});
		focused.dispatchEvent(secondEscape);
		expect(secondEscape.defaultPrevented).toBe(false);
	});

	it('shows range trace while moving with keyboard after selecting a range start', async () => {
		render(CalendarRootTest, {
			selectionMode: 'range',
			defaultValue: februaryRangeAnchor
		});

		const start = getGridCellByDate('2026-02-10');
		const startElement = start.element()!;
		startElement.focus();

		pressKey(startElement, 'Enter');
		pressKey(startElement, 'ArrowRight');

		await expect
			.poll(() => document.querySelector('[role="button"][data-range-end][data-date="2026-02-11"]'))
			.toBeTruthy();
		await expect
			.poll(() => document.querySelector('[role="button"][data-in-range][data-date="2026-02-10"]'))
			.toBeTruthy();
	});

	it('marks new range start as selected immediately when restarting range', async () => {
		render(CalendarRootTest, {
			selectionMode: 'range',
			defaultValue: { start: '2026-02-03', end: '2026-02-03' }
		});

		const newStart = getGridCellByDate('2026-02-05');
		await newStart.click();

		expect(newStart.element()?.closest('[role="gridcell"]')?.getAttribute('aria-selected')).toBe(
			'true'
		);
		await expect
			.poll(() => document.querySelector('[role="button"][data-selected][data-date="2026-02-05"]'))
			.toBeTruthy();
	});

	it('keeps focus on second click when selecting reverse range', async () => {
		render(CalendarRootTest, {
			selectionMode: 'range',
			defaultValue: februaryRangeAnchor
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
