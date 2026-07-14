import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CalendarRootTest from '../root/calendar-root-test.svelte';
import { formatCalendarDate, getTodayUtcDate } from '../root/date-utils';

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

// The interactive element is the inner `[role="button"]` div (it owns the
// onclick/onmouseenter handlers and the data-selected / data-range-* flags),
// nested inside the `[role="gridcell"]` td. Interaction and selection-state
// assertions must target this element, not the td.
function getDayButton(date: string) {
	const element = document.querySelector<HTMLElement>(`[role="button"][data-date="${date}"]`);
	if (!element) {
		throw new Error(`Day button "${date}" was not rendered.`);
	}

	return {
		element: () => element,
		click: () => element.click()
	};
}

describe('Calendar.BodyCell', () => {
	it('marks defaultValue date as selected', async () => {
		render(CalendarRootTest, { defaultValue: '2026-02-10' });
		await expect
			.poll(() => document.querySelector('[role="button"][data-date="2026-02-10"][data-selected]'))
			.toBeTruthy();
	});

	it('updates selected date on click', async () => {
		render(CalendarRootTest, { defaultValue: '2026-02-10' });
		const nextDate = getDayButton('2026-02-12');

		await nextDate.click();
		const selectedCell = document.querySelector(
			'[role="button"][data-date="2026-02-12"][data-selected]'
		);
		expect(selectedCell).toBeTruthy();
	});

	it('disables unavailable dates', async () => {
		render(CalendarRootTest, {
			defaultValue: '2026-02-10',
			isDateUnavailable: (date: string) => date === '2026-02-15'
		});

		const unavailableCell = getGridCellByDate('2026-02-15');
		expect(unavailableCell.element()?.getAttribute('aria-disabled')).toBe('true');
		expect(unavailableCell.element()?.getAttribute('data-disabled')).toBe('true');
		expect(unavailableCell.element()?.getAttribute('data-unavailable')).toBe('true');
	});

	it('marks today with aria-current=date', async () => {
		const today = formatCalendarDate(getTodayUtcDate());
		render(CalendarRootTest, { defaultValue: today });
		const todayCell = document.querySelector(`[role="gridcell"][data-date="${today}"]`);

		expect(todayCell).toBeTruthy();
		expect(todayCell?.getAttribute('aria-current')).toBe('date');
	});

	// INVERTED: disabled/readonly calendars must still SHOW their selection
	// (aria-selected/data-selected); only mutation is blocked.
	it('keeps exposing selected state when calendar is disabled', async () => {
		render(CalendarRootTest, {
			defaultValue: '2026-02-10',
			disabled: true
		});

		const selectedCell = getGridCellByDate('2026-02-10');
		expect(selectedCell.element()?.getAttribute('aria-selected')).toBe('true');
		expect(
			document.querySelector('[role="button"][data-date="2026-02-10"][data-selected]')
		).toBeTruthy();
	});

	it('keeps exposing selected state when calendar is read-only', async () => {
		render(CalendarRootTest, {
			defaultValue: '2026-02-10',
			readonly: true
		});

		const selectedCell = getGridCellByDate('2026-02-10');
		expect(selectedCell.element()?.getAttribute('aria-selected')).toBe('true');
		expect(
			document.querySelector('[role="button"][data-date="2026-02-10"][data-selected]')
		).toBeTruthy();
	});

	it('does not change the selection on click when calendar is read-only', async () => {
		render(CalendarRootTest, {
			defaultValue: '2026-02-10',
			readonly: true
		});

		const otherDay = getDayButton('2026-02-12');
		await otherDay.click();

		expect(
			document.querySelector('[role="button"][data-date="2026-02-10"][data-selected]')
		).toBeTruthy();
		expect(
			document.querySelector('[role="button"][data-date="2026-02-12"][data-selected]')
		).toBeFalsy();
	});

	it('does not focus a day cell on click when calendar is disabled', async () => {
		render(CalendarRootTest, {
			defaultValue: '2026-02-10',
			disabled: true
		});
		const day = getGridCellByDate('2026-02-10');
		const dayElement = day.element()!;

		dayElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		dayElement.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		expect(document.activeElement).not.toBe(dayElement);
	});

	it('shows range preview flags while hovering before range confirmation', async () => {
		render(CalendarRootTest, {
			selectionMode: 'range',
			defaultValue: { start: '2026-02-10' }
		});

		const endCandidate = getDayButton('2026-02-13');
		endCandidate.element()?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

		await expect
			.poll(() =>
				document.querySelector('[role="button"][data-date="2026-02-10"][data-range-start]')
			)
			.toBeTruthy();
		await expect
			.poll(() => document.querySelector('[role="button"][data-date="2026-02-13"][data-range-end]'))
			.toBeTruthy();
		await expect
			.poll(() => document.querySelector('[role="button"][data-date="2026-02-12"][data-in-range]'))
			.toBeTruthy();
	});

	// INVERTED: mouseleave must clear the hover preview (it used to freeze the
	// last valid preview, letting Enter commit against a stale hover).
	it('clears the hover preview on mouseleave and ignores unreachable hover targets', async () => {
		render(CalendarRootTest, {
			selectionMode: 'range',
			defaultValue: { start: '2026-02-02' },
			isDateUnavailable: (date: string) => date === '2026-02-07'
		});

		const validPreviewCell = getDayButton('2026-02-05');
		validPreviewCell.element()?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

		await expect
			.poll(() => document.querySelector('[role="button"][data-date="2026-02-05"][data-range-end]'))
			.toBeTruthy();

		validPreviewCell.element()?.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

		await expect
			.poll(() => document.querySelector('[role="button"][data-date="2026-02-05"][data-range-end]'))
			.toBeFalsy();

		const unreachableCell = getDayButton('2026-02-08');
		unreachableCell.element()?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

		expect(
			document.querySelector('[role="button"][data-date="2026-02-08"][data-range-end]')
		).toBeFalsy();
		expect(document.querySelector('[data-range-end]')).toBeFalsy();
	});
});
