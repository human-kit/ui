import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import DatePickerTest from '../root/date-picker-test.svelte';
import DatePickerEmptyTest from '../root/date-picker-empty-test.svelte';
import DatePickerLocaleTypingTest from '../root/date-picker-locale-typing-test.svelte';
import DatePickerBindableTest from '../root/date-picker-bindable-test.svelte';

describe('DatePicker.Segment', () => {
	afterEach(() => {
		const dialogs = document.querySelectorAll('[role="dialog"]');
		dialogs.forEach((dialog) => dialog.remove());
	});

	it('renders literal separators as non-interactive elements', async () => {
		render(DatePickerTest);
		const literal = document.querySelector('[data-type="literal"]');

		expect(literal).toBeTruthy();
		expect(literal?.tagName.toLowerCase()).toBe('span');
	});

	it('sets focused state when a segment receives focus', async () => {
		const screen = render(DatePickerTest);
		const monthSegment = screen.getByRole('spinbutton', { name: 'month, ' });

		monthSegment.element()?.focus();
		await expect.poll(() => monthSegment.element()?.getAttribute('data-focused')).toBe('true');
	});

	it('sets data-focus-visible on keyboard interaction', async () => {
		const screen = render(DatePickerTest);
		const monthSegment = screen.getByRole('spinbutton', { name: 'month, ' });

		monthSegment.element()?.focus();
		await userEvent.keyboard('{ArrowUp}');

		await expect.poll(() => monthSegment.element()?.getAttribute('data-focus-visible')).toBe('true');
	});

	it('toggles root data-focus-within when focus enters and leaves date picker', async () => {
		const screen = render(DatePickerTest);
		const monthSegment = screen.getByRole('spinbutton', { name: 'month, ' });
		const outsideButton = screen.getByTestId('outside-button');

		monthSegment.element()?.focus();
		await expect.poll(() => document.querySelector('[data-focus-within="true"]')).toBeTruthy();

		outsideButton.element()?.focus();
		await expect.poll(() => document.querySelector('[data-focus-within="true"]')).toBeNull();
	});

	it('focuses segment immediately on click', async () => {
		const screen = render(DatePickerTest);
		const monthSegment = screen.getByRole('spinbutton', { name: 'month, ' });

		await monthSegment.click();
		expect(document.activeElement).toBe(monthSegment.element());
	});

	it('increments segment value with ArrowUp', async () => {
		const screen = render(DatePickerTest);
		const daySegment = screen.getByRole('spinbutton', { name: 'day, ' });

		daySegment.element()?.focus();
		await userEvent.keyboard('{ArrowUp}');

		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-value"]')?.textContent)
			.toBe('2026-02-11');
	});

	it('increments year segment value with ArrowUp', async () => {
		const screen = render(DatePickerTest);
		const yearSegment = screen.getByRole('spinbutton', { name: 'year, ' });

		yearSegment.element()?.focus();
		await userEvent.keyboard('{ArrowUp}');

		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-value"]')?.textContent)
			.toBe('2027-02-10');
	});

	it('supports Home and End keys for boundaries', async () => {
		const screen = render(DatePickerTest);
		const monthSegment = screen.getByRole('spinbutton', { name: 'month, ' });

		monthSegment.element()?.focus();
		await userEvent.keyboard('{Home}');
		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-value"]')?.textContent)
			.toBe('2026-01-10');

		await userEvent.keyboard('{End}');
		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-value"]')?.textContent)
			.toBe('2026-12-10');
	});

	it('clears bound value when draft becomes incomplete', async () => {
		const screen = render(DatePickerBindableTest);
		const daySegment = screen.getByRole('spinbutton', { name: 'day, ' });

		daySegment.element()?.focus();
		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('{Backspace}');

		await expect
			.poll(() => document.querySelector('[data-testid="bind-value"]')?.textContent)
			.toBe('');
	});

	it('supports PageUp and PageDown steps', async () => {
		const screen = render(DatePickerTest);
		const yearSegment = screen.getByRole('spinbutton', { name: 'year, ' });

		yearSegment.element()?.focus();
		await userEvent.keyboard('{PageUp}');
		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-value"]')?.textContent)
			.toBe('2036-02-10');

		await userEvent.keyboard('{PageDown}');
		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-value"]')?.textContent)
			.toBe('2026-02-10');
	});

	it('clears segment with Delete', async () => {
		const screen = render(DatePickerTest);
		const daySegment = screen.getByRole('spinbutton', { name: 'day, ' });

		daySegment.element()?.focus();
		await userEvent.keyboard('{Delete}');
		expect(daySegment.element()?.textContent).toBe('1');
	});

	it('removes one character with Backspace', async () => {
		const screen = render(DatePickerTest);
		const daySegment = screen.getByRole('spinbutton', { name: 'day, ' });

		daySegment.element()?.focus();
		await userEvent.keyboard('{Backspace}');
		expect(daySegment.element()?.textContent).toBe('1');
	});

	it('does not commit full date when only one segment is edited', async () => {
		const screen = render(DatePickerEmptyTest);
		const daySegment = screen.getByRole('spinbutton', { name: 'day, ' });

		daySegment.element()?.focus();
		await userEvent.keyboard('1');
		await userEvent.keyboard('5');

		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-value"]')?.textContent)
			.toBe('');
	});

	it('auto-advances focus when a segment is completed', async () => {
		const screen = render(DatePickerEmptyTest);
		const daySegment = screen.getByRole('spinbutton', { name: 'day, ' });

		daySegment.element()?.focus();
		await userEvent.keyboard('1');
		await userEvent.keyboard('5');

		expect(document.activeElement?.getAttribute('data-type')).not.toBe('day');
	});

	it('auto-advances when entering 01 in day segment', async () => {
		const screen = render(DatePickerEmptyTest);
		const daySegment = screen.getByRole('spinbutton', { name: 'day, ' });

		daySegment.element()?.focus();
		await userEvent.keyboard('0');
		await userEvent.keyboard('1');

		expect(daySegment.element()?.textContent).toBe('1');
		expect(document.activeElement?.getAttribute('data-type')).toBe('month');
	});

	it('auto-advances day on first digit when second digit cannot be valid', async () => {
		const screen = render(DatePickerEmptyTest);
		const daySegment = screen.getByRole('spinbutton', { name: 'day, ' });

		daySegment.element()?.focus();
		await userEvent.keyboard('7');

		expect(daySegment.element()?.textContent).toBe('7');
		expect(document.activeElement?.getAttribute('data-type')).toBe('month');
	});

	it('auto-advances month on first digit when second digit cannot be valid', async () => {
		const screen = render(DatePickerEmptyTest);
		const daySegment = screen.getByRole('spinbutton', { name: 'day, ' });

		daySegment.element()?.focus();
		await userEvent.keyboard('7');
		await userEvent.keyboard('8');

		expect(document.activeElement?.getAttribute('data-type')).toBe('year');
	});

	it('prevents impossible two-digit month/day typing by auto-completing first digit', async () => {
		const screen = render(DatePickerEmptyTest);
		const daySegment = screen.getByRole('spinbutton', { name: 'day, ' });
		const monthSegment = screen.getByRole('spinbutton', { name: 'month, ' });

		monthSegment.element()?.focus();
		await userEvent.keyboard('3');
		await userEvent.keyboard('0');
		expect(monthSegment.element()?.textContent).toBe('3');

		daySegment.element()?.focus();
		await userEvent.keyboard('9');
		await userEvent.keyboard('9');
		expect(daySegment.element()?.textContent).toBe('9');
	});

	it('auto-adjusts day to leap-year max when month or year changes', async () => {
		const screen = render(DatePickerEmptyTest);
		const daySegment = screen.getByRole('spinbutton', { name: 'day, ' });
		const monthSegment = screen.getByRole('spinbutton', { name: 'month, ' });
		const yearSegment = screen.getByRole('spinbutton', { name: 'year, ' });

		daySegment.element()?.focus();
		await userEvent.keyboard('3');
		await userEvent.keyboard('1');
		await userEvent.keyboard('/');
		await userEvent.keyboard('1');
		await userEvent.keyboard('/');
		await userEvent.keyboard('2');
		await userEvent.keyboard('0');
		await userEvent.keyboard('0');
		await userEvent.keyboard('0');

		monthSegment.element()?.focus();
		await userEvent.keyboard('2');

		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-value"]')?.textContent)
			.toBe('2000-02-29');
		expect(daySegment.element()?.textContent).toBe('29');
		expect(monthSegment.element()?.textContent).toBe('2');
		expect(yearSegment.element()?.textContent).toBe('2000');
	});

	it('commits value when all segments become valid', async () => {
		const screen = render(DatePickerEmptyTest);
		const daySegment = screen.getByRole('spinbutton', { name: 'day, ' });
		const monthSegment = screen.getByRole('spinbutton', { name: 'month, ' });
		const yearSegment = screen.getByRole('spinbutton', { name: 'year, ' });

		daySegment.element()?.focus();
		await userEvent.keyboard('0');
		await userEvent.keyboard('1');

		monthSegment.element()?.focus();
		await userEvent.keyboard('0');
		await userEvent.keyboard('1');

		yearSegment.element()?.focus();
		await userEvent.keyboard('2');
		await userEvent.keyboard('0');
		await userEvent.keyboard('0');
		await userEvent.keyboard('0');

		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-value"]')?.textContent)
			.toBe('2000-01-01');
	});

	it('commits 20/01/2000 when typing in day-first locale', async () => {
		const screen = render(DatePickerLocaleTypingTest);
		const daySegment = screen.getByRole('spinbutton', { name: 'day, ' });

		daySegment.element()?.focus();
		await userEvent.keyboard('2');
		await userEvent.keyboard('0');
		await userEvent.keyboard('/');
		await userEvent.keyboard('1');
		await userEvent.keyboard('/');
		await userEvent.keyboard('2');
		await userEvent.keyboard('0');
		await userEvent.keyboard('0');
		await userEvent.keyboard('0');

		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-value"]')?.textContent)
			.toBe('2000-01-20');
	});

	it('commits 2/1/2 as 0002-01-02 in day-first locale', async () => {
		const screen = render(DatePickerLocaleTypingTest);
		const daySegment = screen.getByRole('spinbutton', { name: 'day, ' });

		daySegment.element()?.focus();
		await userEvent.keyboard('2');
		await userEvent.keyboard('/');
		await userEvent.keyboard('1');
		await userEvent.keyboard('/');
		await userEvent.keyboard('2');

		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-value"]')?.textContent)
			.toBe('0002-01-02');
	});

	it('shows segments with minimal digits after committing a valid date', async () => {
		const screen = render(DatePickerEmptyTest);
		const daySegment = screen.getByRole('spinbutton', { name: 'day, ' });
		const monthSegment = screen.getByRole('spinbutton', { name: 'month, ' });
		const yearSegment = screen.getByRole('spinbutton', { name: 'year, ' });

		daySegment.element()?.focus();
		await userEvent.keyboard('0');
		await userEvent.keyboard('2');
		await userEvent.keyboard('/');
		await userEvent.keyboard('0');
		await userEvent.keyboard('1');
		await userEvent.keyboard('/');
		await userEvent.keyboard('0');
		await userEvent.keyboard('0');
		await userEvent.keyboard('0');
		await userEvent.keyboard('2');

		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-value"]')?.textContent)
			.toBe('0002-01-02');

		expect(daySegment.element()?.textContent).toBe('2');
		expect(monthSegment.element()?.textContent).toBe('1');
		expect(yearSegment.element()?.textContent).toBe('2');
	});

	it('moves focus to previous segment on backspace when current segment is empty', async () => {
		const screen = render(DatePickerTest);
		const yearSegment = screen.getByRole('spinbutton', { name: 'year, ' });

		yearSegment.element()?.focus();
		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('{Backspace}');

		expect(document.activeElement?.getAttribute('data-type')).toBe('month');
	});

	it('cancels selectstart on placeholder segment', async () => {
		const screen = render(DatePickerEmptyTest);
		const daySegment = screen.getByRole('spinbutton', { name: 'day, ' });
		const event = new Event('selectstart', { cancelable: true });

		const wasNotCanceled = daySegment.element()?.dispatchEvent(event);

		expect(wasNotCanceled).toBe(false);
	});
});
