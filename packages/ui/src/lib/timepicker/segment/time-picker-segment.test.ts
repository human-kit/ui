import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import TimePickerTest from '../root/time-picker-test.svelte';
import TimePickerEmptyTest from '../root/time-picker-empty-test.svelte';
import TimePicker12hTest from '../root/time-picker-12h-test.svelte';

function getSegment(type: 'hour' | 'minute' | 'second' | 'dayPeriod') {
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

function getLatestTestIdText(testId: string): string {
	const elements = document.querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`);
	const element = elements.item(elements.length - 1);
	return element?.textContent ?? '';
}

describe('TimePicker.Segment', () => {
	afterEach(() => {
		const dialogs = document.querySelectorAll('[role="dialog"]');
		dialogs.forEach((dialog) => dialog.remove());
	});

	it('renders literal separators as non-interactive elements', async () => {
		render(TimePickerTest);
		const literal = document.querySelector('[data-type="literal"]');

		expect(literal).toBeTruthy();
		expect(literal?.tagName.toLowerCase()).toBe('span');
	});

	it('announces a localized "Empty" for placeholder segments instead of the raw placeholder', async () => {
		render(TimePickerEmptyTest);
		const hourSegment = getSegment('hour');
		const minuteSegment = getSegment('minute');

		expect(hourSegment.element()?.getAttribute('data-placeholder')).toBe('true');
		expect(hourSegment.element()?.getAttribute('aria-valuetext')).toBe('Empty');
		expect(minuteSegment.element()?.getAttribute('aria-valuetext')).toBe('Empty');
	});

	it('sets focused state when segment receives focus', async () => {
		render(TimePickerTest);
		const hourSegment = getSegment('hour');

		hourSegment.element()?.focus();
		await expect.poll(() => hourSegment.element()?.getAttribute('data-focused')).toBe('true');
	});

	it('inverts segment arrow navigation in RTL layouts', async () => {
		const previousDir = document.documentElement.dir;
		document.documentElement.dir = 'rtl';

		try {
			render(TimePickerTest);
			const hourSegment = getSegment('hour');
			const minuteSegment = getSegment('minute');

			hourSegment.element()?.focus();
			// Visually left in RTL is the next logical segment.
			await userEvent.keyboard('{ArrowLeft}');
			await expect.poll(() => document.activeElement).toBe(minuteSegment.element());

			// Visually right in RTL is the previous logical segment.
			await userEvent.keyboard('{ArrowRight}');
			await expect.poll(() => document.activeElement).toBe(hourSegment.element());
		} finally {
			document.documentElement.dir = previousDir;
		}
	});

	it('increments hour segment value with ArrowUp', async () => {
		render(TimePickerTest);
		const hourSegment = getSegment('hour');

		hourSegment.element()?.focus();
		await userEvent.keyboard('{ArrowUp}');

		await expect.poll(() => getLatestTestIdText('time-picker-value')).toBe('15:30');
	});

	it('renders minutes with leading zero while keeping hour unpadded', async () => {
		render(TimePickerTest, { defaultValue: '05:05' });
		const hourSegment = getSegment('hour');
		const minuteSegment = getSegment('minute');

		expect(hourSegment.element()?.textContent).toBe('5');
		expect(minuteSegment.element()?.textContent).toBe('05');
	});

	it('moves focus to previous segment on backspace when current segment is empty', async () => {
		render(TimePickerTest);
		const minuteSegment = getSegment('minute');

		minuteSegment.element()?.focus();
		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('{Backspace}');

		expect(document.activeElement?.getAttribute('data-type')).toBe('hour');
	});

	it('does not commit full time when only one segment is edited', async () => {
		render(TimePickerEmptyTest);
		const hourSegment = getSegment('hour');

		hourSegment.element()?.focus();
		await userEvent.keyboard('1');
		await userEvent.keyboard('4');

		await expect.poll(() => getLatestTestIdText('bind-value')).toBe('');
	});

	it('keeps partial hour draft when focus leaves input without completing minute', async () => {
		render(TimePickerEmptyTest);
		const hourSegment = getSegment('hour');

		hourSegment.element()?.focus();
		await userEvent.keyboard('0');
		await userEvent.keyboard('1');
		await userEvent.click(document.querySelector('[data-testid="outside-button"]') as HTMLElement);

		await expect.poll(() => hourSegment.element()?.textContent).toBe('1');
		await expect.poll(() => getLatestTestIdText('bind-value')).toBe('');
	});

	it('does not merge a stale typed digit after backspace clears the segment', async () => {
		render(TimePickerTest, { defaultValue: '14:30' });
		const minuteSegment = getSegment('minute');

		minuteSegment.element()?.focus();
		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('3');
		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('5');

		await expect.poll(() => minuteSegment.element()?.textContent).toBe('05');
		await expect.poll(() => getLatestTestIdText('time-picker-value')).toBe('14:05');
	});

	it('omits aria-valuenow when segment is empty', async () => {
		render(TimePickerEmptyTest);
		const hourSegment = getSegment('hour');

		expect(hourSegment.element()?.getAttribute('data-placeholder')).toBe('true');
		expect(hourSegment.element()?.getAttribute('aria-valuenow')).toBeNull();
	});

	it('removes aria-valuenow after the segment is cleared', async () => {
		render(TimePickerTest, { defaultValue: '14:30' });
		const minuteSegment = getSegment('minute');

		expect(minuteSegment.element()?.getAttribute('aria-valuenow')).toBe('30');

		minuteSegment.element()?.focus();
		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('{Backspace}');

		await expect
			.poll(() => getSegment('minute').element()?.getAttribute('aria-valuenow'))
			.toBeNull();
	});

	it('keeps both digits when typing minute values like 25', async () => {
		render(TimePickerTest, { defaultValue: '14:30' });
		const minuteSegment = getSegment('minute');

		minuteSegment.element()?.focus();
		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('2');
		await userEvent.keyboard('5');

		await expect.poll(() => minuteSegment.element()?.textContent).toBe('25');
		await expect.poll(() => getLatestTestIdText('time-picker-value')).toBe('14:25');
	});

	it('updates dayPeriod with keyboard in 12h mode', async () => {
		render(TimePicker12hTest);
		const dayPeriodSegment = getSegment('dayPeriod');

		dayPeriodSegment.element()?.focus();
		await userEvent.keyboard('a');

		await expect.poll(() => getLatestTestIdText('bind-value')).toBe('02:30');
	});

	it('clears dayPeriod on backspace and auto-sets AM when editing hour again', async () => {
		render(TimePicker12hTest);
		const dayPeriodSegment = getSegment('dayPeriod');
		const hourSegment = getSegment('hour');

		dayPeriodSegment.element()?.focus();
		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('{Backspace}');
		await expect.poll(() => getLatestTestIdText('bind-value')).toBe('');

		hourSegment.element()?.focus();
		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('1');

		await expect.poll(() => dayPeriodSegment.element()?.textContent).toBe('AM');
		await expect.poll(() => getLatestTestIdText('bind-value')).toBe('01:30');
	});

	it('uses correct Home/End boundaries for hour in 12h mode', async () => {
		render(TimePicker12hTest);
		const hourSegment = getSegment('hour');

		hourSegment.element()?.focus();
		await userEvent.keyboard('{Home}');
		await expect.poll(() => hourSegment.element()?.textContent).toBe('1');

		await userEvent.keyboard('{End}');
		await expect.poll(() => hourSegment.element()?.textContent).toBe('12');
	});

	it('prevents paste from mutating contenteditable segment text', async () => {
		render(TimePickerTest, { defaultValue: '14:30' });
		const hourSegment = getSegment('hour');
		const element = hourSegment.element();

		element.focus();
		element.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true }));

		await expect.poll(() => element.textContent).toBe('14');
		await expect.poll(() => getLatestTestIdText('time-picker-value')).toBe('');
	});

	it('restores segment text on unexpected input event drift', async () => {
		render(TimePickerTest, { defaultValue: '14:30' });
		const hourSegment = getSegment('hour');
		const element = hourSegment.element();

		element.focus();
		element.textContent = '99';
		element.dispatchEvent(new InputEvent('input', { bubbles: true }));

		await expect.poll(() => getSegment('hour').element()?.textContent).toBe('14');
	});

	it('routes beforeinput insertText digits to segment typing and keeps focus', async () => {
		render(TimePickerTest, { defaultValue: '14:30' });
		const minuteSegment = getSegment('minute');
		const element = minuteSegment.element();

		element.focus();
		const event = new InputEvent('beforeinput', {
			inputType: 'insertText',
			data: '5',
			bubbles: true,
			cancelable: true
		});
		const wasNotCanceled = element.dispatchEvent(event);

		expect(wasNotCanceled).toBe(false);
		await expect.poll(() => getLatestTestIdText('time-picker-value')).toBe('14:05');
		expect(document.activeElement).toBe(getSegment('minute').element());
	});

	it('blocks non-insertText beforeinput without mutating the segment', async () => {
		render(TimePickerTest, { defaultValue: '14:30' });
		const minuteSegment = getSegment('minute');
		const element = minuteSegment.element();

		element.focus();
		const event = new InputEvent('beforeinput', {
			inputType: 'insertFromPaste',
			data: '59',
			bubbles: true,
			cancelable: true
		});
		const wasNotCanceled = element.dispatchEvent(event);

		expect(wasNotCanceled).toBe(false);
		await expect.poll(() => getSegment('minute').element()?.textContent).toBe('30');
		expect(getLatestTestIdText('time-picker-value')).toBe('');
	});

	it('does not prevent default for browser shortcuts like Ctrl+C', async () => {
		render(TimePickerTest, { defaultValue: '14:30' });
		const hourSegment = getSegment('hour');

		hourSegment.element()?.focus();
		const event = new KeyboardEvent('keydown', {
			key: 'c',
			ctrlKey: true,
			bubbles: true,
			cancelable: true
		});
		const wasNotCanceled = hourSegment.element()?.dispatchEvent(event);

		expect(wasNotCanceled).toBe(true);
	});

	it('does not prevent default for Escape so an enclosing popover can close', async () => {
		render(TimePickerTest, { defaultValue: '14:30' });
		const hourSegment = getSegment('hour');

		hourSegment.element()?.focus();
		const event = new KeyboardEvent('keydown', {
			key: 'Escape',
			bubbles: true,
			cancelable: true
		});
		const wasNotCanceled = hourSegment.element()?.dispatchEvent(event);

		expect(wasNotCanceled).toBe(true);
	});

	it('does not hijack Ctrl+A on the dayPeriod segment', async () => {
		render(TimePicker12hTest);
		const dayPeriodSegment = getSegment('dayPeriod');
		const initialText = dayPeriodSegment.element()?.textContent;

		dayPeriodSegment.element()?.focus();
		const event = new KeyboardEvent('keydown', {
			key: 'a',
			ctrlKey: true,
			bubbles: true,
			cancelable: true
		});
		const wasNotCanceled = dayPeriodSegment.element()?.dispatchEvent(event);

		expect(wasNotCanceled).toBe(true);
		expect(dayPeriodSegment.element()?.textContent).toBe(initialText);
	});
});
