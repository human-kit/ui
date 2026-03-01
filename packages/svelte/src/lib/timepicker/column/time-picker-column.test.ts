import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import TimePickerTest from '../root/time-picker-test.svelte';
import {
  expectFocusVisibleImpliesFocusWithin,
  expectNoFalseFocusAttributes
} from '../../test-utils/focus-contract';

describe('TimePicker.Column', () => {
  afterEach(() => {
    const dialogs = document.querySelectorAll('[role="dialog"]');
    dialogs.forEach((dialog) => dialog.remove());
  });

  it('renders listbox columns when popover is open', async () => {
    render(TimePickerTest, { defaultOpen: true });

    const listboxes = document.querySelectorAll('[role="listbox"]');
    expect(listboxes.length).toBeGreaterThan(0);
  });

  it('renders options inside the hour column', async () => {
    render(TimePickerTest, { defaultOpen: true });

    const firstListbox = document.querySelectorAll<HTMLElement>('[role="listbox"]').item(0);
    expect(firstListbox).toBeTruthy();

    const options = firstListbox?.querySelectorAll('[role="option"]') ?? [];
    expect(options.length).toBeGreaterThan(10);
  });

  it('moves option focus with ArrowDown / ArrowUp', async () => {
    render(TimePickerTest, { defaultOpen: true });

    const firstListbox = document.querySelectorAll<HTMLElement>('[role="listbox"]').item(0);
    expect(firstListbox).toBeTruthy();

    firstListbox?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await expect.poll(() => document.activeElement?.getAttribute('role')).toBe('option');

    firstListbox?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await expect.poll(() => document.activeElement?.getAttribute('role')).toBe('option');
  });

  it('exposes focus contract attributes during keyboard flow', async () => {
    render(TimePickerTest, { defaultOpen: true });
    const firstListbox = document.querySelectorAll<HTMLElement>('[role="listbox"]').item(0);
    expect(firstListbox).toBeTruthy();

    const selected = firstListbox?.querySelector<HTMLElement>('[role="option"][aria-selected="true"]');
    expect(selected).toBeTruthy();
    selected?.focus();
    await userEvent.keyboard('{ArrowDown}');

    await expect.poll(() => firstListbox?.getAttribute('data-focus-within')).toBe('true');
    await expect.poll(() => firstListbox?.getAttribute('data-focus-visible')).toBe('true');
    expectFocusVisibleImpliesFocusWithin(firstListbox);
    expectNoFalseFocusAttributes(firstListbox ?? document);
  });
});
