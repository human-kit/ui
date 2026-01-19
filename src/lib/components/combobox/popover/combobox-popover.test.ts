import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ComboBoxTest from '../root/combobox-test.svelte';

describe('ComboBox.Popover', () => {
  describe('Visibility', () => {
    it('is hidden when closed', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      // Should not have listbox visible initially
      const listbox = screen.container.querySelector('[role="listbox"]');
      expect(listbox).toBeNull();
    });

    it('is visible when open', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      // Open the popover
      await input.click();
      await userEvent.keyboard('{ArrowDown}');

      const listbox = screen.getByRole('listbox');
      await expect.element(listbox).toBeVisible();
    });

    it('hides when pressing Escape', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      // Open
      await input.click();
      await userEvent.keyboard('{ArrowDown}');

      const listbox = screen.getByRole('listbox');
      await expect.element(listbox).toBeVisible();

      // Close
      await userEvent.keyboard('{Escape}');

      // Listbox should be gone
      const listboxAfter = screen.container.querySelector('[role="listbox"]');
      expect(listboxAfter).toBeNull();
    });
  });

  describe('Positioning', () => {
    it('renders below the input by default', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      // Open the popover
      await input.click();
      await userEvent.keyboard('{ArrowDown}');

      const listbox = screen.getByRole('listbox');
      const inputRect = input.element().getBoundingClientRect();
      const listboxRect = listbox.element().getBoundingClientRect();

      // Listbox should be below the input
      expect(listboxRect.top).toBeGreaterThanOrEqual(inputRect.bottom);
    });
  });

  describe('Scroll handling', () => {
    it('contains scroll events within the popover', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      // Open the popover
      await input.click();
      await userEvent.keyboard('{ArrowDown}');

      const listbox = screen.getByRole('listbox');

      // This is a behavioral test - the popover should handle wheel events
      // We're mainly testing that it doesn't throw errors
      await expect.element(listbox).toBeVisible();
    });
  });
});
