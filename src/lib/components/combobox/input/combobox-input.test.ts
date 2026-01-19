import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ComboBoxTest from '../root/combobox-test.svelte';

describe('ComboBox.Input', () => {
  describe('Accessibility', () => {
    it('has role="combobox"', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      await expect.element(input).toBeInTheDocument();
    });

    it('has aria-autocomplete="list"', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      await expect.element(input).toHaveAttribute('aria-autocomplete', 'list');
    });

    it('has aria-expanded matching open state', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      // Initially closed
      await expect.element(input).toHaveAttribute('aria-expanded', 'false');

      // Open popover
      await input.click();
      await userEvent.keyboard('{ArrowDown}');

      await expect.element(input).toHaveAttribute('aria-expanded', 'true');
    });

    it('has aria-haspopup="listbox"', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      await expect.element(input).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('has aria-controls pointing to listbox', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      const ariaControls = input.element().getAttribute('aria-controls');
      expect(ariaControls).toMatch(/^combobox-listbox-/);
    });

    it('updates aria-activedescendant when navigating', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      // Open and navigate
      await input.click();
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{ArrowDown}');

      const activeDescendant = input.element().getAttribute('aria-activedescendant');
      expect(activeDescendant).toBeTruthy();
      expect(activeDescendant).toMatch(/^combobox-item-/);
    });
  });

  describe('Typing behavior', () => {
    it('opens popover when typing with trigger="focus"', async () => {
      const screen = render(ComboBoxTest, { trigger: 'focus' });
      const input = screen.getByRole('combobox');

      // Click to focus and trigger open (trigger="focus")
      await input.click();

      await expect.element(input).toHaveAttribute('aria-expanded', 'true');
    });

    it('updates input value when typing', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      await input.click();
      await userEvent.type(input.element(), 'Arg');

      await expect.element(input).toHaveValue('Arg');
    });
  });

  describe('Keyboard navigation', () => {
    it('opens on ArrowDown', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      await input.click();
      await userEvent.keyboard('{ArrowDown}');

      await expect.element(input).toHaveAttribute('aria-expanded', 'true');
    });

    it('opens on ArrowUp', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      await input.click();
      await userEvent.keyboard('{ArrowUp}');

      await expect.element(input).toHaveAttribute('aria-expanded', 'true');
    });

    it('closes on Escape', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      // Open
      await input.click();
      await userEvent.keyboard('{ArrowDown}');
      await expect.element(input).toHaveAttribute('aria-expanded', 'true');

      // Close
      await userEvent.keyboard('{Escape}');
      await expect.element(input).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
