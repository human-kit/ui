import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import DatePickerTest from '../root/date-picker-test.svelte';
import DatePickerEmptyTest from '../root/date-picker-empty-test.svelte';
import DatePickerLocaleTypingTest from '../root/date-picker-locale-typing-test.svelte';
import { addDays, formatCalendarDate, getTodayUtcDate } from '../../calendar/root/date-utils';

describe('DatePicker.Calendar', () => {
	afterEach(() => {
		const dialogs = document.querySelectorAll('[role="dialog"]');
		dialogs.forEach((dialog) => dialog.remove());
	});

	it('marks dates outside min/max as unavailable', async () => {
		const screen = render(DatePickerTest, {
			defaultOpen: true,
			minValue: '2026-02-10',
			maxValue: '2026-02-20'
		});

		const beforeMin = screen.getByRole('gridcell', { name: '2026-02-09' });
		const withinRange = screen.getByRole('gridcell', { name: '2026-02-12' });

		await expect.element(beforeMin).toHaveAttribute('aria-disabled', 'true');
		await expect.element(withinRange).not.toHaveAttribute('aria-disabled', 'true');
	});

	it('updates root value when selecting a valid calendar date', async () => {
		const screen = render(DatePickerTest, { defaultOpen: true });
		const dateCell = screen.getByRole('gridcell', { name: '2026-02-15' });

		await dateCell.click();
		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-value"]')?.textContent)
			.toBe('2026-02-15');
	});

	it('opens calendar on the typed short-year value instead of fallback month', async () => {
		const screen = render(DatePickerLocaleTypingTest);
		const daySegment = screen.getByRole('spinbutton', { name: 'day, ' });
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

		const typedDateCell = screen.getByRole('gridcell', { name: '0002-01-20' });
		await expect.element(typedDateCell).toHaveAttribute('aria-selected', 'true');
	});

	it('keeps initial focus implicit on selected date until arrow navigation', async () => {
		const screen = render(DatePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		await expect.poll(() => document.activeElement?.getAttribute('aria-label')).toBe('2026-02-10');
		expect(document.activeElement?.getAttribute('data-focused')).toBeNull();

		document.activeElement?.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
		);

		await expect.poll(() => document.activeElement?.getAttribute('aria-label')).toBe('2026-02-11');
		await expect.poll(() => document.activeElement?.getAttribute('data-focused')).toBe('true');
	});

	it('does not focus previous trigger while opening popover', async () => {
		const screen = render(DatePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		await expect.poll(() => document.activeElement?.getAttribute('aria-label')).toBe('2026-02-10');
		expect(document.activeElement?.getAttribute('aria-label')).not.toBe('Previous page');
	});

	it('keeps initial focus implicit on today when there is no selected value', async () => {
		const screen = render(DatePickerEmptyTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });
		const today = formatCalendarDate(getTodayUtcDate());
		const tomorrow = formatCalendarDate(addDays(getTodayUtcDate(), 1));

		await trigger.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		await expect.poll(() => document.activeElement?.getAttribute('aria-label')).toBe(today);
		expect(document.activeElement?.getAttribute('data-focused')).toBeNull();

		document.activeElement?.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
		);

		await expect.poll(() => document.activeElement?.getAttribute('aria-label')).toBe(tomorrow);
		await expect.poll(() => document.activeElement?.getAttribute('data-focused')).toBe('true');
	});
});
