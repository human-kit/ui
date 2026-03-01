import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import TimePickerTest from '../root/time-picker-test.svelte';
import TimePickerEmptyTest from '../root/time-picker-empty-test.svelte';
import TimePicker12hTest from '../root/time-picker-12h-test.svelte';

function getSegment(type: 'hour' | 'minute' | 'second' | 'dayPeriod') {
  const elements = document.querySelectorAll<HTMLElement>(
    `[role="spinbutton"][data-type="${type}"]`
  );
  const element = elements.item(elements.length - 1);
  if (!element) {
    throw new Error(`Segment "${type}" was not rendered.`);
  }

  return {
    element: () => element,
    click: () => element.click()
  };
}

function getLatestTestIdText(testId: string): string {
  const elements = document.querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`);
  const element = elements.item(elements.length - 1);
  return element?.textContent ?? '';
}

describe('TimePicker.Segment', () => {
  afterEach(() => {
    const dialogs = document.querySelectorAll('[role="dialog"]');
    dialogs.forEach((dialog) => dialog.remove());
  });

  it('renders literal separators as non-interactive elements', async () => {
    render(TimePickerTest);
    const literal = document.querySelector('[data-type="literal"]');

    expect(literal).toBeTruthy();
    expect(literal?.tagName.toLowerCase()).toBe('span');
  });

  it('sets focused state when segment receives focus', async () => {
    render(TimePickerTest);
    const hourSegment = getSegment('hour');

    hourSegment.element()?.focus();
    await expect.poll(() => hourSegment.element()?.getAttribute('data-focused')).toBe('true');
  });

  it('increments hour segment value with ArrowUp', async () => {
    render(TimePickerTest);
    const hourSegment = getSegment('hour');

    hourSegment.element()?.focus();
    await userEvent.keyboard('{ArrowUp}');

    await expect
      .poll(() => getLatestTestIdText('time-picker-value'))
      .toBe('15:30');
  });

  it('renders minutes with leading zero while keeping hour unpadded', async () => {
    render(TimePickerTest, { defaultValue: '05:05' });
    const hourSegment = getSegment('hour');
    const minuteSegment = getSegment('minute');

    expect(hourSegment.element()?.textContent).toBe('5');
    expect(minuteSegment.element()?.textContent).toBe('05');
  });

  it('moves focus to previous segment on backspace when current segment is empty', async () => {
    render(TimePickerTest);
    const minuteSegment = getSegment('minute');

    minuteSegment.element()?.focus();
    await userEvent.keyboard('{Backspace}');
    await userEvent.keyboard('{Backspace}');
    await userEvent.keyboard('{Backspace}');

    expect(document.activeElement?.getAttribute('data-type')).toBe('hour');
  });

  it('does not commit full time when only one segment is edited', async () => {
    render(TimePickerEmptyTest);
    const hourSegment = getSegment('hour');

    hourSegment.element()?.focus();
    await userEvent.keyboard('1');
    await userEvent.keyboard('4');

    await expect
      .poll(() => getLatestTestIdText('bind-value'))
      .toBe('');
  });

  it('keeps partial hour draft when focus leaves input without completing minute', async () => {
    render(TimePickerEmptyTest);
    const hourSegment = getSegment('hour');

    hourSegment.element()?.focus();
    await userEvent.keyboard('0');
    await userEvent.keyboard('1');
    await userEvent.click(document.querySelector('[data-testid="outside-button"]') as HTMLElement);

    await expect.poll(() => hourSegment.element()?.textContent).toBe('1');
    await expect.poll(() => getLatestTestIdText('bind-value')).toBe('');
  });

  it('keeps both digits when typing minute values like 25', async () => {
    render(TimePickerTest, { defaultValue: '14:30' });
    const minuteSegment = getSegment('minute');

    minuteSegment.element()?.focus();
    await userEvent.keyboard('{Backspace}');
    await userEvent.keyboard('{Backspace}');
    await userEvent.keyboard('2');
    await userEvent.keyboard('5');

    await expect.poll(() => minuteSegment.element()?.textContent).toBe('25');
    await expect
      .poll(() => getLatestTestIdText('time-picker-value'))
      .toBe('14:25');
  });

  it('updates dayPeriod with keyboard in 12h mode', async () => {
    render(TimePicker12hTest);
    const dayPeriodSegment = getSegment('dayPeriod');

    dayPeriodSegment.element()?.focus();
    await userEvent.keyboard('a');

    await expect
      .poll(() => getLatestTestIdText('bind-value'))
      .toBe('02:30');
  });

  it('clears dayPeriod on backspace and auto-sets AM when editing hour again', async () => {
    render(TimePicker12hTest);
    const dayPeriodSegment = getSegment('dayPeriod');
    const hourSegment = getSegment('hour');

    dayPeriodSegment.element()?.focus();
    await userEvent.keyboard('{Backspace}');
    await userEvent.keyboard('{Backspace}');
    await expect.poll(() => getLatestTestIdText('bind-value')).toBe('');

    hourSegment.element()?.focus();
    await userEvent.keyboard('{Backspace}');
    await userEvent.keyboard('1');

    await expect.poll(() => dayPeriodSegment.element()?.textContent).toBe('AM');
    await expect.poll(() => getLatestTestIdText('bind-value')).toBe('01:30');
  });
});
