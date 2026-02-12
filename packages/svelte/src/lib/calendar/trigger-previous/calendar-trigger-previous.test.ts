import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CalendarRootTest from '../root/calendar-root-test.svelte';

describe('Calendar.TriggerPrevious', () => {
  it('navigates to previous page when clicked', async () => {
    const screen = render(CalendarRootTest, { defaultValue: '2026-02-10' });
    const heading = screen.getByRole('heading');
    const previousButton = screen.getByRole('button', { name: 'Previous' });

    const before = heading.element()?.textContent;
    await previousButton.click();
    const after = heading.element()?.textContent;

    expect(before).not.toEqual(after);
  });

  it('is disabled when calendar is disabled', async () => {
    const screen = render(CalendarRootTest, { isDisabled: true });
    const previousButton = screen.getByRole('button', { name: 'Previous' });

    await expect.element(previousButton).toBeDisabled();
  });
});
