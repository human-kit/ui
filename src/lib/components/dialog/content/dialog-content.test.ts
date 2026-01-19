import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import DialogTest from '../root/dialog-test.svelte';

describe('Dialog.Content', () => {
  // Clean up any portaled content after each test
  afterEach(() => {
    const dialogs = document.querySelectorAll('[role="dialog"]');
    dialogs.forEach((d) => d.remove());
    const overlays = document.querySelectorAll('[data-dialog-overlay]');
    overlays.forEach((o) => o.remove());
  });

  describe('Visibility', () => {
    it('is hidden by default', async () => {
      render(DialogTest);

      // Dialog should not be visible initially
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).toBeNull();
    });

    it('opens when trigger is clicked', async () => {
      const screen = render(DialogTest);
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });

      await trigger.click();

      await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
    });

    it('closes when pressing Escape', async () => {
      const screen = render(DialogTest);
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });

      await trigger.click();
      await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

      await userEvent.keyboard('{Escape}');

      await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
    });

    it('respects shouldCloseOnEscape=false', async () => {
      const screen = render(DialogTest, { shouldCloseOnEscape: false });
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });

      await trigger.click();
      await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

      await userEvent.keyboard('{Escape}');

      // Small delay then check it's still there
      await new Promise((r) => setTimeout(r, 100));
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has role="dialog"', async () => {
      const screen = render(DialogTest);
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });

      await trigger.click();
      await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
    });

    it('has aria-modal="true"', async () => {
      const screen = render(DialogTest);
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });

      await trigger.click();
      await expect
        .poll(() => document.querySelector('[role="dialog"]')?.getAttribute('aria-modal'))
        .toBe('true');
    });

    it('has data-dialog-content attribute', async () => {
      const screen = render(DialogTest);
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });

      await trigger.click();
      await expect.poll(() => document.querySelector('[data-dialog-content]')).toBeTruthy();
    });
  });

  describe('Focus Management', () => {
    it('traps focus within the dialog', async () => {
      const screen = render(DialogTest);
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });

      await trigger.click();
      await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

      // Tab should stay within dialog (focus trap)
      await userEvent.keyboard('{Tab}');
      await new Promise((r) => setTimeout(r, 100));

      // Focus should still be within the dialog
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog?.contains(document.activeElement)).toBe(true);
    });

    it('returns focus to trigger when closed', async () => {
      const screen = render(DialogTest);
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });

      await trigger.click();
      await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

      await userEvent.keyboard('{Escape}');
      await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();

      // Focus should return to trigger
      await expect.poll(() => document.activeElement?.textContent).toContain('Open Dialog');
    });
  });

  describe('Positioning', () => {
    it('is positioned with fixed positioning', async () => {
      const screen = render(DialogTest);
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });

      await trigger.click();
      await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

      const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
      const style = window.getComputedStyle(dialog);

      expect(style.position).toBe('fixed');
    });

    it('is centered with transform', async () => {
      const screen = render(DialogTest);
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });

      await trigger.click();
      await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

      const dialog = document.querySelector('[role="dialog"]') as HTMLElement;

      // Check inline style contains centering properties
      expect(dialog.style.top).toBe('50%');
      expect(dialog.style.left).toBe('50%');
      expect(dialog.style.transform).toContain('translate(-50%, -50%)');
    });

    it('has z-index for stacking', async () => {
      const screen = render(DialogTest);
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });

      await trigger.click();
      await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

      const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
      const style = window.getComputedStyle(dialog);

      expect(parseInt(style.zIndex)).toBeGreaterThan(0);
    });
  });
});
