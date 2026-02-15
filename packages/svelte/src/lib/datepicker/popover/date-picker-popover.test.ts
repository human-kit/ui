import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DatePickerTest from '../root/date-picker-test.svelte';

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
});
