import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TimePickerClockTest from './time-picker-clock-test.svelte';

function getClockContainer(): HTMLElement | null {
	return document.querySelector<HTMLElement>('[data-clock="true"]');
}

function getSpinbuttons(): HTMLElement[] {
	const clock = getClockContainer();
	if (!clock) return [];
	return Array.from(clock.querySelectorAll<HTMLElement>('[role="spinbutton"]'));
}

describe('TimePicker.Clock', () => {
	afterEach(() => {
		document.querySelectorAll('[role="dialog"]').forEach((el) => el.remove());
	});

	it('renders the clock container with data-clock attribute', async () => {
		render(TimePickerClockTest);

		await expect.poll(() => getClockContainer()).toBeTruthy();
	});

	it('renders hour and minute columns by default (minute granularity, 24h)', async () => {
		render(TimePickerClockTest, { granularity: 'minute', hourCycle: 24 });

		await expect.poll(() => getSpinbuttons().length).toBe(2);
	});

	it('renders hour, minute, second columns for second granularity', async () => {
		render(TimePickerClockTest, { granularity: 'second', hourCycle: 24 });

		await expect.poll(() => getSpinbuttons().length).toBe(3);
	});

	it('renders dayPeriod column for 12h cycle', async () => {
		render(TimePickerClockTest, { granularity: 'minute', hourCycle: 12 });

		await expect.poll(() => getSpinbuttons().length).toBe(3);
	});

	it('renders only hour column when granularity is hour', async () => {
		render(TimePickerClockTest, { granularity: 'hour', hourCycle: 24 });

		await expect.poll(() => getSpinbuttons().length).toBe(1);
	});

	it('passes class prop to container', async () => {
		render(TimePickerClockTest, { clockClass: 'my-custom-class' });

		await expect.poll(() => getClockContainer()?.classList.contains('my-custom-class')).toBe(true);
	});

	it('renders custom column snippet when provided', async () => {
		render(TimePickerClockTest, {
			granularity: 'second',
			hourCycle: 12,
			useSnippet: true
		});

		const columns = document.querySelectorAll<HTMLElement>('[data-testid="custom-column"]');
		await expect.poll(() => columns.length).toBe(4);

		const types = Array.from(columns).map((el) => el.getAttribute('data-type'));
		expect(types).toEqual(['hour', 'minute', 'second', 'dayPeriod']);
	});

	it('syncs wheel value changes back to TimePicker', async () => {
		render(TimePickerClockTest, { defaultValue: '14:30', hourCycle: 24 });

		await expect.poll(() => getSpinbuttons().length).toBe(2);

		const hourColumn = getSpinbuttons()[0];
		hourColumn?.focus();
		hourColumn?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

		await expect
			.poll(() => document.querySelector('[data-testid="clock-test-value"]')?.textContent)
			.toBe('15:30');
	});

	it('disables wheel interaction when TimePicker is disabled', async () => {
		render(TimePickerClockTest, { defaultValue: '14:30', disabled: true });

		await expect.poll(() => getSpinbuttons().length).toBeGreaterThan(0);

		const hourColumn = getSpinbuttons()[0];
		hourColumn?.focus();
		hourColumn?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

		await expect
			.poll(() => document.querySelector('[data-testid="clock-test-value"]')?.textContent)
			.toBe('14:30');
	});
});
