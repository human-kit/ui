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
		const spinbutton = getSpinbuttons().item(0);
		spinbutton?.focus();
		spinbutton?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

		await expect
			.poll(() => document.querySelector('[data-testid="clock-value"]')?.textContent)
			.toBe('14:30');
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
});
