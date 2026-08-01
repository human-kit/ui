import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ClockRootTest from './clock-root-test.svelte';

function getClockRoot(): HTMLElement | null {
	return document.querySelector<HTMLElement>('[data-clock="true"]');
}

function getSpinbuttons(): NodeListOf<HTMLElement> {
	return document.querySelectorAll<HTMLElement>('[role="spinbutton"]');
}

describe('Clock.Root', () => {
	it('renders the clock container with data attribute', async () => {
		render(ClockRootTest);

		await expect.poll(() => getClockRoot()).toBeTruthy();
	});

	it('renders default wheel columns for minute granularity with 24h cycle', async () => {
		render(ClockRootTest, { granularity: 'minute', hourCycle: 24 });

		await expect.poll(() => getSpinbuttons().length).toBe(2);
	});

	it('renders three wheel columns for second granularity with 24h cycle', async () => {
		render(ClockRootTest, { granularity: 'second', hourCycle: 24 });

		await expect.poll(() => getSpinbuttons().length).toBe(3);
	});

	it('renders dayPeriod column for 12h cycle', async () => {
		render(ClockRootTest, { granularity: 'minute', hourCycle: 12 });

		await expect.poll(() => getSpinbuttons().length).toBe(3);
	});

	it('renders four columns for second granularity with 12h cycle', async () => {
		render(ClockRootTest, { granularity: 'second', hourCycle: 12 });

		await expect.poll(() => getSpinbuttons().length).toBe(4);
	});

	it('renders only hour column when granularity is hour', async () => {
		render(ClockRootTest, { granularity: 'hour', hourCycle: 24 });

		await expect.poll(() => getSpinbuttons().length).toBe(1);
	});

	it('renders custom column snippet when provided', async () => {
		render(ClockRootTest, {
			granularity: 'second',
			hourCycle: 12,
			useSnippet: true
		});

		const columns = document.querySelectorAll<HTMLElement>('[data-testid="clock-column"]');
		await expect.poll(() => columns.length).toBe(4);
		const types = Array.from(columns).map((el) => el.getAttribute('data-type'));
		expect(types).toEqual(['hour', 'minute', 'second', 'dayPeriod']);
	});

	it('renders overlay children together with column snippet', async () => {
		render(ClockRootTest, {
			granularity: 'minute',
			hourCycle: 24,
			useSnippet: true,
			showAxis: true
		});

		await expect.poll(() => document.querySelector('[data-testid="clock-axis"]')).toBeTruthy();
		await expect
			.poll(() => document.querySelectorAll('[data-testid="clock-column"]').length)
			.toBe(2);
	});

	it('applies axis height when provided', async () => {
		render(ClockRootTest, {
			granularity: 'minute',
			hourCycle: 24,
			useSnippet: true,
			showAxis: true,
			axisHeight: 32
		});

		const axis = document.querySelector<HTMLElement>('[data-testid="clock-axis"]');
		await expect.poll(() => axis).toBeTruthy();
		expect(axis?.style.height).toBe('32px');
	});

	it('omits minute and second columns when granularity is hour with snippet', async () => {
		render(ClockRootTest, {
			granularity: 'hour',
			hourCycle: 24,
			useSnippet: true
		});

		const columns = document.querySelectorAll<HTMLElement>('[data-testid="clock-column"]');
		await expect.poll(() => columns.length).toBe(1);
		expect(columns[0]?.getAttribute('data-type')).toBe('hour');
	});

	it('displays the initial value', async () => {
		render(ClockRootTest, { defaultValue: '09:15' });

		await expect
			.poll(() => document.querySelector('[data-testid="clock-value"]')?.textContent)
			.toBe('09:15');
	});

	it('updates value via wheel keyboard navigation', async () => {
		render(ClockRootTest, { defaultValue: '14:30', hourCycle: 24 });

		await expect.poll(() => getSpinbuttons().item(0)).toBeTruthy();
		const hourEl = getSpinbuttons().item(0);
		hourEl?.focus();
		hourEl?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

		await expect
			.poll(() => document.querySelector('[data-testid="clock-value"]')?.textContent)
			.toBe('15:30');
	});

	it('does not allow interaction when disabled', async () => {
		render(ClockRootTest, { defaultValue: '14:30', disabled: true });

		await expect.poll(() => getSpinbuttons().item(0)).toBeTruthy();
		const spinbutton = getSpinbuttons().item(0) as HTMLElement;

		// Wait until the wheel has aligned to the selected value.
		await expect.poll(() => spinbutton.getAttribute('aria-valuetext')).toBe('14');
		const initialScrollTop = spinbutton.scrollTop;

		// Keyboard must not move the wheel (neither value nor visual position).
		spinbutton.focus();
		spinbutton.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

		// Clicking another item must not move the wheel either.
		const otherItem = spinbutton.querySelector<HTMLElement>('[data-wheel-item][data-value="16"]');
		expect(otherItem).toBeTruthy();
		otherItem?.click();

		// Simulate a user scroll attempt: the snap logic must re-center the
		// selected item instead of adopting the new position.
		spinbutton.scrollTop = initialScrollTop + 80;
		spinbutton.dispatchEvent(new Event('scroll'));

		// Give the deferred snap handling time to settle.
		await new Promise((resolve) => setTimeout(resolve, 300));

		await expect
			.poll(() => document.querySelector('[data-testid="clock-value"]')?.textContent)
			.toBe('14:30');
		expect(spinbutton.getAttribute('aria-valuetext')).toBe('14');
		// The wheel must visually stay (or come back) on the selected item.
		await expect.poll(() => Math.abs(spinbutton.scrollTop - initialScrollTop) < 2).toBe(true);
	});

	it('rebuilds the draft when hourCycle changes with a committed value', async () => {
		render(ClockRootTest, { defaultValue: '14:30', hourCycle: 12 });

		await expect.poll(() => getSpinbuttons().length).toBe(3);

		document.querySelector<HTMLElement>('[data-testid="toggle-cycle"]')?.click();
		await expect.poll(() => getSpinbuttons().length).toBe(2);

		// Adjusting the hour after the cycle switch must start from 14, not from the stale 12h draft.
		const hourEl = getSpinbuttons().item(0);
		hourEl?.focus();
		hourEl?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

		await expect
			.poll(() => document.querySelector('[data-testid="clock-value"]')?.textContent)
			.toBe('15:30');
	});

	it('commits the exact offered hour with 12h cycle and hourStep greater than 1', async () => {
		render(ClockRootTest, { defaultValue: '14:30', hourCycle: 12, hourStep: 3 });

		await expect.poll(() => getSpinbuttons().item(0)).toBeTruthy();
		const hourColumn = getSpinbuttons().item(0);

		const offeredValues = Array.from(
			hourColumn?.querySelectorAll<HTMLElement>('[data-wheel-item]') ?? []
		).map((item) => item.getAttribute('data-value'));
		expect(offeredValues).toEqual(['1', '4', '7', '10']);

		const option = hourColumn?.querySelector<HTMLElement>('[data-wheel-item][data-value="4"]');
		expect(option).toBeTruthy();
		option?.click();

		await expect
			.poll(() => document.querySelector('[data-testid="clock-value"]')?.textContent)
			.toBe('16:30');
	});

	it('marks out-of-range options as disabled with min/max', async () => {
		render(ClockRootTest, {
			defaultValue: '09:30',
			minValue: '09:00',
			maxValue: '17:00'
		});

		const firstColumn = getSpinbuttons().item(0);
		await expect.poll(() => firstColumn).toBeTruthy();

		const disabledItems =
			firstColumn?.querySelectorAll('[data-wheel-item][data-disabled="true"]') ?? [];
		expect(disabledItems.length).toBeGreaterThan(0);
	});

	it('exposes data-invalid while the draft is partial and clears it once committeable', async () => {
		render(ClockRootTest, { defaultValue: null, hourCycle: 24, granularity: 'minute' });

		await expect.poll(() => getSpinbuttons().length).toBe(2);
		expect(getClockRoot()?.getAttribute('data-invalid')).toBeNull();

		// Selecting only the hour leaves the draft incomplete -> invalid.
		const hourColumn = getSpinbuttons().item(0);
		const hourOption = hourColumn?.querySelector<HTMLElement>('[data-wheel-item][data-value="10"]');
		expect(hourOption).toBeTruthy();
		hourOption?.click();

		await expect.poll(() => getClockRoot()?.getAttribute('data-invalid')).toBe('true');
		expect(document.querySelector('[data-testid="clock-value"]')?.textContent).toBe('');

		// Completing the minute makes the draft committeable -> invalid state clears.
		const minuteColumn = getSpinbuttons().item(1);
		const minuteOption = minuteColumn?.querySelector<HTMLElement>(
			'[data-wheel-item][data-value="30"]'
		);
		expect(minuteOption).toBeTruthy();
		minuteOption?.click();

		await expect
			.poll(() => document.querySelector('[data-testid="clock-value"]')?.textContent)
			.toBe('10:30');
		expect(getClockRoot()?.getAttribute('data-invalid')).toBeNull();
	});

	it('offers the boundary hour and clamps the minute onto the max', async () => {
		render(ClockRootTest, {
			defaultValue: '16:30',
			hourCycle: 24,
			minValue: '09:00',
			maxValue: '17:00'
		});

		await expect.poll(() => getSpinbuttons().length).toBe(2);

		// Hour 17 still has an in-range time (17:00), so it stays selectable even
		// though the draft's minute (30) would overshoot the max. Committing it
		// pulls the minute onto the boundary instead of refusing the selection.
		const hourColumn = getSpinbuttons().item(0);
		const boundaryHour = hourColumn?.querySelector<HTMLElement>(
			'[data-wheel-item][data-value="17"]'
		);
		expect(boundaryHour?.getAttribute('data-disabled')).toBeNull();
		boundaryHour?.click();

		await expect
			.poll(() => document.querySelector('[data-testid="clock-value"]')?.textContent)
			.toBe('17:00');
		expect(getClockRoot()?.getAttribute('data-invalid')).toBeNull();
	});

	it('ignores clicks on hours that have no in-range time at all', async () => {
		render(ClockRootTest, {
			defaultValue: '16:30',
			hourCycle: 24,
			minValue: '09:00',
			maxValue: '17:00'
		});

		await expect.poll(() => getSpinbuttons().length).toBe(2);

		// 18:00–18:59 lies entirely past the max, so no minute can rescue it.
		const hourColumn = getSpinbuttons().item(0);
		const outOfRangeHour = hourColumn?.querySelector<HTMLElement>(
			'[data-wheel-item][data-value="18"]'
		);
		expect(outOfRangeHour?.getAttribute('data-disabled')).toBe('true');
		outOfRangeHour?.click();

		await expect
			.poll(() => document.querySelector('[data-testid="clock-value"]')?.textContent)
			.toBe('16:30');
		expect(getClockRoot()?.getAttribute('data-invalid')).toBeNull();
	});

	it('normalizes an out-of-range external value to null', async () => {
		render(ClockRootTest, {
			defaultValue: '10:00',
			minValue: '09:00',
			maxValue: '17:00',
			externalValue: '23:00'
		});

		await expect
			.poll(() => document.querySelector('[data-testid="clock-value"]')?.textContent)
			.toBe('10:00');

		document.querySelector<HTMLElement>('[data-testid="set-external"]')?.click();

		await expect
			.poll(() => document.querySelector('[data-testid="clock-value"]')?.textContent)
			.toBe('');
		// The draft is cleared, so the root is not flagged invalid.
		expect(getClockRoot()?.getAttribute('data-invalid')).toBeNull();
	});

	it('normalizes an out-of-range initial default value to null', async () => {
		render(ClockRootTest, {
			defaultValue: '08:00',
			minValue: '09:00',
			maxValue: '17:00'
		});

		await expect.poll(() => getClockRoot()).toBeTruthy();
		expect(document.querySelector('[data-testid="clock-value"]')?.textContent).toBe('');
	});

	it('accepts an H:mm initial value and normalizes the binding to HH:mm', async () => {
		render(ClockRootTest, { defaultValue: '9:30' });

		await expect
			.poll(() => document.querySelector('[data-testid="clock-value"]')?.textContent)
			.toBe('09:30');

		const hourColumn = getSpinbuttons().item(0);
		await expect.poll(() => hourColumn?.getAttribute('aria-valuetext')).toBe('09');
	});

	it('normalizes an H:mm external value update to HH:mm', async () => {
		render(ClockRootTest, { defaultValue: '10:00', externalValue: '9:45' });

		await expect
			.poll(() => document.querySelector('[data-testid="clock-value"]')?.textContent)
			.toBe('10:00');

		document.querySelector<HTMLElement>('[data-testid="set-external"]')?.click();

		await expect
			.poll(() => document.querySelector('[data-testid="clock-value"]')?.textContent)
			.toBe('09:45');
	});
});
