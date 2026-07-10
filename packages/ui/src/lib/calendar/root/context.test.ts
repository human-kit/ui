import { describe, it, expect, vi } from 'vitest';
import { createCalendarContext } from './context';
import { formatCalendarDate } from './date-utils';

describe('calendar context', () => {
	it('bounds focus search when all dates are unavailable', () => {
		const isDateUnavailable = vi.fn(() => true);
		const context = createCalendarContext({
			defaultValue: '2026-02-10',
			isDateUnavailable
		});

		const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
		context.handleCellKeydown(event, '2026-02-10');

		expect(isDateUnavailable.mock.calls.length).toBeLessThanOrEqual(371);
	});

	it('preserves the visible month when a controlled value re-syncs unchanged', () => {
		const context = createCalendarContext({ value: '2026-02-10', onChange: () => {} });

		context.goToNextPage();
		expect(formatCalendarDate(context.months[0].monthStart)).toBe('2026-03-01');

		// Parent rerender: same value, new onChange identity.
		context.sync({ value: '2026-02-10', onChange: () => {} });

		expect(formatCalendarDate(context.months[0].monthStart)).toBe('2026-03-01');
		expect(context.selectedValue).toBe('2026-02-10');
	});

	it('resets the visible month when the controlled value actually changes', () => {
		const context = createCalendarContext({ value: '2026-02-10', onChange: () => {} });

		context.goToNextPage();
		context.sync({ value: '2026-05-20', onChange: () => {} });

		expect(formatCalendarDate(context.months[0].monthStart)).toBe('2026-05-01');
		expect(context.selectedValue).toBe('2026-05-20');
	});

	it('keeps a pending range anchor when a controlled range value re-syncs unchanged', () => {
		const context = createCalendarContext({
			selectionMode: 'range',
			value: { start: '2026-02-10', end: '2026-02-12' },
			onChange: () => {}
		});

		context.selectDate('2026-02-15');
		expect(context.rangeValue).toEqual({ start: '2026-02-15' });

		// Parent rerender: structurally equal range with a new object identity.
		context.sync({
			selectionMode: 'range',
			value: { start: '2026-02-10', end: '2026-02-12' },
			onChange: () => {}
		});

		expect(context.rangeValue).toEqual({ start: '2026-02-15' });
	});

	it('clears a controlled range when value becomes null', () => {
		const context = createCalendarContext({
			selectionMode: 'range',
			value: { start: '2026-02-10', end: '2026-02-12' },
			onChange: () => {}
		});

		context.sync({ selectionMode: 'range', value: null, onChange: () => {} });

		expect(context.rangeValue).toBeUndefined();
	});
});
