import { describe, it, expect, vi } from 'vitest';
import { createCalendarContext } from './context';

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
});
