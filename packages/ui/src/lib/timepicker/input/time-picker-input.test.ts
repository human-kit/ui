import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import TimePickerTest from '../root/time-picker-test.svelte';
import TimePickerInputForwardingTest from './time-picker-input-forwarding-test.svelte';

function getSegment(type: 'hour' | 'minute' | 'second' | 'dayPeriod') {
	const element = document.querySelector<HTMLElement>(`[role="spinbutton"][data-type="${type}"]`);
	if (!element) {
		throw new Error(`Segment "${type}" was not rendered.`);
	}

	return {
		element: () => element,
		click: () => element.click()
	};
}

describe('TimePicker.Input', () => {
	afterEach(() => {
		const dialogs = document.querySelectorAll('[role="dialog"]');
		dialogs.forEach((dialog) => dialog.remove());
	});

	it('renders editable spinbutton segments (hour, minute)', async () => {
		render(TimePickerTest);

		const hour = document.querySelector('[role="spinbutton"][data-type="hour"]');
		const minute = document.querySelector('[role="spinbutton"][data-type="minute"]');

		expect(hour).toBeTruthy();
		expect(minute).toBeTruthy();
	});

	it('does not open popover when segment is clicked', async () => {
		render(TimePickerTest);
		const hourSegment = getSegment('hour');

		await hourSegment.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
	});

	it('focuses a segment when clicking input container', async () => {
		const screen = render(TimePickerTest);
		const inputGroup = screen.getByRole('group', { name: 'Time input' });

		await inputGroup.click();

		await expect
			.poll(() => document.activeElement?.getAttribute('data-time-picker-segment'))
			.toBe('true');
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
	});

	it('uses group role with provided accessible label', async () => {
		const screen = render(TimePickerTest);
		const inputGroup = screen.getByRole('group', { name: 'Time input' });

		expect(inputGroup.element()?.getAttribute('id')).toContain('-input');
	});

	it('does not move focus into segments when disabled', async () => {
		const screen = render(TimePickerTest, { disabled: true });
		const inputGroup = screen.getByRole('group', { name: 'Time input' });

		await inputGroup.click();
		expect(document.activeElement?.getAttribute('data-time-picker-segment')).not.toBe('true');
	});

	it('reflects aria-required when root required is true', async () => {
		const screen = render(TimePickerTest, { required: true });
		const inputGroup = screen.getByRole('group', { name: 'Time input' });

		expect(inputGroup.element()?.getAttribute('aria-required')).toBe('true');
	});

	it('exposes a labelable proxy input and forwards invalid state', async () => {
		const screen = render(TimePickerTest, {
			inputId: 'time_performed',
			inputName: 'time_performed',
			inputLabel: 'Performed at',
			inputAriaInvalid: true
		});
		const inputGroup = screen.getByRole('group', { name: 'Time input' });
		const proxyInput = document.getElementById('time_performed');

		expect(proxyInput).toBeInstanceOf(HTMLInputElement);
		expect(proxyInput?.getAttribute('name')).toBe('time_performed');
		expect(proxyInput?.getAttribute('aria-invalid')).toBe('true');
		// Autofill is not supported on the proxy: password managers/browsers must not write
		// into it — the time is typed in the segments.
		expect(proxyInput?.getAttribute('autocomplete')).toBe('off');
		expect(inputGroup.element()?.getAttribute('data-invalid')).toBe('true');
		// The group keeps an id of its own, so `<label for>` and the group don't collide.
		expect(inputGroup.element()?.getAttribute('id')).toBe('time_performed-group');
	});

	it('hands focus from the label to the first segment', async () => {
		const screen = render(TimePickerTest, {
			inputId: 'time_performed',
			inputName: 'time_performed',
			inputLabel: 'Performed at'
		});

		await userEvent.click(screen.getByText('Performed at'));

		await expect
			.poll(() => document.activeElement?.getAttribute('data-time-picker-segment'))
			.toBe('true');
	});

	it('renders no proxy input when neither id nor name is given', async () => {
		render(TimePickerTest);

		expect(document.querySelector('input[autocomplete="off"]')).toBeNull();
	});

	it('composes external input event handlers', async () => {
		const screen = render(TimePickerInputForwardingTest);
		const inputGroup = screen.getByRole('group', { name: 'Forwarding input' });
		const inputGroupEl = inputGroup.element();

		inputGroupEl?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
		inputGroupEl?.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
		inputGroupEl?.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
		inputGroupEl?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

		await expect
			.poll(() => document.querySelector('[data-testid="input-down-count"]')?.textContent)
			.toBe('1');
		await expect
			.poll(() => document.querySelector('[data-testid="input-focus-count"]')?.textContent)
			.toBe('1');
		await expect
			.poll(() => document.querySelector('[data-testid="input-blur-count"]')?.textContent)
			.toBe('1');
		await expect
			.poll(() => document.querySelector('[data-testid="input-key-count"]')?.textContent)
			.toBe('0');
	});
});
