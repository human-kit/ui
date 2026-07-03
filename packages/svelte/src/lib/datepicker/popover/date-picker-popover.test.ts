import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import DatePickerTest from '../root/date-picker-test.svelte';
import DatePickerPopoverHandlerTest from './date-picker-popover-handler-test.svelte';
import DatePickerPopoverUnsafePropsTest from './date-picker-popover-unsafe-props-test.svelte';

describe('DatePicker.Popover', () => {
	afterEach(() => {
		const dialogs = document.querySelectorAll('[role="dialog"]');
		dialogs.forEach((dialog) => dialog.remove());
	});

	it('is hidden by default', async () => {
		render(DatePickerTest);
		expect(document.querySelector('[role="dialog"]')).toBeNull();
	});

	it('respects defaultOpen from root', async () => {
		render(DatePickerTest, { defaultOpen: true });
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
	});

	it('renders as modal dialog', async () => {
		render(DatePickerTest, { defaultOpen: true });
		await expect.poll(() => document.querySelector<HTMLElement>('[role="dialog"]')).toBeTruthy();
		const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
		expect(dialog?.getAttribute('aria-modal')).toBe('true');
	});

	it('supports dialog accessible name', async () => {
		const screen = render(DatePickerTest, {
			defaultOpen: true,
			popoverAriaLabel: 'Date picker calendar'
		});
		await expect.poll(() => document.querySelector<HTMLElement>('[role="dialog"]')).toBeTruthy();
		const dialog = screen.getByRole('dialog', { name: 'Date picker calendar' });
		expect(dialog.element()).toBeTruthy();
	});

	it('focuses the selected calendar cell when opened from the trigger with keyboard', async () => {
		const screen = render(DatePickerTest, { defaultValue: '2026-02-10' });
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		trigger.element()?.focus();
		await userEvent.keyboard('{Enter}');

		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2026-02-10');
		expect(document.activeElement?.getAttribute('role')).toBe('button');
		expect(document.activeElement?.closest('[role="gridcell"]')).toBeTruthy();
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2026-02-11');
	});

	it('clears the calendar cell focus state when tabbing to another popover control', async () => {
		const screen = render(DatePickerTest, { defaultValue: '2026-02-10' });
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		trigger.element()?.focus();
		await userEvent.keyboard('{Enter}');
		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2026-02-10');

		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2026-02-11');

		await userEvent.keyboard('{Tab}');

		await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBeNull();
		expect(document.querySelector('[role="button"][data-date][data-focused]')).toBeNull();
		expect(document.querySelector('[role="button"][data-date][data-focus-visible]')).toBeNull();
		expect(document.querySelector('[role="gridcell"][data-date][data-focused]')).toBeNull();
		expect(document.querySelector('[role="gridcell"][data-date][data-focus-visible]')).toBeNull();
	});

	it('composes external onmousedown without losing internal pointer modality handling', async () => {
		const screen = render(DatePickerPopoverHandlerTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

		const dayCell = document.querySelector<HTMLElement>('[role="button"][data-date="2026-02-12"]');
		expect(dayCell).toBeTruthy();
		dayCell?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		dayCell?.click();

		await expect
			.poll(() => document.querySelector('[data-testid="selected-value"]')?.textContent)
			.toBe('2026-02-12');
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		await expect
			.poll(() =>
				Number(document.querySelector('[data-testid="pointer-down-calls"]')?.textContent ?? '0')
			)
			.toBeGreaterThan(0);
		await expect.poll(() => trigger.element()?.getAttribute('data-focus-visible')).toBeNull();
	});

	it('composes external onkeydowncapture without losing keyboard modality handling', async () => {
		const screen = render(DatePickerPopoverHandlerTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

		const activeCell = document.querySelector<HTMLElement>(
			'[role="button"][data-date][tabindex="0"]'
		);
		expect(activeCell).toBeTruthy();
		activeCell?.focus();
		await userEvent.keyboard('{ArrowRight}');
		await userEvent.keyboard('{Enter}');

		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		await expect
			.poll(() =>
				Number(document.querySelector('[data-testid="keydown-capture-calls"]')?.textContent ?? '0')
			)
			.toBeGreaterThan(0);
		await expect.poll(() => trigger.element()?.getAttribute('data-focus-visible')).toBe('true');
	});

	it('ignores unsafe forbidden Popover props and preserves internal dialog id', async () => {
		const { vi } = await import('vitest');
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		try {
			render(DatePickerPopoverUnsafePropsTest);
			await expect.poll(() => document.querySelector<HTMLElement>('[role="dialog"]')).toBeTruthy();
			const dialog = document.querySelector<HTMLElement>('[role="dialog"]');

			expect(dialog?.id).not.toBe('unsafe-popover-id');
			expect(dialog?.id).toContain('-popover');
			expect(
				warnSpy.mock.calls.some(
					(args) => typeof args[0] === 'string' && args[0].includes('DatePicker.Popover')
				)
			).toBe(true);
		} finally {
			warnSpy.mockRestore();
		}
	});
});
