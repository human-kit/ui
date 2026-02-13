import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CalendarRootTest from '../root/calendar-root-test.svelte';
import { formatCalendarDate, getTodayUtcDate } from '../root/date-utils';

describe('Calendar.BodyCell', () => {
	it('marks defaultValue date as selected', async () => {
		render(CalendarRootTest, { defaultValue: '2026-02-10' });
		await expect
			.poll(() =>
				document.querySelector('[data-selected] [role="gridcell"][aria-label="2026-02-10"]')
			)
			.toBeTruthy();
	});

	it('updates selected date on click', async () => {
		const screen = render(CalendarRootTest, { defaultValue: '2026-02-10' });
		const nextDate = screen.getByRole('gridcell', { name: '2026-02-12' });

		await nextDate.click();
		const selectedCell = document.querySelector(
			'[data-selected] [role="gridcell"][aria-label="2026-02-12"]'
		);
		expect(selectedCell).toBeTruthy();
	});

	it('disables unavailable dates', async () => {
		const screen = render(CalendarRootTest, {
			defaultValue: '2026-02-10',
			isDateUnavailable: (date: string) => date === '2026-02-15'
		});

		const unavailableCell = screen.getByRole('gridcell', { name: '2026-02-15' });
		await expect.element(unavailableCell).toHaveAttribute('aria-disabled', 'true');
		await expect.element(unavailableCell).toHaveAttribute('tabindex', '-1');
	});

	it('marks today with aria-current=date', async () => {
		const today = formatCalendarDate(getTodayUtcDate());
		render(CalendarRootTest, { defaultValue: today });
		const todayCell = document.querySelector(`[role="gridcell"][aria-label="${today}"]`);

		expect(todayCell).toBeTruthy();
		expect(todayCell?.getAttribute('aria-current')).toBe('date');
	});

	it('does not expose selected state when calendar is disabled', async () => {
		const screen = render(CalendarRootTest, {
			defaultValue: '2026-02-10',
			isDisabled: true
		});

		const selectedCell = screen.getByRole('gridcell', { name: '2026-02-10' });
		await expect.element(selectedCell).toHaveAttribute('aria-selected', 'false');
		expect(document.querySelector('[data-selected]')).toBeFalsy();
	});

	it('does not expose selected state when calendar is read-only', async () => {
		const screen = render(CalendarRootTest, {
			defaultValue: '2026-02-10',
			isReadOnly: true
		});

		const selectedCell = screen.getByRole('gridcell', { name: '2026-02-10' });
		await expect.element(selectedCell).toHaveAttribute('aria-selected', 'false');
		expect(document.querySelector('[data-selected]')).toBeFalsy();
	});

	it('does not focus a day cell on click when calendar is disabled', async () => {
		const screen = render(CalendarRootTest, {
			defaultValue: '2026-02-10',
			isDisabled: true
		});
		const day = screen.getByRole('gridcell', { name: '2026-02-10' });
		const dayElement = day.element()!;

		dayElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		dayElement.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		expect(document.activeElement).not.toBe(dayElement);
	});

	it('shows range preview flags while hovering before range confirmation', async () => {
		const screen = render(CalendarRootTest, {
			selectionMode: 'range',
			defaultValue: { start: '2026-02-10' }
		});

		const endCandidate = screen.getByRole('gridcell', { name: '2026-02-13' });
		endCandidate.element()?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

		await expect
			.poll(() =>
				document.querySelector('[data-range-start] [role="gridcell"][aria-label="2026-02-10"]')
			)
			.toBeTruthy();
		await expect
			.poll(() =>
				document.querySelector('[data-range-end] [role="gridcell"][aria-label="2026-02-13"]')
			)
			.toBeTruthy();
		await expect
			.poll(() =>
				document.querySelector('[data-in-range] [role="gridcell"][aria-label="2026-02-12"]')
			)
			.toBeTruthy();
	});

	it('keeps the last valid preview when hovering an unreachable date', async () => {
		const screen = render(CalendarRootTest, {
			selectionMode: 'range',
			defaultValue: { start: '2026-02-02' },
			isDateUnavailable: (date: string) => date === '2026-02-07'
		});

		const validPreviewCell = screen.getByRole('gridcell', { name: '2026-02-05' });
		validPreviewCell.element()?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

		await expect
			.poll(() =>
				document.querySelector('[data-range-end] [role="gridcell"][aria-label="2026-02-05"]')
			)
			.toBeTruthy();

		validPreviewCell.element()?.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

		const unreachableCell = screen.getByRole('gridcell', { name: '2026-02-08' });
		unreachableCell.element()?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

		await expect
			.poll(() =>
				document.querySelector('[data-range-end] [role="gridcell"][aria-label="2026-02-05"]')
			)
			.toBeTruthy();
		expect(
			document.querySelector('[data-range-end] [role="gridcell"][aria-label="2026-02-08"]')
		).toBeFalsy();
	});
});
