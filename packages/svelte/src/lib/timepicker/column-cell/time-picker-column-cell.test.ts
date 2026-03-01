import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import TimePickerTest from '../root/time-picker-test.svelte';
import TimePickerBindableTest from '../root/time-picker-bindable-test.svelte';
import {
  expectFocusVisibleImpliesFocused,
  expectNoFalseFocusAttributes
} from '../../test-utils/focus-contract';

function findOptionByText(container: ParentNode, text: string): HTMLElement | null {
  const options = Array.from(container.querySelectorAll<HTMLElement>('[role="option"]'));
  return options.find((option) => option.textContent?.trim() === text) ?? null;
}

function getLatestTestIdText(testId: string): string {
  const elements = document.querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`);
  const element = elements.item(elements.length - 1);
  return element?.textContent ?? '';
}

function getLatestPanelColumns(): HTMLElement[] {
  const panels = document.querySelectorAll<HTMLElement>('[data-time-picker-time-panel="true"]');
  const panel = panels.item(panels.length - 1);
  if (!panel) return [];
  return Array.from(panel.querySelectorAll<HTMLElement>('[role="listbox"]'));
}

describe('TimePicker.ColumnCell', () => {
  afterEach(() => {
    const dialogs = document.querySelectorAll('[role="dialog"]');
    dialogs.forEach((dialog) => dialog.remove());
  });

  it('renders options with role="option" and selection state', async () => {
    render(TimePickerTest, { defaultOpen: true });
    const firstListbox = document.querySelectorAll<HTMLElement>('[role="listbox"]').item(0);
    expect(firstListbox).toBeTruthy();

    const selectedOption = firstListbox?.querySelector<HTMLElement>('[role="option"][aria-selected="true"]');
    expect(selectedOption).toBeTruthy();
  });

  it('updates bound value when clicking an enabled option', async () => {
    const screen = render(TimePickerBindableTest);
    const trigger = screen.getByRole('button', { name: 'Open time picker' });

    await trigger.click();
    await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

    const firstListbox = document.querySelectorAll<HTMLElement>('[role="listbox"]').item(0);
    const option = findOptionByText(firstListbox, '16');
    expect(option).toBeTruthy();
    option?.click();

    await expect.poll(() => document.querySelector('[data-testid="bind-value"]')?.textContent).toBe('16:30');
  });

  it('updates bound value when selecting option with Enter key', async () => {
    const screen = render(TimePickerBindableTest);
    const trigger = screen.getByRole('button', { name: 'Open time picker' });

    await trigger.click();
    await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

    const firstListbox = document.querySelectorAll<HTMLElement>('[role="listbox"]').item(0);
    const option = findOptionByText(firstListbox, '17');
    expect(option).toBeTruthy();
    option?.focus();
    option?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    await expect.poll(() => document.querySelector('[data-testid="bind-value"]')?.textContent).toBe('17:30');
  });

  it('keeps popover open after selecting an option by default', async () => {
    render(TimePickerTest, { defaultOpen: true });

    const firstListbox = document.querySelectorAll<HTMLElement>('[role="listbox"]').item(0);
    const option = findOptionByText(firstListbox, '16');
    expect(option).toBeTruthy();
    option?.click();

    await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
    await expect.poll(() => getLatestTestIdText('time-picker-open')).toBe('true');
  });

  it('closes popover after selecting an option when shouldCloseOnSelect is true', async () => {
    render(TimePickerTest, { defaultOpen: true, shouldCloseOnSelect: true });

    const firstListbox = document.querySelectorAll<HTMLElement>('[role="listbox"]').item(0);
    const option = findOptionByText(firstListbox, '16');
    expect(option).toBeTruthy();
    option?.click();

    await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
    await expect.poll(() => getLatestTestIdText('time-picker-open')).toBe('false');
  });

  it('moves focus to next and previous columns with ArrowRight / ArrowLeft', async () => {
    render(TimePickerTest, { defaultOpen: true });

    await expect.poll(() => getLatestPanelColumns().length).toBe(2);

    const columns = getLatestPanelColumns();
    const hourColumn = columns[0];
    const minuteColumn = columns[1];
    expect(hourColumn).toBeTruthy();
    expect(minuteColumn).toBeTruthy();

    const hourOption = hourColumn?.querySelector<HTMLElement>('[role="option"][aria-selected="true"]');
    expect(hourOption).toBeTruthy();
    hourOption?.focus();

    hourOption?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await expect
      .poll(() => (document.activeElement as HTMLElement | null)?.closest('[role="listbox"]'))
      .toBe(minuteColumn);

    (document.activeElement as HTMLElement | null)?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
    );
    await expect
      .poll(() => (document.activeElement as HTMLElement | null)?.closest('[role="listbox"]'))
      .toBe(hourColumn);
  });

  it('auto-advances to the next column after keyboard selection with Enter', async () => {
    render(TimePickerTest, { defaultOpen: true });

    await expect.poll(() => getLatestPanelColumns().length).toBe(2);

    const columns = getLatestPanelColumns();
    const hourColumn = columns[0];
    const minuteColumn = columns[1];
    const hourOption = findOptionByText(hourColumn, '16');
    expect(hourOption).toBeTruthy();

    hourOption?.focus();
    hourOption?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    await expect.poll(() => getLatestTestIdText('time-picker-value')).toBe('16:30');
    await expect
      .poll(() => (document.activeElement as HTMLElement | null)?.closest('[role="listbox"]'))
      .toBe(minuteColumn);
  });

  it('auto-advances to next column on click without setting data-focus-visible', async () => {
    render(TimePickerTest, { defaultOpen: true });

    await expect.poll(() => getLatestPanelColumns().length).toBe(2);
    const columns = getLatestPanelColumns();
    const hourColumn = columns[0];
    const minuteColumn = columns[1];
    const hourOption = findOptionByText(hourColumn, '16');
    expect(hourOption).toBeTruthy();

    hourOption?.click();

    await expect.poll(() => getLatestTestIdText('time-picker-value')).toBe('16:30');
    await expect
      .poll(() => (document.activeElement as HTMLElement | null)?.closest('[role="listbox"]'))
      .toBe(minuteColumn);
    await expect.poll(() => (document.activeElement as HTMLElement | null)?.getAttribute('data-focused')).toBe(
      'true'
    );
    await expect.poll(() => (document.activeElement as HTMLElement | null)?.getAttribute('data-focus-visible')).toBeNull();
  });

  it('sets data-focused and data-focus-visible on keyboard-focused options', async () => {
    render(TimePickerTest, { defaultOpen: true });

    const columns = getLatestPanelColumns();
    const hourColumn = columns[0];
    const selected = hourColumn?.querySelector<HTMLElement>('[role="option"][aria-selected="true"]');
    expect(selected).toBeTruthy();
    selected?.focus();
    await userEvent.keyboard('{ArrowDown}');

    const active = document.activeElement as HTMLElement | null;
    await expect.poll(() => active?.getAttribute('data-focused')).toBe('true');
    await expect.poll(() => active?.getAttribute('data-focus-visible')).toBe('true');
    expectFocusVisibleImpliesFocused(active);
    expectNoFalseFocusAttributes(hourColumn ?? document);
  });

  it('does not keep data-focus-visible after pointer interaction', async () => {
    render(TimePickerTest, { defaultOpen: true });

    const columns = getLatestPanelColumns();
    const hourColumn = columns[0];
    const selected = hourColumn?.querySelector<HTMLElement>('[role="option"][aria-selected="true"]');
    expect(selected).toBeTruthy();

    selected?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    selected?.focus();
    await expect.poll(() => selected?.getAttribute('data-focus-visible')).toBeNull();
    expectNoFalseFocusAttributes(hourColumn ?? document);
  });
});
