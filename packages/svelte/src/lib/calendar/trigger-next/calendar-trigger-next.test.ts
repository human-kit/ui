import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CalendarRootTest from '../root/calendar-root-test.svelte';

describe('Calendar.TriggerNext', () => {
	it('navigates to next page when clicked', async () => {
		const screen = render(CalendarRootTest, { defaultValue: '2026-02-10' });
		const heading = screen.getByRole('heading');
		const nextButton = screen.getByRole('button', { name: 'Next' });

		const before = heading.element()?.textContent;
		await nextButton.click();
		const after = heading.element()?.textContent;

		expect(before).not.toEqual(after);
	});

	it('is disabled when calendar is disabled', async () => {
		const screen = render(CalendarRootTest, { isDisabled: true });
		const nextButton = screen.getByRole('button', { name: 'Next' });

		await expect.element(nextButton).toBeDisabled();
	});
});
