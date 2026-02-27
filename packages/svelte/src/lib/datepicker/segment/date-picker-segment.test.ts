import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import DatePickerTest from '../root/date-picker-test.svelte';
import DatePickerEmptyTest from '../root/date-picker-empty-test.svelte';
import DatePickerLocaleTypingTest from '../root/date-picker-locale-typing-test.svelte';
import DatePickerBindableTest from '../root/date-picker-bindable-test.svelte';

function getSegment(type: 'day' | 'month' | 'year') {
	const elements = document.querySelectorAll<HTMLElement>(
		`[role="spinbutton"][data-type="${type}"]`
	);
	const element = elements.item(elements.length - 1);
	if (!element) {
		throw new Error(`Segment "${type}" was not rendered.`);
	}

	return {
		element: () => element,
		click: () => element.click()
	};
}

function getEditableSegmentOrder(): Array<'day' | 'month' | 'year'> {
	return Array.from(document.querySelectorAll<HTMLElement>('[role="spinbutton"][data-type]'))
		.map((element) => element.getAttribute('data-type'))
		.filter(
			(type): type is 'day' | 'month' | 'year' =>
				type === 'day' || type === 'month' || type === 'year'
		);
}

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

	it('exposes spinbutton ARIA contract', async () => {
		render(DatePickerTest);
		const monthSegment = getSegment('month');

		expect(monthSegment.element()?.getAttribute('aria-valuemin')).toBe('1');
		expect(monthSegment.element()?.getAttribute('aria-valuemax')).toBe('12');
		expect(monthSegment.element()?.getAttribute('aria-valuenow')).toBe('2');
		expect(monthSegment.element()?.getAttribute('aria-valuetext')).toContain('February');
		expect(monthSegment.element()?.getAttribute('aria-labelledby')).toBeNull();
		expect(monthSegment.element()?.getAttribute('aria-label')).toMatch(/month/i);
	});

	it('sets focused state when a segment receives focus', async () => {
		render(DatePickerTest);
		const monthSegment = getSegment('month');

		monthSegment.element()?.focus();
		await expect.poll(() => monthSegment.element()?.getAttribute('data-focused')).toBe('true');
	});

	it('sets data-focus-visible on keyboard interaction', async () => {
		render(DatePickerTest);
		const monthSegment = getSegment('month');

		monthSegment.element()?.focus();
		await userEvent.keyboard('{ArrowUp}');

		await expect
			.poll(() => monthSegment.element()?.getAttribute('data-focus-visible'))
			.toBe('true');
	});

	it('toggles root data-focus-within when focus enters and leaves date picker', async () => {
		const screen = render(DatePickerTest);
		const monthSegment = getSegment('month');
		const outsideButton = screen.getByTestId('outside-button');

		monthSegment.element()?.focus();
		await expect.poll(() => document.querySelector('[data-focus-within="true"]')).toBeTruthy();

		outsideButton.element()?.focus();
		await expect.poll(() => document.querySelector('[data-focus-within="true"]')).toBeNull();
	});

	it('marks segment as readonly in readOnly mode', async () => {
		render(DatePickerTest, { isReadOnly: true });
		const monthSegment = getSegment('month');

		expect(monthSegment.element()?.getAttribute('aria-readonly')).toBe('true');
		expect(monthSegment.element()?.getAttribute('contenteditable')).toBe('false');
	});

	it('disables segment interaction in disabled mode', async () => {
		render(DatePickerTest, { isDisabled: true });
		const monthSegment = getSegment('month');

		expect(monthSegment.element()?.getAttribute('aria-disabled')).toBe('true');
		expect(monthSegment.element()?.getAttribute('tabindex')).toBe('-1');
	});

	it('does not set focus states when clicking a disabled segment', async () => {
		render(DatePickerTest, { isDisabled: true });
		const monthSegment = getSegment('month');

		monthSegment
			.element()
			?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		monthSegment
			.element()
			?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
		expect(monthSegment.element()?.getAttribute('data-focused')).toBeNull();
		expect(document.querySelector('[data-focus-within="true"]')).toBeNull();
	});

	it('focuses segment immediately on click', async () => {
		render(DatePickerTest);
		const monthSegment = getSegment('month');

		await monthSegment.click();
		expect(document.activeElement).toBe(monthSegment.element());
	});

	it('increments segment value with ArrowUp', async () => {
		render(DatePickerTest);
		const daySegment = getSegment('day');

		daySegment.element()?.focus();
		await userEvent.keyboard('{ArrowUp}');

		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-value"]')?.textContent)
			.toBe('2026-02-11');
	});

	it('increments year segment value with ArrowUp', async () => {
		render(DatePickerTest);
		const yearSegment = getSegment('year');

		yearSegment.element()?.focus();
		await userEvent.keyboard('{ArrowUp}');

		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-value"]')?.textContent)
			.toBe('2027-02-10');
	});

	it('supports Home and End keys for boundaries', async () => {
		render(DatePickerTest);
		const monthSegment = getSegment('month');

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

	it('clears committed value when draft becomes incomplete', async () => {
		render(DatePickerBindableTest);
		const daySegment = getSegment('day');

		daySegment.element()?.focus();
		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('{Backspace}');

		await expect
			.poll(() => document.querySelector('[data-testid="bind-value"]')?.textContent)
			.toBe('');
	});

	it('supports PageUp and PageDown steps', async () => {
		render(DatePickerTest);
		const yearSegment = getSegment('year');

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
		render(DatePickerTest);
		const daySegment = getSegment('day');

		daySegment.element()?.focus();
		await userEvent.keyboard('{Delete}');
		expect(daySegment.element()?.textContent).toBe('1');
	});

	it('removes one character with Backspace', async () => {
		render(DatePickerTest);
		const daySegment = getSegment('day');

		daySegment.element()?.focus();
		await userEvent.keyboard('{Backspace}');
		expect(daySegment.element()?.textContent).toBe('1');
	});

	it('does not commit full date when only one segment is edited', async () => {
		render(DatePickerEmptyTest);
		const daySegment = getSegment('day');

		daySegment.element()?.focus();
		await userEvent.keyboard('1');
		await userEvent.keyboard('5');

		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-value"]')?.textContent)
			.toBe('');
	});

	it('auto-advances focus when a segment is completed', async () => {
		render(DatePickerEmptyTest);
		const daySegment = getSegment('day');

		daySegment.element()?.focus();
		await userEvent.keyboard('1');
		await userEvent.keyboard('5');

		expect(document.activeElement?.getAttribute('data-type')).not.toBe('day');
	});

	it('auto-advances when entering 01 in day segment', async () => {
		render(DatePickerEmptyTest);
		const daySegment = getSegment('day');

		daySegment.element()?.focus();
		await userEvent.keyboard('0');
		await userEvent.keyboard('1');

		expect(daySegment.element()?.textContent).toBe('1');
		expect(document.activeElement?.getAttribute('data-type')).toBe('month');
	});

	it('auto-advances day on first digit when second digit cannot be valid', async () => {
		render(DatePickerEmptyTest);
		const daySegment = getSegment('day');

		daySegment.element()?.focus();
		await userEvent.keyboard('7');

		expect(daySegment.element()?.textContent).toBe('7');
		expect(document.activeElement?.getAttribute('data-type')).toBe('month');
	});

	it('auto-advances month on first digit when second digit cannot be valid', async () => {
		render(DatePickerEmptyTest);
		const daySegment = getSegment('day');

		daySegment.element()?.focus();
		await userEvent.keyboard('7');
		await userEvent.keyboard('8');

		expect(document.activeElement?.getAttribute('data-type')).toBe('year');
	});

	it('prevents impossible two-digit month/day typing by auto-completing first digit', async () => {
		render(DatePickerEmptyTest);
		const daySegment = getSegment('day');
		const monthSegment = getSegment('month');

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
		render(DatePickerEmptyTest);
		const daySegment = getSegment('day');
		const monthSegment = getSegment('month');
		const yearSegment = getSegment('year');

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
		render(DatePickerEmptyTest);
		const daySegment = getSegment('day');
		const monthSegment = getSegment('month');
		const yearSegment = getSegment('year');

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
		render(DatePickerLocaleTypingTest);
		const daySegment = getSegment('day');

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

	it('keeps focus on year after completion and loops typing instead of focusing trigger', async () => {
		render(DatePickerLocaleTypingTest);
		const daySegment = getSegment('day');
		const yearSegment = getSegment('year');

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

		expect(document.activeElement?.getAttribute('data-type')).toBe('year');
		await userEvent.keyboard('3');
		expect(document.activeElement?.getAttribute('data-type')).toBe('year');
		expect(yearSegment.element()?.textContent).toBe('3');
	});

	it('commits 2/1/2 as 0002-01-02 in day-first locale', async () => {
		render(DatePickerLocaleTypingTest);
		const daySegment = getSegment('day');

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
		render(DatePickerEmptyTest);
		const daySegment = getSegment('day');
		const monthSegment = getSegment('month');
		const yearSegment = getSegment('year');

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
		render(DatePickerTest);
		const yearSegment = getSegment('year');
		const segmentOrder = getEditableSegmentOrder();
		const yearIndex = segmentOrder.indexOf('year');
		const expectedPreviousType = yearIndex > 0 ? segmentOrder[yearIndex - 1] : 'year';

		yearSegment.element()?.focus();
		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('{Backspace}');

		expect(document.activeElement?.getAttribute('data-type')).toBe(expectedPreviousType);
	});

	it('cancels selectstart on placeholder segment', async () => {
		render(DatePickerEmptyTest);
		const daySegment = getSegment('day');
		const event = new Event('selectstart', { cancelable: true });

		const wasNotCanceled = daySegment.element()?.dispatchEvent(event);

		expect(wasNotCanceled).toBe(false);
	});
});
