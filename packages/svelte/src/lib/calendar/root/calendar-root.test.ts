import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CalendarRootTest from './calendar-root-test.svelte';
import CalendarRootBindValueTest from './calendar-root-bind-value-test.svelte';
import CalendarRootControlledClearTest from './calendar-root-controlled-clear-test.svelte';

function pressKey(element: Element, key: string) {
  element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('Calendar', () => {
  it('renders heading and grid', async () => {
    const screen = render(CalendarRootTest);
    const heading = screen.getByRole('heading');
    const grid = screen.getByRole('grid');

    await expect.element(heading).toBeInTheDocument();
    await expect.element(grid).toBeInTheDocument();
  });

  it('shows multiple grids when visibleMonths is greater than 1', async () => {
    render(CalendarRootTest, { visibleMonths: 2 });
    const grids = document.querySelectorAll('[role="grid"]');
    expect(grids.length).toBe(2);
  });

  it('navigates months with next trigger', async () => {
    const screen = render(CalendarRootTest);
    const heading = screen.getByRole('heading');
    const next = screen.getByRole('button', { name: 'Next' });

    const before = heading.element()?.textContent;
    await next.click();
    const after = heading.element()?.textContent;

    expect(before).not.toEqual(after);
  });

  it('selects a date when clicking a day cell', async () => {
    render(CalendarRootTest);
    const cells = Array.from(document.querySelectorAll('[role="gridcell"]'));
    const dayCell = cells.find((cell: Element) =>
      /\d{4}-\d{2}-\d{2}/.test(cell.getAttribute('aria-label') ?? '')
    );

    expect(dayCell).toBeTruthy();
    await (dayCell as HTMLElement).click();

    const selectedCell = document.querySelector('[data-selected]');
    expect(selectedCell).toBeTruthy();
  });

  it('prevents selecting unavailable dates', async () => {
    const unavailableDate = '2026-02-15';
    const screen = render(CalendarRootTest, {
      defaultValue: '2026-02-10',
      isDateUnavailable: (date: string) => date === unavailableDate
    });

    const unavailableCell = screen.getByRole('gridcell', { name: unavailableDate });
    await expect.element(unavailableCell).toHaveAttribute('aria-disabled', 'true');

    const selectedCell = document.querySelector(`[data-selected] [role="gridcell"][aria-label="${unavailableDate}"]`);
    expect(selectedCell).toBeFalsy();
  });

  it('updates bind:value when selecting a date', async () => {
    const screen = render(CalendarRootBindValueTest);
    const day = screen.getByRole('gridcell', { name: '2026-02-12' });

    await day.click();
    expect(document.querySelector('[data-testid="calendar-value"]')?.textContent).toBe('2026-02-12');
  });

  it('clears selected state when controlled value becomes empty', async () => {
    const screen = render(CalendarRootControlledClearTest);

    await expect
      .poll(() => document.querySelector('[data-selected] [role="gridcell"][aria-label="2026-02-10"]'))
      .toBeTruthy();

    const clearButton = screen.getByTestId('clear-value');
    await clearButton.click();

    await expect.poll(() => document.querySelector('[data-selected]')).toBeFalsy();
    expect(document.querySelector('[data-testid="calendar-value"]')?.textContent).toBe('');
  });

  it('does not recompute unavailable predicate for cached visible dates on selection', async () => {
    const isDateUnavailable = vi.fn((date: string) => date === '2026-02-15');
    const screen = render(CalendarRootTest, {
      defaultValue: '2026-02-10',
      isDateUnavailable
    });

    const initialCalls = isDateUnavailable.mock.calls.length;
    const day = screen.getByRole('gridcell', { name: '2026-02-12' });
    await day.click();

    expect(isDateUnavailable.mock.calls.length).toBe(initialCalls);
  });

  it('moves focus with arrow keys across dates', async () => {
    const screen = render(CalendarRootTest, { defaultValue: '2026-02-10' });
    const day = screen.getByRole('gridcell', { name: '2026-02-10' });
    const dayElement = day.element()!;

    dayElement.focus();
    pressKey(dayElement, 'ArrowRight');

    await expect.poll(() => document.activeElement?.getAttribute('aria-label')).toBe('2026-02-11');
  });

  it('moves focus across month boundary with arrows', async () => {
    const screen = render(CalendarRootTest, { defaultValue: '2026-02-28' });
    const day = screen.getByRole('gridcell', { name: '2026-02-28' });
    const dayElement = day.element()!;

    dayElement.focus();
    pressKey(dayElement, 'ArrowRight');

    await expect.poll(() => document.activeElement?.getAttribute('aria-label')).toBe('2026-03-01');
  });

  it('moves by month with PageUp and PageDown keeping day number', async () => {
    const screen = render(CalendarRootTest, { defaultValue: '2026-10-10' });
    const day = screen.getByRole('gridcell', { name: '2026-10-10' });
    const dayElement = day.element()!;

    dayElement.focus();
    pressKey(dayElement, 'PageUp');
    await expect.poll(() => document.activeElement?.getAttribute('aria-label')).toBe('2026-09-10');

    pressKey(document.activeElement!, 'PageDown');
    await expect.poll(() => document.activeElement?.getAttribute('aria-label')).toBe('2026-10-10');
  });

  it('moves to month start/end with Home and End', async () => {
    const screen = render(CalendarRootTest, { defaultValue: '2026-10-10' });
    const day = screen.getByRole('gridcell', { name: '2026-10-10' });
    const dayElement = day.element()!;

    dayElement.focus();
    pressKey(dayElement, 'Home');
    await expect.poll(() => document.activeElement?.getAttribute('aria-label')).toBe('2026-10-01');

    pressKey(document.activeElement!, 'End');
    await expect.poll(() => document.activeElement?.getAttribute('aria-label')).toBe('2026-10-31');
  });

  it('skips unavailable dates during keyboard navigation', async () => {
    const screen = render(CalendarRootTest, {
      defaultValue: '2026-02-14',
      isDateUnavailable: (date: string) => date === '2026-02-15'
    });
    const day = screen.getByRole('gridcell', { name: '2026-02-14' });
    const dayElement = day.element()!;

    dayElement.focus();
    pressKey(dayElement, 'ArrowRight');

    await expect.poll(() => document.activeElement?.getAttribute('aria-label')).toBe('2026-02-16');
  });
});
