import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import TimePickerTest from './time-picker-test.svelte';
import TimePickerBindableTest from './time-picker-bindable-test.svelte';
import TimePickerHourCycleTest from './time-picker-hour-cycle-test.svelte';
import TimePickerLocaleTest from './time-picker-locale-test.svelte';

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

describe('TimePicker.Root', () => {
	afterEach(() => {
		const dialogs = document.querySelectorAll('[role="dialog"]');
		dialogs.forEach((dialog) => dialog.remove());
	});

	it('opens popover when trigger is clicked', async () => {
		const screen = render(TimePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open time picker' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		await expect
			.poll(() => document.querySelector('[data-testid="time-picker-open-reason"]')?.textContent)
			.toBe('trigger-press');
	});

	it('does not mark initial wheel focus as focus-visible on mouse open', async () => {
		const screen = render(TimePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open time picker' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

		const firstWheel = document.querySelector<HTMLElement>('[role="spinbutton"][data-type="hour"]');
		await expect.poll(() => firstWheel).toBeTruthy();
		expect(firstWheel?.getAttribute('data-focus-visible')).toBeNull();
		expect(firstWheel?.matches(':focus-visible')).toBe(false);
	});

	it('keeps focus on segment and does not open popover on segment click', async () => {
		render(TimePickerTest);
		const hourSegment = getSegment('hour');

		await hourSegment.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		expect(document.activeElement).toBe(hourSegment.element());
	});

	it('does not open in readOnly mode because trigger is hidden', async () => {
		render(TimePickerTest, { readonly: true });
		expect(document.querySelector('button[aria-haspopup="dialog"]')).toBeNull();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
	});

	it('does not open popover when disabled', async () => {
		const screen = render(TimePickerTest, { disabled: true });
		const trigger = screen.getByRole('button', { name: 'Open time picker' });

		trigger.element()?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
	});

	it('supports bind:value and bind:open updates', async () => {
		const screen = render(TimePickerBindableTest);
		const trigger = screen.getByRole('button', { name: 'Open time picker' });

		expect(document.querySelector('[data-testid="bind-value"]')?.textContent).toBe('14:30');
		expect(document.querySelector('[data-testid="bind-open"]')?.textContent).toBe('false');

		await trigger.click();
		await expect
			.poll(() => document.querySelector('[data-testid="bind-open"]')?.textContent)
			.toBe('true');
	});

	it('clears committed value when draft becomes incomplete', async () => {
		render(TimePickerBindableTest);
		const minuteSegment = getSegment('minute');

		minuteSegment.element()?.focus();
		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('{Backspace}');

		await expect
			.poll(() => document.querySelector('[data-testid="bind-value"]')?.textContent)
			.toBe('');
	});

	it('clears value when bound value is set to undefined externally', async () => {
		const screen = render(TimePickerBindableTest);

		const clearUndefined = screen.getByTestId('clear-undefined');
		await clearUndefined.click();

		await expect
			.poll(() => document.querySelector('[data-testid="bind-value"]')?.textContent)
			.toBe('');
		await expect
			.poll(() => getSegment('hour').element()?.getAttribute('data-placeholder'))
			.toBe('true');
	});

	it('clears value when bound value is set to null externally', async () => {
		const screen = render(TimePickerBindableTest);

		const clearNull = screen.getByTestId('clear-null');
		await clearNull.click();

		await expect
			.poll(() => document.querySelector('[data-testid="bind-value"]')?.textContent)
			.toBe('');
	});

	it('rebuilds segment draft when hourCycle changes with a committed value', async () => {
		const screen = render(TimePickerHourCycleTest);

		await expect.poll(() => getSegment('hour').element()?.textContent).toBe('2');
		await expect.poll(() => getSegment('dayPeriod').element()?.textContent).toBe('PM');

		await screen.getByTestId('set-24h').click();

		await expect.poll(() => getSegment('hour').element()?.textContent).toBe('14');
		expect(document.querySelector('[role="spinbutton"][data-type="dayPeriod"]')).toBeNull();

		// Editing after the cycle switch must keep the committed hour intact.
		const minuteSegment = getSegment('minute');
		minuteSegment.element()?.focus();
		await userEvent.keyboard('{ArrowUp}');

		await expect
			.poll(() => document.querySelector('[data-testid="bind-value"]')?.textContent)
			.toBe('14:31');
	});

	it('converts the draft back to 12h when hourCycle switches again', async () => {
		const screen = render(TimePickerHourCycleTest);

		await screen.getByTestId('set-24h').click();
		await expect.poll(() => getSegment('hour').element()?.textContent).toBe('14');

		await screen.getByTestId('set-12h').click();

		await expect.poll(() => getSegment('hour').element()?.textContent).toBe('2');
		await expect.poll(() => getSegment('dayPeriod').element()?.textContent).toBe('PM');
		expect(document.querySelector('[data-testid="bind-value"]')?.textContent).toBe('14:30');
	});

	it('syncs wheel interaction through root commit into bound value', async () => {
		const screen = render(TimePickerBindableTest);
		const trigger = screen.getByRole('button', { name: 'Open time picker' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

		const panel = document.querySelector<HTMLElement>('[data-clock="true"]');
		const hourColumn = panel?.querySelectorAll<HTMLElement>('[role="spinbutton"]').item(0);
		const nextItem = hourColumn?.querySelector<HTMLElement>('[data-wheel-item][data-value="15"]');
		expect(nextItem).toBeTruthy();

		nextItem?.click();

		await expect
			.poll(() => document.querySelector('[data-testid="bind-value"]')?.textContent)
			.toBe('15:30');
		await expect.poll(() => getSegment('hour').element()?.textContent).toBe('15');
	});

	describe('locale-aware dayPeriod display', () => {
		function getExpectedDayPeriod(locale: string, period: 'AM' | 'PM') {
			return new Intl.DateTimeFormat(locale, { hour: 'numeric', hour12: true, timeZone: 'UTC' })
				.formatToParts(new Date(Date.UTC(2024, 0, 1, period === 'PM' ? 15 : 9, 0, 0)))
				.find((part) => part.type === 'dayPeriod')
				?.value?.trim();
		}

		it('shows the Spanish dayPeriod text for the segment while keeping internal tokens', async () => {
			const expectedPm = getExpectedDayPeriod('es', 'PM');
			expect(expectedPm).toBeTruthy();
			expect(expectedPm).not.toBe('PM');

			render(TimePickerLocaleTest, { locale: 'es', defaultValue: '14:30', hourCycle: 12 });

			await expect.poll(() => getSegment('dayPeriod').element()?.textContent).toBe(expectedPm);
		});

		it('shows Spanish dayPeriod labels in the wheel while keeping AM/PM values', async () => {
			const expectedAm = getExpectedDayPeriod('es', 'AM');
			const expectedPm = getExpectedDayPeriod('es', 'PM');

			const screen = render(TimePickerLocaleTest, {
				locale: 'es',
				defaultValue: '14:30',
				hourCycle: 12
			});
			const trigger = screen.getByRole('button', { name: 'Open time picker' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			const panel = document.querySelector<HTMLElement>('[data-clock="true"]');
			const amItem = panel?.querySelector<HTMLElement>(
				'[data-wheel-item][data-type="dayPeriod"][data-value="AM"]'
			);
			const pmItem = panel?.querySelector<HTMLElement>(
				'[data-wheel-item][data-type="dayPeriod"][data-value="PM"]'
			);

			expect(amItem).toBeTruthy();
			expect(pmItem).toBeTruthy();
			expect(amItem?.textContent?.trim()).toBe(expectedAm);
			expect(pmItem?.textContent?.trim()).toBe(expectedPm);
		});
	});
});
