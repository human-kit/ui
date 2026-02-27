import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import DatePickerTest from '../root/date-picker-test.svelte';
import DatePickerEmptyTest from '../root/date-picker-empty-test.svelte';

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

describe('DatePicker.Input', () => {
	afterEach(() => {
		const dialogs = document.querySelectorAll('[role="dialog"]');
		dialogs.forEach((dialog) => dialog.remove());
	});

	it('renders editable spinbutton segments (day, month, year)', async () => {
		render(DatePickerTest);

		const day = document.querySelector('[role="spinbutton"][data-type="day"]');
		const month = document.querySelector('[role="spinbutton"][data-type="month"]');
		const year = document.querySelector('[role="spinbutton"][data-type="year"]');

		expect(day).toBeTruthy();
		expect(month).toBeTruthy();
		expect(year).toBeTruthy();
	});

	it('does not open popover when segment is clicked', async () => {
		render(DatePickerTest);
		const daySegment = getSegment('day');

		await daySegment.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
	});

	it('focuses a segment when clicking input container', async () => {
		const screen = render(DatePickerTest);
		const inputGroup = screen.getByRole('group', { name: 'Date input' });

		await inputGroup.click();

		await expect
			.poll(() => document.activeElement?.getAttribute('data-date-picker-segment'))
			.toBe('true');
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
	});

	it('focuses the next available segment when clicking input container', async () => {
		const screen = render(DatePickerEmptyTest);
		const inputGroup = screen.getByRole('group', { name: 'Date input' });
		const segments = Array.from(
			document.querySelectorAll<HTMLElement>('[data-date-picker-segment="true"]')
		);

		segments[0]?.focus();
		await userEvent.keyboard('1');
		await userEvent.keyboard('5');

		await inputGroup.click();

		const focusedType = document.activeElement?.getAttribute('data-type');
		expect(focusedType).not.toBe(segments[0]?.getAttribute('data-type'));
		expect(document.activeElement?.getAttribute('data-placeholder')).toBe('true');
	});

	it('focuses the last segment when all segments are complete', async () => {
		const screen = render(DatePickerTest);
		const inputGroup = screen.getByRole('group', { name: 'Date input' });

		await inputGroup.click();

		const segmentElements = Array.from(
			document.querySelectorAll<HTMLElement>('[data-date-picker-segment="true"]')
		);
		expect(document.activeElement).toBe(segmentElements[segmentElements.length - 1]);
	});

	it('moves focus to trigger with ArrowRight from last segment', async () => {
		const screen = render(DatePickerTest);
		const yearSegment = getSegment('year');
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		yearSegment.element()?.focus();
		await userEvent.keyboard('{ArrowUp}');
		await expect.poll(() => yearSegment.element()?.getAttribute('data-focus-visible')).toBe('true');
		await userEvent.keyboard('{ArrowRight}');

		expect(document.activeElement).toBe(trigger.element());
		await expect.poll(() => trigger.element()?.getAttribute('data-focus-visible')).toBe('true');
		await expect.poll(() => yearSegment.element()?.getAttribute('data-focused')).toBeNull();
		await expect.poll(() => yearSegment.element()?.getAttribute('data-focus-visible')).toBeNull();
	});

	it('uses a group role with provided accessible label', async () => {
		const screen = render(DatePickerTest);
		const inputGroup = screen.getByRole('group', { name: 'Date input' });

		expect(inputGroup.element()?.getAttribute('id')).toContain('-input');
	});

	it('does not move focus into segments when disabled', async () => {
		const screen = render(DatePickerTest, { isDisabled: true });
		const inputGroup = screen.getByRole('group', { name: 'Date input' });

		await inputGroup.click();
		expect(document.activeElement?.getAttribute('data-date-picker-segment')).not.toBe('true');
	});
});
