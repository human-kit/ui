import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ClockRootTest from './clock-wheel-column-test.svelte';
import ClockWheelColumnBindableTest from './clock-wheel-column-bindable-test.svelte';
import ClockWheelColumnCustomSnippetTest from './clock-wheel-column-custom-snippet-test.svelte';
import ClockWheelColumnDefaultHeightTest from './clock-wheel-column-default-height-test.svelte';
import ClockWheelColumnUntaggedSnippetTest from './clock-wheel-column-untagged-snippet-test.svelte';

function getClockColumns(): HTMLElement[] {
	const clock = document.querySelector<HTMLElement>('[data-clock="true"]');
	if (!clock) return [];
	return Array.from(clock.querySelectorAll<HTMLElement>('[role="spinbutton"]'));
}

describe('Clock.WheelColumn', () => {
	it('renders spinbutton columns', async () => {
		render(ClockRootTest);

		const spinbuttons = getClockColumns();
		expect(spinbuttons.length).toBe(2);
	});

	it('applies default h-55 when no explicit height class is provided', async () => {
		render(ClockWheelColumnDefaultHeightTest);

		const firstColumn = getClockColumns().at(0);
		expect(firstColumn).toBeTruthy();
		expect(firstColumn?.className).toContain('h-55');
	});

	it('preserves explicit height class without adding default height', async () => {
		render(ClockWheelColumnCustomSnippetTest);

		const firstColumn = getClockColumns().at(0);
		expect(firstColumn).toBeTruthy();
		expect(firstColumn?.className).toContain('h-44');
		expect(firstColumn?.className).not.toContain('h-55');
	});

	it('exposes aria values for selected option', async () => {
		render(ClockRootTest);

		const firstColumn = getClockColumns().at(0);
		expect(firstColumn).toBeTruthy();
		expect(firstColumn?.getAttribute('aria-valuenow')).toBeTruthy();
		expect(firstColumn?.getAttribute('aria-valuetext')).toBeTruthy();
	});

	it('moves focus across columns with ArrowRight and ArrowLeft', async () => {
		render(ClockRootTest);

		const columns = getClockColumns();
		expect(columns.length).toBe(2);

		const hourColumn = columns[0];
		const minuteColumn = columns[1];

		hourColumn.focus();
		hourColumn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

		await expect.poll(() => document.activeElement).toBe(minuteColumn);

		minuteColumn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
		await expect.poll(() => document.activeElement).toBe(hourColumn);
	});

	it('renders top and bottom spacers', async () => {
		render(ClockRootTest);

		const firstColumn = getClockColumns().at(0);
		const topSpacer = firstColumn?.querySelector('[data-wheel-spacer="top"]');
		const bottomSpacer = firstColumn?.querySelector('[data-wheel-spacer="bottom"]');

		expect(topSpacer).toBeTruthy();
		expect(bottomSpacer).toBeTruthy();
	});

	it('updates value with ArrowDown keyboard navigation', async () => {
		render(ClockRootTest);
		const firstColumn = getClockColumns().at(0);
		expect(firstColumn).toBeTruthy();

		firstColumn?.focus();
		firstColumn?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

		await expect
			.poll(() => document.querySelector('[data-testid="clock-value"]')?.textContent)
			.toBe('15:30');
	});

	it('sets focus data attributes on keyboard focus', async () => {
		render(ClockRootTest);
		const firstColumn = getClockColumns().at(0);
		expect(firstColumn).toBeTruthy();

		firstColumn?.focus();
		firstColumn?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

		await expect.poll(() => firstColumn?.getAttribute('data-focus-within')).toBe('true');
		await expect.poll(() => firstColumn?.getAttribute('data-focus-visible')).toBe('true');
	});

	it('marks out-of-range options as disabled with min/max', async () => {
		render(ClockRootTest, {
			defaultValue: '09:30',
			minValue: '09:00',
			maxValue: '17:00'
		});

		const firstColumn = getClockColumns().at(0);
		const disabledItems =
			firstColumn?.querySelectorAll('[data-wheel-item][data-disabled="true"]') ?? [];
		expect(disabledItems.length).toBeGreaterThan(0);
	});

	it('does not snap when clicking a disabled option', async () => {
		render(ClockRootTest, {
			defaultValue: '09:30',
			minValue: '09:00',
			maxValue: '17:00'
		});

		const firstColumn = getClockColumns().at(0);
		expect(firstColumn).toBeTruthy();

		await expect.poll(() => firstColumn?.scrollTop ?? 0).toBeGreaterThanOrEqual(0);
		const initialScrollTop = firstColumn?.scrollTop ?? 0;

		const disabledHour = firstColumn?.querySelector<HTMLElement>(
			'[data-wheel-item][data-value="8"][data-disabled="true"]'
		);
		expect(disabledHour).toBeTruthy();
		disabledHour?.click();

		await expect
			.poll(() => Math.abs((firstColumn?.scrollTop ?? 0) - initialScrollTop) < 1)
			.toBe(true);
	});

	it('syncs wheel position when value changes externally', async () => {
		render(ClockWheelColumnBindableTest);
		const firstColumn = getClockColumns().at(0);
		expect(firstColumn).toBeTruthy();

		const setValueButton = document.querySelector<HTMLElement>('[data-testid="set-value-16-45"]');
		expect(setValueButton).toBeTruthy();
		setValueButton?.click();

		await expect.poll(() => firstColumn?.getAttribute('aria-valuetext')).toBe('16');
		await expect
			.poll(() => document.querySelector('[data-testid="bind-value"]')?.textContent)
			.toBe('16:45');
	});

	it('supports custom snippet items without data-wheel-item attribute', async () => {
		render(ClockWheelColumnUntaggedSnippetTest);

		const firstColumn = getClockColumns().at(0);
		expect(firstColumn).toBeTruthy();

		firstColumn?.focus();
		firstColumn?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

		await expect
			.poll(() => document.querySelector('[data-testid="clock-value"]')?.textContent)
			.toBe('15:30');
	});
});
