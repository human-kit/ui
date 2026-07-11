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

async function typeSegment(part: 'start' | 'end', type: 'day' | 'month' | 'year', digits: string) {
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

	it('exposes role="group" on the root only when it is labeled', async () => {
		render(DateRangePickerTest, { rootAriaLabel: 'Stay dates' });
		const labeledRoot = document.querySelector('[aria-label="Stay dates"]');
		expect(labeledRoot?.getAttribute('role')).toBe('group');
	});

	it('renders the root without a role when it has no label', async () => {
		render(DateRangePickerTest);
		const root = document.querySelector('[aria-label="Start date"]')?.parentElement;
		expect(root?.getAttribute('role')).toBeNull();
		expect(root?.getAttribute('aria-label')).toBeNull();
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
		// The invalid signal is per part: only the start group and its segments
		// are flagged; the still-valid end input stays untouched.
		await expect
			.poll(() =>
				document
					.querySelector('[role="group"][aria-label="Start date"]')
					?.getAttribute('data-invalid')
			)
			.toBe('true');
		expect(
			document.querySelector('[role="group"][aria-label="End date"]')?.getAttribute('data-invalid')
		).toBeNull();
		expect(getSegment('start', 'day').element()?.getAttribute('aria-invalid')).toBe('true');
		expect(getSegment('end', 'day').element()?.getAttribute('aria-invalid')).toBeNull();
	});

	it('announces a localized "Empty" for placeholder segments instead of the raw placeholder', async () => {
		render(DateRangePickerTest, { defaultValue: null });

		expect(getSegment('start', 'day').element()?.getAttribute('data-placeholder')).toBe('true');
		expect(getSegment('start', 'day').element()?.getAttribute('aria-valuetext')).toBe('Empty');
		expect(getSegment('end', 'year').element()?.getAttribute('aria-valuetext')).toBe('Empty');
	});

	it('derives day aria-valuemax from the draft month and year', async () => {
		render(DateRangePickerTest);

		// February 2026 has 28 days.
		expect(getSegment('start', 'day').element()?.getAttribute('aria-valuemax')).toBe('28');
		expect(getSegment('end', 'day').element()?.getAttribute('aria-valuemax')).toBe('28');

		// Clearing the start month falls back to the static maximum for that part only.
		getSegment('start', 'month').element()?.focus();
		await userEvent.keyboard('{Delete}');
		await expect
			.poll(() => getSegment('start', 'day').element()?.getAttribute('aria-valuemax'))
			.toBe('31');
		expect(getSegment('end', 'day').element()?.getAttribute('aria-valuemax')).toBe('28');
	});

	it('starts a new day entry when the appended digit would overflow the maximum', async () => {
		render(DateRangePickerTest, { defaultValue: null });

		// 35 overflows the day maximum, so 5 starts a new entry instead of
		// silently clamping to 31 (React Aria behavior).
		await typeSegment('start', 'day', '35');

		await expect.poll(() => segmentText('start', 'day')).toBe('5');
	});

	it('exposes aria-invalid on segments instead of the group element', async () => {
		render(DateRangePickerTest);
		const daySegment = getSegment('start', 'day');

		daySegment.element()?.focus();
		await userEvent.keyboard('{Backspace}{Backspace}');

		await expect
			.poll(() => getSegment('start', 'month').element()?.getAttribute('aria-invalid'))
			.toBe('true');
		expect(
			document.querySelector('[role="group"][aria-label="Start date"]')?.getAttribute('aria-invalid')
		).toBeNull();
	});

	it('does not mark either input invalid while a valid start awaits an empty end', async () => {
		render(DateRangePickerTest, { defaultValue: null });

		await typeSegment('start', 'day', '20');
		await typeSegment('start', 'month', '1');
		await typeSegment('start', 'year', '2000');

		await expect
			.poll(() =>
				document
					.querySelector('[role="group"][aria-label="Start date"]')
					?.getAttribute('data-invalid')
			)
			.toBeNull();
		expect(
			document.querySelector('[role="group"][aria-label="End date"]')?.getAttribute('data-invalid')
		).toBeNull();
		expect(getSegment('start', 'day').element()?.getAttribute('aria-invalid')).toBeNull();
		expect(getSegment('end', 'day').element()?.getAttribute('aria-invalid')).toBeNull();
	});

	it('does not prevent default for Ctrl+C or Escape on a focused segment', async () => {
		render(DateRangePickerTest);
		const daySegment = getSegment('start', 'day');

		daySegment.element()?.focus();
		const copyEvent = new KeyboardEvent('keydown', {
			key: 'c',
			ctrlKey: true,
			bubbles: true,
			cancelable: true
		});
		expect(daySegment.element()?.dispatchEvent(copyEvent)).toBe(true);

		const escapeEvent = new KeyboardEvent('keydown', {
			key: 'Escape',
			bubbles: true,
			cancelable: true
		});
		expect(daySegment.element()?.dispatchEvent(escapeEvent)).toBe(true);
	});

	it('routes beforeinput insertText digits to segment typing', async () => {
		render(DateRangePickerTest, { defaultValue: null });
		const daySegment = getSegment('start', 'day');

		daySegment.element()?.focus();
		const event = new InputEvent('beforeinput', {
			inputType: 'insertText',
			data: '5',
			bubbles: true,
			cancelable: true
		});
		const wasNotCanceled = daySegment.element()?.dispatchEvent(event);

		expect(wasNotCanceled).toBe(false);
		await expect.poll(() => segmentText('start', 'day')).toBe('5');
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

	it('renders hidden proxy inputs with autocomplete="off" so autofill cannot write into them', () => {
		render(DateRangePickerTest, {
			startInputName: 'tripStart',
			endInputName: 'tripEnd'
		});

		expect(
			document.querySelector<HTMLInputElement>('input[name="tripStart"]')?.getAttribute(
				'autocomplete'
			)
		).toBe('off');
		expect(
			document
				.querySelector<HTMLInputElement>('input[name="tripEnd"]')
				?.getAttribute('autocomplete')
		).toBe('off');
	});

	describe('typed ranges validate interior unavailable days', () => {
		it('does not commit a typed range that crosses an unavailable day and flags both parts', async () => {
			render(DateRangePickerTest, {
				defaultValue: null,
				isDateUnavailable: (date: string) => date === '2026-02-15'
			});

			await typeSegment('start', 'day', '10');
			await typeSegment('start', 'month', '2');
			await typeSegment('start', 'year', '2026');
			await typeSegment('end', 'day', '20');
			await typeSegment('end', 'month', '2');
			await typeSegment('end', 'year', '2026');

			// The endpoints are valid but 2026-02-15 sits inside the path: the
			// range must not be published.
			await expect
				.poll(() => document.querySelector('[data-testid="date-range-picker-value"]')?.textContent)
				.toBe('');

			// The blocked path belongs to the (start, end) pair, so both inputs
			// flag invalid through the per-part mechanism.
			await expect
				.poll(() =>
					document
						.querySelector('[role="group"][aria-label="Start date"]')
						?.getAttribute('data-invalid')
				)
				.toBe('true');
			expect(
				document.querySelector('[role="group"][aria-label="End date"]')?.getAttribute('data-invalid')
			).toBe('true');
		});

		it('clears a previously committed value when typing turns the range path unavailable', async () => {
			render(DateRangePickerTest, {
				defaultValue: { start: '2026-02-10', end: '2026-02-12' },
				isDateUnavailable: (date: string) => date === '2026-02-15'
			});

			// Extend the end past the unavailable day: 2026-02-12 -> 2026-02-20.
			await typeSegment('end', 'day', '20');

			await expect
				.poll(() => document.querySelector('[data-testid="date-range-picker-value"]')?.textContent)
				.toBe('');
		});

		it('commits a typed range that does not cross unavailable days', async () => {
			render(DateRangePickerTest, {
				defaultValue: null,
				isDateUnavailable: (date: string) => date === '2026-02-15'
			});

			await typeSegment('start', 'day', '10');
			await typeSegment('start', 'month', '2');
			await typeSegment('start', 'year', '2026');
			await typeSegment('end', 'day', '14');
			await typeSegment('end', 'month', '2');
			await typeSegment('end', 'year', '2026');

			await expect
				.poll(() => document.querySelector('[data-testid="date-range-picker-value"]')?.textContent)
				.toBe('2026-02-10/2026-02-14');
			expect(
				document
					.querySelector('[role="group"][aria-label="Start date"]')
					?.getAttribute('data-invalid')
			).toBeNull();
		});
	});
});
