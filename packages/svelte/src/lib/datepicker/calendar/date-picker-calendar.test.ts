import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import DatePickerTest from '../root/date-picker-test.svelte';
import DatePickerEmptyTest from '../root/date-picker-empty-test.svelte';
import DatePickerLocaleTypingTest from '../root/date-picker-locale-typing-test.svelte';
import { addDays, formatCalendarDate, getTodayUtcDate } from '../../calendar/root/date-utils';

function getSegment(type: 'day' | 'month' | 'year') {
	const element = document.querySelector<HTMLElement>(`[role="spinbutton"][data-type="${type}"]`);
	if (!element) {
		throw new Error(`Segment "${type}" was not rendered.`);
	}

	return {
		element: () => element,
		click: () => element.click()
	};
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

describe('DatePicker.Calendar', () => {
	afterEach(() => {
		const dialogs = document.querySelectorAll('[role="dialog"]');
		dialogs.forEach((dialog) => dialog.remove());
	});

	it('marks dates outside min/max as unavailable', async () => {
		render(DatePickerTest, {
			defaultOpen: true,
			minValue: '2026-02-10',
			maxValue: '2026-02-20'
		});

		const beforeMin = getGridCellByDate('2026-02-09');
		const withinRange = getGridCellByDate('2026-02-12');

		expect(beforeMin.element()?.getAttribute('aria-disabled')).toBe('true');
		expect(withinRange.element()?.getAttribute('aria-disabled')).toBeNull();
	});

	it('updates root value when selecting a valid calendar date', async () => {
		render(DatePickerTest, { defaultOpen: true });
		const dateCell = getGridCellByDate('2026-02-15');

		await dateCell.click();
		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-value"]')?.textContent)
			.toBe('2026-02-15');
	});

	it('applies custom date unavailability with min/max constraints', async () => {
		render(DatePickerTest, {
			defaultOpen: true,
			minValue: '2026-02-10',
			maxValue: '2026-02-20',
			isDateUnavailable: (date: string) => date === '2026-02-12'
		});

		const customUnavailable = getGridCellByDate('2026-02-12');
		const validDate = getGridCellByDate('2026-02-13');

		expect(customUnavailable.element()?.getAttribute('aria-disabled')).toBe('true');
		expect(validDate.element()?.getAttribute('aria-disabled')).toBeNull();
	});

	it('opens calendar on the typed short-year value instead of fallback month', async () => {
		const screen = render(DatePickerLocaleTypingTest);
		const daySegment = getSegment('day');
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		daySegment.element()?.focus();
		await userEvent.keyboard('2');
		await userEvent.keyboard('0');
		await userEvent.keyboard('/');
		await userEvent.keyboard('1');
		await userEvent.keyboard('/');
		await userEvent.keyboard('2');

		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-value"]')?.textContent)
			.toBe('0002-01-20');

		await trigger.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

		const typedDateCell = getGridCellByDate('0002-01-20');
		expect(typedDateCell.element()?.getAttribute('aria-selected')).toBe('true');
	});

	it('keeps initial focus implicit on selected date until arrow navigation', async () => {
		const screen = render(DatePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2026-02-10');
		expect(document.activeElement?.getAttribute('data-focused')).toBe('true');
		expect(document.activeElement?.getAttribute('data-focus-visible')).toBeNull();

		document.activeElement?.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
		);

		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2026-02-11');
		await expect.poll(() => document.activeElement?.getAttribute('data-focused')).toBe('true');
		await expect.poll(() => document.activeElement?.getAttribute('data-focus-visible')).toBe('true');
	});

	it('shows initial calendar focus as focus-visible when opened from keyboard', async () => {
		const screen = render(DatePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		trigger.element()?.focus();
		await userEvent.keyboard('{Enter}');

		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2026-02-10');
		await expect.poll(() => document.activeElement?.getAttribute('data-focused')).toBe('true');
		await expect.poll(() => document.activeElement?.getAttribute('data-focus-visible')).toBe('true');
	});

	it('does not focus previous trigger while opening popover', async () => {
		const screen = render(DatePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2026-02-10');
		expect(document.activeElement?.getAttribute('aria-label')).not.toBe('Previous page');
	});

	it('keeps initial focus implicit on today when there is no selected value', async () => {
		const screen = render(DatePickerEmptyTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });
		const today = formatCalendarDate(getTodayUtcDate());
		const tomorrow = formatCalendarDate(addDays(getTodayUtcDate(), 1));

		await trigger.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe(today);
		expect(document.activeElement?.getAttribute('data-focused')).toBe('true');
		expect(document.activeElement?.getAttribute('data-focus-visible')).toBeNull();

		document.activeElement?.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
		);

		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe(tomorrow);
		await expect.poll(() => document.activeElement?.getAttribute('data-focused')).toBe('true');
		await expect.poll(() => document.activeElement?.getAttribute('data-focus-visible')).toBe('true');
	});
});

