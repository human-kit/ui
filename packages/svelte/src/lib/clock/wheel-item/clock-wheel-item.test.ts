import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ClockWheelItem from './clock-wheel-item.svelte';

describe('Clock.WheelItem', () => {
	it('renders as wheel item with correct attributes', async () => {
		render(ClockWheelItem, {
			type: 'hour',
			option: { value: '14', label: '14', disabled: false }
		});

		const item = document.querySelector<HTMLElement>('[data-wheel-item]');
		expect(item).toBeTruthy();
		expect(item?.getAttribute('aria-hidden')).toBe('true');
		expect(item?.getAttribute('data-type')).toBe('hour');
		expect(item?.getAttribute('data-value')).toBe('14');
	});

	it('reflects selected and disabled data attributes', async () => {
		render(ClockWheelItem, {
			type: 'minute',
			option: { value: '30', label: '30', disabled: true },
			selected: true
		});

		const item = document.querySelector<HTMLElement>('[data-wheel-item]');
		expect(item?.getAttribute('data-selected')).toBe('true');
		expect(item?.getAttribute('data-disabled')).toBe('true');
	});

	it('invokes onRequestCenter when clicked', async () => {
		let called = false;

		render(ClockWheelItem, {
			type: 'second',
			option: { value: '45', label: '45', disabled: false },
			onRequestCenter: () => {
				called = true;
			}
		});

		const item = document.querySelector<HTMLElement>('[data-wheel-item]');
		item?.click();
		expect(called).toBe(true);
	});
});
