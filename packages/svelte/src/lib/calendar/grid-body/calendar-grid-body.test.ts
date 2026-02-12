import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CalendarRootTest from '../root/calendar-root-test.svelte';
import CalendarGridBodyCustomTest from './calendar-grid-body-custom-test.svelte';

describe('Calendar.GridBody', () => {
  it('renders six week rows', async () => {
    render(CalendarRootTest);
    const rows = document.querySelectorAll('tbody tr[data-week]');
    expect(rows.length).toBe(6);
  });

  it('renders 42 grid cells (6x7)', async () => {
    render(CalendarRootTest);
    const cells = document.querySelectorAll('[role="gridcell"]');
    expect(cells.length).toBe(42);
  });

  it('supports custom body cell rendering', async () => {
    render(CalendarGridBodyCustomTest);
    const isoCell = Array.from(document.querySelectorAll('[role="gridcell"]')).find((cell) =>
      /\d{4}-\d{2}-\d{2}/.test(cell.textContent ?? '')
    );

    expect(isoCell).toBeTruthy();
  });
});
