import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import DateRangePickerTest from './date-range-picker-test.svelte';
import DateRangePickerBindableTest from './date-range-picker-bindable-test.svelte';
import { expectNoFalseFocusAttributes } from '../../test-utils/focus-contract';

function getSegment(part: 'start' | 'end', type: 'day' | 'month' | 'year') {
	const element = document.querySelector<HTMLElement>(
		`[role="spinbutton"][data-range-part="${part}"][data-type="${type}"]`
	);
	if (!element) {
		throw new Error(`Segment "${part}.${type}" was not rendered.`);
	}

	return {
		element: () => element,
		click: () => element.click()
	};
}

async function typeSegment(
	part: 'start' | 'end',
	type: 'day' | 'month' | 'year',
	digits: string
) {
	const element = getSegment(part, type).element();
	element.focus();
	await userEvent.keyboard(digits);
}

function segmentText(part: 'start' | 'end', type: 'day' | 'month' | 'year') {
	return getSegment(part, type).element().textContent?.trim();
}

function getDayButton(date: string) {
	const element = document.querySelector<HTMLElement>(`[role="button"][data-date="${date}"]`);
	if (!element) {
		throw new Error(`Calendar day "${date}" was not rendered.`);
	}

	return {
		element: () => element,
		click: () => element.click()
	};
}

describe('DateRangePicker.Root', () => {
	afterEach(() => {
		const dialogs = document.querySelectorAll('[role="dialog"]');
		dialogs.forEach((dialog) => dialog.remove());
	});

	it('opens calendar when trigger is clicked', async () => {
		const screen = render(DateRangePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		await trigger.click();

		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		await expect
			.poll(
				() => document.querySelector('[data-testid="date-range-picker-open-reason"]')?.textContent
			)
			.toBe('trigger-press');
	});

	it('commits a range after two calendar selections and closes popover', async () => {
		const screen = render(DateRangePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		await trigger.click();
		await getDayButton('2026-02-14').click();

		expect(document.querySelector('[data-testid="date-range-picker-value"]')?.textContent).toBe(
			'2026-02-10/2026-02-12'
		);
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

		await getDayButton('2026-02-16').click();

		await expect
			.poll(() => document.querySelector('[data-testid="date-range-picker-value"]')?.textContent)
			.toBe('2026-02-14/2026-02-16');
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		await expect.poll(() => document.activeElement).toBe(trigger.element());
	});

	it('normalizes reverse calendar selection', async () => {
		const screen = render(DateRangePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		await trigger.click();
		await getDayButton('2026-02-18').click();
		await getDayButton('2026-02-15').click();

		await expect
			.poll(() => document.querySelector('[data-testid="date-range-picker-value"]')?.textContent)
			.toBe('2026-02-15/2026-02-18');
	});

	it('supports bind:open and bind:value updates', async () => {
		const screen = render(DateRangePickerBindableTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		expect(document.querySelector('[data-testid="bind-open"]')?.textContent).toBe('false');
		expect(document.querySelector('[data-testid="bind-value"]')?.textContent).toBe(
			'2026-02-10/2026-02-12'
		);

		await trigger.click();
		await expect
			.poll(() => document.querySelector('[data-testid="bind-open"]')?.textContent)
			.toBe('true');

		await getDayButton('2026-02-14').click();
		await getDayButton('2026-02-16').click();

		await expect
			.poll(() => document.querySelector('[data-testid="bind-value"]')?.textContent)
			.toBe('2026-02-14/2026-02-16');
	});

	it('serializes start and end hidden input values independently', () => {
		render(DateRangePickerTest, {
			startInputId: 'trip-start',
			startInputName: 'tripStart',
			endInputId: 'trip-end',
			endInputName: 'tripEnd'
		});

		const startInput = document.querySelector<HTMLInputElement>('input[name="tripStart"]');
		const endInput = document.querySelector<HTMLInputElement>('input[name="tripEnd"]');

		expect(startInput?.value).toBe('2026-02-10');
		expect(endInput?.value).toBe('2026-02-12');
	});

	it('clears public value when typing makes one side invalid', async () => {
		render(DateRangePickerTest);
		const daySegment = getSegment('start', 'day');

		daySegment.element()?.focus();
		await userEvent.keyboard('{Backspace}{Backspace}');

		await expect
			.poll(() => document.querySelector('[data-testid="date-range-picker-value"]')?.textContent)
			.toBe('');
		await expect
			.poll(() =>
				document
					.querySelector('[role="group"][aria-label="Start date"]')
					?.getAttribute('aria-invalid')
			)
			.toBe('true');
	});

	describe('typing a range never corrupts segments by sorting mid-input', () => {
		it('keeps both years intact when the end year is typed digit by digit', async () => {
			render(DateRangePickerTest, { defaultValue: null });

			await typeSegment('start', 'day', '20');
			await typeSegment('start', 'month', '1');
			await typeSegment('start', 'year', '2000');
			await typeSegment('end', 'day', '30');
			await typeSegment('end', 'month', '1');
			await typeSegment('end', 'year', '2000');

			await expect
				.poll(() => document.querySelector('[data-testid="date-range-picker-value"]')?.textContent)
				.toBe('2000-01-20/2000-01-30');

			// Visible segments must reflect exactly what was typed, never a partial
			// year (e.g. "2") promoted to a sorted "0002".
			expect(segmentText('start', 'day')).toBe('20');
			expect(segmentText('start', 'month')).toBe('1');
			expect(segmentText('start', 'year')).toBe('2000');
			expect(segmentText('end', 'day')).toBe('30');
			expect(segmentText('end', 'month')).toBe('1');
			expect(segmentText('end', 'year')).toBe('2000');
		});

		it('does not swap segments on any intermediate year keystroke', async () => {
			render(DateRangePickerTest, { defaultValue: null });

			await typeSegment('start', 'day', '20');
			await typeSegment('start', 'month', '1');
			await typeSegment('start', 'year', '2000');
			await typeSegment('end', 'day', '30');
			await typeSegment('end', 'month', '1');

			// Type the end year one digit at a time. After the first digit the
			// partial end date ("0002-01-30") sorts before the start ("2000-01-20"),
			// which previously swapped and froze the start segments.
			const endYear = getSegment('end', 'year').element();
			endYear.focus();

			for (const digit of '2000') {
				await userEvent.keyboard(digit);
				expect(segmentText('start', 'day')).toBe('20');
				expect(segmentText('start', 'month')).toBe('1');
				expect(segmentText('start', 'year')).toBe('2000');
			}

			await expect
				.poll(() => document.querySelector('[data-testid="date-range-picker-value"]')?.textContent)
				.toBe('2000-01-20/2000-01-30');
		});

		it('publishes a normalized value while keeping drafts as typed when end precedes start', async () => {
			render(DateRangePickerTest, { defaultValue: null });

			await typeSegment('start', 'day', '20');
			await typeSegment('start', 'month', '1');
			await typeSegment('start', 'year', '2000');
			await typeSegment('end', 'day', '10');
			await typeSegment('end', 'month', '1');
			await typeSegment('end', 'year', '2000');

			// Public value is sorted ascending...
			await expect
				.poll(() => document.querySelector('[data-testid="date-range-picker-value"]')?.textContent)
				.toBe('2000-01-10/2000-01-20');

			// ...but the inputs still show exactly what the user typed.
			expect(segmentText('start', 'day')).toBe('20');
			expect(segmentText('end', 'day')).toBe('10');
		});

		it('clears the public value while one side is mid-typing and republishes once valid', async () => {
			render(DateRangePickerTest, { defaultValue: null });

			await typeSegment('start', 'day', '20');
			await typeSegment('start', 'month', '1');
			await typeSegment('start', 'year', '2000');

			// Start is fully typed but end is still empty: no commitable range yet.
			await expect
				.poll(() => document.querySelector('[data-testid="date-range-picker-value"]')?.textContent)
				.toBe('');

			await typeSegment('end', 'day', '30');
			await typeSegment('end', 'month', '1');
			await typeSegment('end', 'year', '2000');

			await expect
				.poll(() => document.querySelector('[data-testid="date-range-picker-value"]')?.textContent)
				.toBe('2000-01-20/2000-01-30');
		});
	});

	it('never sets focus data attributes to false', async () => {
		const screen = render(DateRangePickerTest);
		const monthSegment = getSegment('start', 'month');
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		monthSegment.element()?.focus();
		await userEvent.keyboard('{ArrowUp}');
		await trigger.click();

		expectNoFalseFocusAttributes(document);
	});
});
