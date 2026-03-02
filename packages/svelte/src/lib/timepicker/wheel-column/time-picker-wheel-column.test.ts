import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TimePickerTest from '../root/time-picker-test.svelte';
import TimePickerWheelColumnBindableTest from './time-picker-wheel-column-bindable-test.svelte';

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

  it('updates value with ArrowDown keyboard navigation', async () => {
    render(TimePickerTest, { defaultOpen: true });
    const firstColumn = getPanelColumns().at(0);
    expect(firstColumn).toBeTruthy();

    firstColumn?.focus();
    firstColumn?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

    await expect
      .poll(() => document.querySelector('[data-testid="time-picker-value"]')?.textContent)
      .toBe('15:30');
  });

  it('sets focus data attributes on keyboard focus', async () => {
    render(TimePickerTest, { defaultOpen: true });
    const firstColumn = getPanelColumns().at(0);
    expect(firstColumn).toBeTruthy();

    firstColumn?.focus();
    firstColumn?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

    await expect.poll(() => firstColumn?.getAttribute('data-focus-within')).toBe('true');
    await expect.poll(() => firstColumn?.getAttribute('data-focus-visible')).toBe('true');
  });

  it('marks out-of-range options as disabled with min/max', async () => {
    render(TimePickerTest, {
      defaultOpen: true,
      defaultValue: '09:30',
      minValue: '09:00',
      maxValue: '17:00'
    });

    const firstColumn = getPanelColumns().at(0);
    const disabledItems =
      firstColumn?.querySelectorAll('[data-wheel-item][data-disabled="true"]') ?? [];
    expect(disabledItems.length).toBeGreaterThan(0);
  });

  it('syncs wheel position when value changes externally while open', async () => {
    render(TimePickerWheelColumnBindableTest);
    const firstColumn = getPanelColumns().at(0);
    expect(firstColumn).toBeTruthy();

    const setValueButton = document.querySelector<HTMLElement>('[data-testid="set-value-16-45"]');
    expect(setValueButton).toBeTruthy();
    setValueButton?.click();

    await expect.poll(() => firstColumn?.getAttribute('aria-valuetext')).toBe('16');
    await expect
      .poll(() => document.querySelector('[data-testid="bind-value"]')?.textContent)
      .toBe('16:45');
  });
});
