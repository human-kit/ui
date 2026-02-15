import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import DatePickerTest from './date-picker-test.svelte';
import DatePickerBindableTest from './date-picker-bindable-test.svelte';
import {
	expectFocusVisibleImpliesFocusWithin,
	expectNoFalseFocusAttributes
} from '../../test-utils/focus-contract';

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
		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-open-reason"]')?.textContent)
			.toBe('trigger-press');
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

	it('does not open calendar or allow value changes in readOnly mode', async () => {
		render(DatePickerTest, { isReadOnly: true });
		expect(document.querySelector('button[aria-haspopup="dialog"]')).toBeNull();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();

		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-value"]')?.textContent)
			.toBe('');
	});

	it('does not open calendar or edit segments when disabled', async () => {
		const screen = render(DatePickerTest, { isDisabled: true });
		const trigger = screen.getByRole('button', { name: 'Open calendar' });
		const daySegment = screen.getByRole('spinbutton', { name: 'day, ' });

		trigger
			.element()
			?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();

		daySegment.element()?.focus();
		await userEvent.keyboard('{ArrowUp}');
		expect(document.querySelector('[data-testid="date-picker-value"]')?.textContent).toBe('');
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

	it('keeps focus contract invariant for root attributes', async () => {
		const screen = render(DatePickerTest);
		const monthSegment = screen.getByRole('spinbutton', { name: 'month, ' });
		const inputGroup = screen.getByRole('group', { name: 'Date input' });
		const outsideButton = screen.getByTestId('outside-button');
		const inputId = inputGroup.element()?.getAttribute('id') ?? '';
		const rootId = inputId.endsWith('-input') ? inputId.slice(0, -'-input'.length) : '';
		const root = rootId ? document.getElementById(rootId) : null;

		monthSegment.element()?.focus();
		await userEvent.keyboard('{ArrowUp}');
		expectFocusVisibleImpliesFocusWithin(root);

		outsideButton.element()?.focus();
		await expect.poll(() => root?.getAttribute('data-focus-within')).toBeNull();
		await expect.poll(() => root?.getAttribute('data-focus-visible')).toBeNull();
		expectFocusVisibleImpliesFocusWithin(root);
	});

	it('never sets focus data attributes to false', async () => {
		const screen = render(DatePickerTest);
		const monthSegment = screen.getByRole('spinbutton', { name: 'month, ' });
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		monthSegment.element()?.focus();
		await userEvent.keyboard('{ArrowUp}');
		await trigger.click();
		expectNoFalseFocusAttributes(document);
	});

});
