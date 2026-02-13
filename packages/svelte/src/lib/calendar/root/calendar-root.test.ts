import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CalendarRootTest from './calendar-root-test.svelte';
import CalendarRootBindValueTest from './calendar-root-bind-value-test.svelte';
import CalendarRootControlledClearTest from './calendar-root-controlled-clear-test.svelte';

function pressKey(element: Element, key: string, options?: { shiftKey?: boolean }) {
  element.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, shiftKey: options?.shiftKey ?? false })
  );
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

  it('confirms a date range with two clicks in range mode', async () => {
    const screen = render(CalendarRootTest, {
      selectionMode: 'range'
    });

    const start = screen.getByRole('gridcell', { name: '2026-02-10' });
    const end = screen.getByRole('gridcell', { name: '2026-02-14' });

    await start.click();
    await end.click();

    await expect
      .poll(() => document.querySelector('[data-range-start] [role="gridcell"][aria-label="2026-02-10"]'))
      .toBeTruthy();
    await expect
      .poll(() => document.querySelector('[data-range-end] [role="gridcell"][aria-label="2026-02-14"]'))
      .toBeTruthy();
    await expect
      .poll(() => document.querySelector('[data-in-range] [role="gridcell"][aria-label="2026-02-12"]'))
      .toBeTruthy();
  });

  it('extends range with Arrow and confirms with Enter', async () => {
    const screen = render(CalendarRootTest, {
      selectionMode: 'range',
      defaultValue: { start: '2026-02-10' }
    });

    const focused = screen.getByRole('gridcell', { name: '2026-02-10' });
    const focusedElement = focused.element()!;
    focusedElement.focus();

    pressKey(focusedElement, 'ArrowRight');
    pressKey(document.activeElement!, 'ArrowRight');
    pressKey(document.activeElement!, 'Enter');

    await expect
      .poll(() => document.querySelector('[data-range-start] [role="gridcell"][aria-label="2026-02-10"]'))
      .toBeTruthy();
    await expect
      .poll(() => document.querySelector('[data-range-end] [role="gridcell"][aria-label="2026-02-12"]'))
      .toBeTruthy();
  });

  it('does not confirm a range that crosses unavailable dates', async () => {
    const screen = render(CalendarRootTest, {
      selectionMode: 'range',
      isDateUnavailable: (date: string) => date === '2026-02-07'
    });

    const start = screen.getByRole('gridcell', { name: '2026-02-02' });
    const blockedCrossingEnd = screen.getByRole('gridcell', { name: '2026-02-08' });

    await start.click();
    await expect.element(blockedCrossingEnd).toHaveAttribute('aria-disabled', 'true');

    await expect
      .poll(() => document.querySelector('[data-range-start] [role="gridcell"][aria-label="2026-02-02"]'))
      .toBeTruthy();
    expect(document.querySelector('[data-range-end] [role="gridcell"][aria-label="2026-02-08"]')).toBeFalsy();
    expect(document.querySelector('[data-in-range]')).toBeFalsy();
  });

  it('disables unreachable dates while waiting for range end', async () => {
    const screen = render(CalendarRootTest, {
      selectionMode: 'range',
      isDateUnavailable: (date: string) => date === '2026-02-07'
    });

    const start = screen.getByRole('gridcell', { name: '2026-02-02' });
    await start.click();

    const reachable = screen.getByRole('gridcell', { name: '2026-02-06' });
    const unreachable = screen.getByRole('gridcell', { name: '2026-02-08' });

    await expect.element(reachable).not.toHaveAttribute('aria-disabled');
    await expect.element(unreachable).toHaveAttribute('aria-disabled', 'true');
  });

  it('cancels pending range with Escape and restores previous committed range', async () => {
    const screen = render(CalendarRootTest, {
      selectionMode: 'range',
      defaultValue: { start: '2026-02-10', end: '2026-02-12' }
    });

    const newStart = screen.getByRole('gridcell', { name: '2026-02-15' });
    await newStart.click();

    const focused = newStart.element()!;
    pressKey(focused, 'Escape');

    await expect
      .poll(() => document.querySelector('[data-range-start] [role="gridcell"][aria-label="2026-02-10"]'))
      .toBeTruthy();
    await expect
      .poll(() => document.querySelector('[data-range-end] [role="gridcell"][aria-label="2026-02-12"]'))
      .toBeTruthy();
  });

  it('shows range trace while moving with keyboard after selecting a range start', async () => {
    const screen = render(CalendarRootTest, {
      selectionMode: 'range'
    });

    const start = screen.getByRole('gridcell', { name: '2026-02-10' });
    const startElement = start.element()!;
    startElement.focus();

    pressKey(startElement, 'Enter');
    pressKey(startElement, 'ArrowRight');

    await expect
      .poll(() => document.querySelector('[data-range-end] [role="gridcell"][aria-label="2026-02-11"]'))
      .toBeTruthy();
    await expect
      .poll(() => document.querySelector('[data-in-range] [role="gridcell"][aria-label="2026-02-10"]'))
      .toBeTruthy();
  });

  it('marks new range start as selected immediately when restarting range', async () => {
    const screen = render(CalendarRootTest, {
      selectionMode: 'range',
      defaultValue: { start: '2026-02-03', end: '2026-02-03' }
    });

    const newStart = screen.getByRole('gridcell', { name: '2026-02-05' });
    await newStart.click();

    await expect.element(newStart).toHaveAttribute('aria-selected', 'true');
    await expect
      .poll(() => document.querySelector('[data-selected] [role="gridcell"][aria-label="2026-02-05"]'))
      .toBeTruthy();
  });

  it('keeps focus on second click when selecting reverse range', async () => {
    const screen = render(CalendarRootTest, {
      selectionMode: 'range'
    });

    const first = screen.getByRole('gridcell', { name: '2026-02-06' });
    const second = screen.getByRole('gridcell', { name: '2026-02-03' });

    await first.click();
    await second.click();

    await expect.poll(() => document.activeElement?.getAttribute('aria-label')).toBe('2026-02-03');
  });

  it('clamps PageUp and PageDown to reachable range bounds while selecting range end', async () => {
    const screen = render(CalendarRootTest, {
      selectionMode: 'range',
      isDateUnavailable: (date: string) => {
        if (!date.startsWith('2026-02-')) return true;
        const day = Number(date.slice(-2));
        return day < 9 || day > 13;
      }
    });

    const start = screen.getByRole('gridcell', { name: '2026-02-09' });
    await start.click();
    const startElement = start.element()!;
    startElement.focus();

    pressKey(startElement, 'PageDown');
    await expect.poll(() => document.activeElement?.getAttribute('aria-label')).toBe('2026-02-13');

    pressKey(document.activeElement!, 'PageUp');
    await expect.poll(() => document.activeElement?.getAttribute('aria-label')).toBe('2026-02-09');
  });
});
