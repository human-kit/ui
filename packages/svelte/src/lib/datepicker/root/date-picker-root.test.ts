import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import DatePickerTest from './date-picker-test.svelte';
import DatePickerBindableTest from './date-picker-bindable-test.svelte';

describe('DatePicker.Root', () => {
	afterEach(() => {
		const dialogs = document.querySelectorAll('[role="dialog"]');
		dialogs.forEach((dialog) => dialog.remove());
	});

	it('opens calendar when trigger is clicked', async () => {
		const screen = render(DatePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
	});

	it('keeps focus on segment and does not open popover on segment click', async () => {
		const screen = render(DatePickerTest);
		const monthSegment = screen.getByRole('spinbutton', { name: 'month, ' });

		await monthSegment.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		expect(document.activeElement).toBe(monthSegment.element());
	});

	it('updates value when selecting a date from calendar', async () => {
		const screen = render(DatePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

		const dayCell = screen.getByRole('gridcell', { name: '2026-02-12' });
		await dayCell.click();

		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-value"]')?.textContent)
			.toBe('2026-02-12');
	});

	it('closes popover after calendar selection when closeOnSelect is true', async () => {
		const screen = render(DatePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

		const dayCell = screen.getByRole('gridcell', { name: '2026-02-14' });
		await dayCell.click();

		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		await expect.poll(() => document.activeElement).toBe(trigger.element());
		await expect.poll(() => trigger.element()?.getAttribute('data-focused')).toBe('true');
		expect(trigger.element()?.getAttribute('data-focus-visible')).toBeNull();
	});

	it('allows opening in readOnly mode but prevents value changes', async () => {
		const screen = render(DatePickerTest, { isReadOnly: true });
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

		const dayCell = screen.getByRole('gridcell', { name: '2026-02-12' });
		await dayCell.click();

		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-value"]')?.textContent)
			.toBe('');
		await userEvent.keyboard('{Escape}');
	});

	it('supports bind:open and bind:value updates', async () => {
		const screen = render(DatePickerBindableTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		expect(document.querySelector('[data-testid="bind-open"]')?.textContent).toBe('false');
		expect(document.querySelector('[data-testid="bind-value"]')?.textContent).toBe('2026-02-10');

		await trigger.click();
		await expect.poll(() => document.querySelector('[data-testid="bind-open"]')?.textContent).toBe(
			'true'
		);

		const dayCell = screen.getByRole('gridcell', { name: '2026-02-12' });
		await dayCell.click();

		await expect.poll(() => document.querySelector('[data-testid="bind-value"]')?.textContent).toBe(
			'2026-02-12'
		);
	});

});
