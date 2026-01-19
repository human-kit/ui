import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DialogTest from '../root/dialog-test.svelte';

describe('Dialog.Portal', () => {
  // Clean up any portaled content after each test
  afterEach(() => {
    const dialogs = document.querySelectorAll('[role="dialog"]');
    dialogs.forEach((d) => d.remove());
    const overlays = document.querySelectorAll('[data-dialog-overlay]');
    overlays.forEach((o) => o.remove());
  });

  describe('Visibility', () => {
    it('does not render children when dialog is closed', async () => {
      render(DialogTest);

      // No portal content should be present
      const dialog = document.querySelector('[role="dialog"]');
      const overlay = document.querySelector('[data-dialog-overlay]');

      expect(dialog).toBeNull();
      expect(overlay).toBeNull();
    });

    it('renders children when dialog is open', async () => {
      const screen = render(DialogTest);
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });

      await trigger.click();

      // Both overlay and content should be rendered
      await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
      await expect.poll(() => document.querySelector('[data-dialog-overlay]')).toBeTruthy();
    });

    it('removes children when dialog is closed', async () => {
      const screen = render(DialogTest);
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });

      // Open
      await trigger.click();
      await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

      // Close via snippet close function
      const closeBtn = document.querySelector('.close-btn') as HTMLElement;
      closeBtn.click();

      // Should be removed
      await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
      await expect.poll(() => document.querySelector('[data-dialog-overlay]')).toBeNull();
    });
  });

  describe('Portal Behavior', () => {
    it('renders content outside of the component tree', async () => {
      const screen = render(DialogTest);
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });

      await trigger.click();
      await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

      const dialog = document.querySelector('[role="dialog"]');
      const triggerEl = document.querySelector('button[aria-haspopup="dialog"]');

      // Dialog should not be a descendant of the trigger's parent
      // (it should be portaled to document.body or similar)
      expect(triggerEl?.parentElement?.contains(dialog)).toBe(false);
    });

    it('renders content at body level', async () => {
      const screen = render(DialogTest);
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });

      await trigger.click();
      await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

      const dialog = document.querySelector('[role="dialog"]');

      // Dialog should be rendered at body level (not deeply nested in component tree)
      // Check that it's within a few levels of document.body
      let parent = dialog?.parentElement;
      let depth = 0;
      while (parent && parent !== document.body && depth < 5) {
        parent = parent.parentElement;
        depth++;
      }
      expect(parent).toBe(document.body);
    });
  });

  describe('Controlled Mode', () => {
    it('responds to controlled open prop', async () => {
      render(DialogTest, { open: true });

      // Portal should render content immediately
      await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
      await expect.poll(() => document.querySelector('[data-dialog-overlay]')).toBeTruthy();
    });

    it('responds to defaultOpen prop', async () => {
      render(DialogTest, { defaultOpen: true });

      // Portal should render content immediately
      await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
      await expect.poll(() => document.querySelector('[data-dialog-overlay]')).toBeTruthy();
    });
  });
});
