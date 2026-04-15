import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ComboBoxTest from '../root/combobox-test.svelte';

describe('ComboBox.Trigger', () => {
  describe('Accessibility', () => {
    it('has correct aria-label when closed', async () => {
      const screen = render(ComboBoxTest);
      const trigger = screen.getByRole('button', { name: 'Open menu' });

      await expect.element(trigger).toBeInTheDocument();
      await expect.element(trigger).toHaveAttribute('aria-label', 'Open menu');
    });

    it('has correct aria-label when open', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      await input.click();
      await userEvent.keyboard('{ArrowDown}');

      const trigger = screen.getByRole('button', { name: 'Close menu' });
      await expect.element(trigger).toHaveAttribute('aria-label', 'Close menu');
    });

    it('reflects pending state from the combobox root', async () => {
      const screen = render(ComboBoxTest, { isPending: true });
      const trigger = screen.getByRole('button', { name: 'Open menu' });

      await expect.element(trigger).toHaveAttribute('data-pending', 'true');
      await expect.element(trigger).toBeDisabled();
    });
  });

  describe('Interaction', () => {
    it('toggles popover on click', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      await expect.element(input).toHaveAttribute('aria-expanded', 'false');

      const openTrigger = screen.getByRole('button', { name: 'Open menu' });
      await openTrigger.click();
      await expect.element(input).toHaveAttribute('aria-expanded', 'true');

      const closeTrigger = screen.getByRole('button', { name: 'Close menu' });
      await closeTrigger.click();
      await expect.element(input).toHaveAttribute('aria-expanded', 'false');
    });

    it('has tabindex -1 by default', async () => {
      const screen = render(ComboBoxTest);
      const trigger = screen.getByRole('button', { name: 'Open menu' });

      await expect.element(trigger).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Visual State', () => {
    it('has data-pressed when open', async () => {
      const screen = render(ComboBoxTest);
      const input = screen.getByRole('combobox');

      await input.click();
      await userEvent.keyboard('{ArrowDown}');

      const trigger = screen.getByRole('button', { name: 'Close menu' });
      await expect.element(trigger).toHaveAttribute('data-pressed', 'true');
    });
  });
});