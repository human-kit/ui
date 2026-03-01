import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TimePickerTimePanelTest from './time-picker-time-panel-test.svelte';

describe('TimePicker.TimePanel', () => {
  afterEach(() => {
    const dialogs = document.querySelectorAll('[role="dialog"]');
    dialogs.forEach((dialog) => dialog.remove());
  });

  it('renders default listbox columns when no snippet is provided', async () => {
    render(TimePickerTimePanelTest, { defaultOpen: true });
    const listboxes = document.querySelectorAll('[role="listbox"]');
    expect(listboxes.length).toBe(2);
  });

  it('renders columns in stable order for second granularity with 12h cycle', async () => {
    render(TimePickerTimePanelTest, {
      defaultOpen: true,
      granularity: 'second',
      hourCycle: 12,
      useSnippet: true
    });

    const columnTypes = Array.from(document.querySelectorAll<HTMLElement>('[data-testid="panel-column"]')).map(
      (column) => column.getAttribute('data-type')
    );
    expect(columnTypes).toEqual(['hour', 'minute', 'second', 'dayPeriod']);
  });

  it('omits minute and second columns when granularity is hour', async () => {
    render(TimePickerTimePanelTest, {
      defaultOpen: true,
      granularity: 'hour',
      hourCycle: 24,
      useSnippet: true
    });

    const columnTypes = Array.from(document.querySelectorAll<HTMLElement>('[data-testid="panel-column"]')).map(
      (column) => column.getAttribute('data-type')
    );
    expect(columnTypes).toEqual(['hour']);
  });
});
