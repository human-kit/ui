import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CalendarRootTest from '../root/calendar-root-test.svelte';

describe('Calendar.Heading', () => {
	it('renders a single-month heading by default', async () => {
		const screen = render(CalendarRootTest, { defaultValue: '2026-02-10' });
		const heading = screen.getByRole('heading');

		await expect.element(heading).toBeInTheDocument();
		expect(heading.element()?.textContent).toContain('2026');
	});

	it('renders a month range heading when visibleMonths is 2', async () => {
		const screen = render(CalendarRootTest, { defaultValue: '2026-02-10', visibleMonths: 2 });
		const heading = screen.getByRole('heading');

		expect(heading.element()?.textContent).toContain('-');
	});
});
