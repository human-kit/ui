import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TimePickerTest from '../root/time-picker-test.svelte';

function getSegment(type: 'hour' | 'minute' | 'second' | 'dayPeriod') {
  const element = document.querySelector<HTMLElement>(`[role="spinbutton"][data-type="${type}"]`);
  if (!element) {
    throw new Error(`Segment "${type}" was not rendered.`);
  }

  return {
    element: () => element,
    click: () => element.click()
  };
}

describe('TimePicker.Input', () => {
  afterEach(() => {
    const dialogs = document.querySelectorAll('[role="dialog"]');
    dialogs.forEach((dialog) => dialog.remove());
  });

  it('renders editable spinbutton segments (hour, minute)', async () => {
    render(TimePickerTest);

    const hour = document.querySelector('[role="spinbutton"][data-type="hour"]');
    const minute = document.querySelector('[role="spinbutton"][data-type="minute"]');

    expect(hour).toBeTruthy();
    expect(minute).toBeTruthy();
  });

  it('does not open popover when segment is clicked', async () => {
    render(TimePickerTest);
    const hourSegment = getSegment('hour');

    await hourSegment.click();
    await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('focuses a segment when clicking input container', async () => {
    const screen = render(TimePickerTest);
    const inputGroup = screen.getByRole('group', { name: 'Time input' });

    await inputGroup.click();

    await expect
      .poll(() => document.activeElement?.getAttribute('data-time-picker-segment'))
      .toBe('true');
    await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('uses group role with provided accessible label', async () => {
    const screen = render(TimePickerTest);
    const inputGroup = screen.getByRole('group', { name: 'Time input' });

    expect(inputGroup.element()?.getAttribute('id')).toContain('-input');
  });

  it('does not move focus into segments when disabled', async () => {
    const screen = render(TimePickerTest, { isDisabled: true });
    const inputGroup = screen.getByRole('group', { name: 'Time input' });

    await inputGroup.click();
    expect(document.activeElement?.getAttribute('data-time-picker-segment')).not.toBe('true');
  });
});
