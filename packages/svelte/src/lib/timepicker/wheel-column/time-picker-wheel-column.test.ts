import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TimePickerTest from '../root/time-picker-test.svelte';

function getPanelColumns(): HTMLElement[] {
  const panel = document.querySelector<HTMLElement>('[data-time-picker-time-panel="true"]');
  if (!panel) return [];
  return Array.from(panel.querySelectorAll<HTMLElement>('[role="spinbutton"]'));
}

describe('TimePicker.WheelColumn', () => {
  afterEach(() => {
    const dialogs = document.querySelectorAll('[role="dialog"]');
    dialogs.forEach((dialog) => dialog.remove());
  });

  it('renders spinbutton columns when popover is open', async () => {
    render(TimePickerTest, { defaultOpen: true });

    const spinbuttons = getPanelColumns();
    expect(spinbuttons.length).toBe(2);
  });

  it('exposes aria values for selected option', async () => {
    render(TimePickerTest, { defaultOpen: true });

    const firstColumn = getPanelColumns().at(0);
    expect(firstColumn).toBeTruthy();
    expect(firstColumn?.getAttribute('aria-valuenow')).toBeTruthy();
    expect(firstColumn?.getAttribute('aria-valuetext')).toBeTruthy();
  });

  it('moves focus across columns with ArrowRight and ArrowLeft', async () => {
    render(TimePickerTest, { defaultOpen: true });

    const columns = getPanelColumns();
    expect(columns.length).toBe(2);

    const hourColumn = columns[0];
    const minuteColumn = columns[1];

    hourColumn.focus();
    hourColumn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    await expect.poll(() => document.activeElement).toBe(minuteColumn);

    minuteColumn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await expect.poll(() => document.activeElement).toBe(hourColumn);
  });

  it('renders top and bottom spacers', async () => {
    render(TimePickerTest, { defaultOpen: true });

    const firstColumn = getPanelColumns().at(0);
    const topSpacer = firstColumn?.querySelector('[data-wheel-spacer="top"]');
    const bottomSpacer = firstColumn?.querySelector('[data-wheel-spacer="bottom"]');

    expect(topSpacer).toBeTruthy();
    expect(bottomSpacer).toBeTruthy();
  });
});
