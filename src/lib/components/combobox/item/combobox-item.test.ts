import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ComboBoxTest from '../root/combobox-test.svelte';

describe('ComboBox.Item', () => {
  describe('Accessibility', () => {
    it('has role="option"', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      // Open the popover
      await input.click();
      await userEvent.keyboard('{ArrowDown}');

      const listbox = screen.getByRole('listbox').element();
      const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
      expect(options.length).toBeGreaterThan(0);
    });

    it('has unique id for each item', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      // Open the popover
      await input.click();
      await userEvent.keyboard('{ArrowDown}');

      const listbox = screen.getByRole('listbox').element();
      const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
      const ids = Array.from(options).map((el) => el.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });
  });

  describe('Selection state', () => {
    it('has aria-selected attribute', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      // Open the popover
      await input.click();
      await userEvent.keyboard('{ArrowDown}');

      const listbox = screen.getByRole('listbox').element();
      const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
      const firstOption = options[0];

      // Without selection, should be false
      expect(firstOption.getAttribute('aria-selected')).toBe('false');
    });

    it('updates aria-selected when selected', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      // Open and navigate to first item
      await input.click();
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{ArrowDown}');

      // Select it
      await userEvent.keyboard('{Enter}');

      // Re-open to verify selection state
      await userEvent.keyboard('{ArrowDown}');

      const listbox = screen.getByRole('listbox').element();
      const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
      const selectedOptions = Array.from(options).filter(
        (el) => el.getAttribute('aria-selected') === 'true'
      );
      expect(selectedOptions.length).toBe(1);
    });

    it('has data-selected attribute when selected', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      // Open and navigate to first item
      await input.click();
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{ArrowDown}');

      // Select it
      await userEvent.keyboard('{Enter}');

      // Re-open to verify data attribute
      await userEvent.keyboard('{ArrowDown}');

      const listbox = screen.getByRole('listbox').element();
      const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
      const selectedOptions = Array.from(options).filter((el) => el.hasAttribute('data-selected'));
      expect(selectedOptions.length).toBe(1);
    });
  });

  describe('Virtual Focus', () => {
    it('has data-focused when virtually focused', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      // Open and navigate
      await input.click();
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{ArrowDown}');

      const listbox = screen.getByRole('listbox').element();
      const focusedOptions = listbox.querySelectorAll('[data-focused]');
      expect(focusedOptions.length).toBe(1);
    });

    it('moves focus when navigating with keyboard', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      // Open and navigate
      await input.click();
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{ArrowDown}');

      const listbox = screen.getByRole('listbox').element();
      const firstFocused = listbox.querySelector('[data-focused]');
      const firstFocusedId = firstFocused?.id;

      // Navigate down
      await userEvent.keyboard('{ArrowDown}');

      const secondFocused = listbox.querySelector('[data-focused]');
      const secondFocusedId = secondFocused?.id;

      // Focus should have moved
      expect(secondFocusedId).not.toBe(firstFocusedId);
    });
  });

  describe('Interaction', () => {
    it('selects item on click', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      // Open the popover
      await input.click();
      await userEvent.keyboard('{ArrowDown}');

      // Click on first option
      const listbox = screen.getByRole('listbox').element();
      const firstOption = listbox.querySelector(
        '[role="option"]:not([data-empty-placeholder])'
      ) as HTMLElement;
      await firstOption.click();

      // Should close after selection
      await expect.element(input).toHaveAttribute('aria-expanded', 'false');

      // Input should have value
      const inputValue = (input.element() as HTMLInputElement).value;
      expect(inputValue).toBeTruthy();
    });
  });
});
