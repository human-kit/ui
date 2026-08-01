import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import DialogTest from './dialog-test.svelte';
import DialogBindTest from './dialog-bind-test.svelte';
import { expectNoFalseFocusAttributes } from '../../test-utils/focus-contract';

describe('Dialog', () => {
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

		it('opens when clicking the trigger', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.click();

			// Use expect.poll for Portal content
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		});

		it('closes when pressing Escape', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			// Open dialog
			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			// Press Escape
			await userEvent.keyboard('{Escape}');

			// Wait for dialog to close
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		});

		it('respects shouldCloseOnEscape=false', async () => {
			const screen = render(DialogTest, { shouldCloseOnEscape: false });
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			// Open dialog
			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			// Press Escape - should NOT close
			await userEvent.keyboard('{Escape}');

			// Small delay then check it's still there
			await new Promise((r) => setTimeout(r, 100));
			const dialog = document.querySelector('[role="dialog"]');
			expect(dialog).toBeTruthy();
		});

		it('closes when clicking outside (on overlay area)', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			// Open dialog
			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			// Dispatch mousedown on body (outside the dialog content) to trigger clickOutside
			document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

			// Wait for dialog to close
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		});

		it('respects shouldCloseOnInteractOutside=false', async () => {
			const screen = render(DialogTest, { shouldCloseOnInteractOutside: false });
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			// Open dialog
			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			// Dispatch mousedown on body - should NOT close because shouldCloseOnInteractOutside=false
			document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

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

		it('returns focus to trigger when closed', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			// Open dialog
			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			// Press Escape to close
			await userEvent.keyboard('{Escape}');
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();

			// Focus should return to trigger
			await expect.poll(() => document.activeElement?.textContent).toContain('Open Dialog');
			expectNoFalseFocusAttributes(document);
		});
	});

	describe('Overlay', () => {
		it('renders overlay when dialog is open', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[data-dialog-overlay]')).toBeTruthy();
		});

		it('overlay is not visible when dialog is closed', async () => {
			render(DialogTest);

			const overlay = document.querySelector('[data-dialog-overlay]');
			expect(overlay).toBeNull();
		});
	});

	describe('Snippet API', () => {
		it('close function from snippet closes the dialog', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			// Open dialog
			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			// Click the Close button which uses the snippet's close function
			const closeBtn = document.querySelector('.close-btn') as HTMLElement;
			closeBtn.click();

			// Wait for dialog to close
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		});
	});

	describe('Two-way binding (default)', () => {
		// Regression: controlled-ness used to be inferred from `open !== undefined`, so a
		// `bind:open` seeded with `false` was misread as controlled. Every close that
		// originated inside the component — Escape, the close button wired to the context —
		// was then reported and dropped, leaving a dialog that could not be dismissed.
		it('closes on Escape when bound with bind:open', async () => {
			const screen = render(DialogBindTest);

			await screen.getByRole('button', { name: 'Open Dialog' }).click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			await userEvent.keyboard('{Escape}');

			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		});

		it('writes the new state back to the bound variable', async () => {
			const screen = render(DialogBindTest);
			const bound = () => document.querySelector('[data-testid="bound-state"]')?.textContent;

			await screen.getByRole('button', { name: 'Open Dialog' }).click();
			await expect.poll(bound).toBe('open');

			await userEvent.keyboard('{Escape}');

			await expect.poll(bound).toBe('closed');
		});
	});

	describe('Controlled Mode', () => {
		it('respects controlled open prop', async () => {
			render(DialogTest, { open: true });

			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		});

		it('stays open after Escape when a controlled parent ignores onOpenChange', async () => {
			// A controlled parent owns the state: if it does not flow `false` back
			// down, the dialog must remain open (the child must not overwrite the prop).
			// This requires opting in — passing `open` alone no longer implies it, because
			// `bind:open={value}` looks identical from here and must keep working.
			render(DialogTest, { open: true, controlledOpen: true, onOpenChange: () => {} });
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			await userEvent.keyboard('{Escape}');

			await new Promise((r) => setTimeout(r, 100));
			expect(document.querySelector('[role="dialog"]')).toBeTruthy();
		});

		it('calls onOpenChange callback when opening', async () => {
			const { vi } = await import('vitest');
			const onOpenChangeMock = vi.fn();

			const screen = render(DialogTest, { onOpenChange: onOpenChangeMock });
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.click();

			expect(onOpenChangeMock).toHaveBeenCalledWith(true);
		});

		it('calls onOpenChange callback when closing', async () => {
			const { vi } = await import('vitest');
			const onOpenChangeMock = vi.fn();

			const screen = render(DialogTest, { onOpenChange: onOpenChangeMock });
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			// Open
			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			// Close via Escape
			await userEvent.keyboard('{Escape}');

			expect(onOpenChangeMock).toHaveBeenCalledWith(false);
		});
	});

	describe('Positioning', () => {
		it('is centered in the viewport', async () => {
			const screen = render(DialogTest);
			const trigger = screen.getByRole('button', { name: 'Open Dialog' });

			await trigger.click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
			const dialogRect = dialog.getBoundingClientRect();

			// Dialog should be positioned in the center-ish area
			expect(dialogRect.top).toBeGreaterThan(0);
			expect(dialogRect.left).toBeGreaterThan(0);
		});
	});
});

describe('Dialog labelling', () => {
	afterEach(() => {
		document.querySelectorAll('[role="dialog"]').forEach((node) => node.remove());
	});

	it('names the dialog from Dialog.Title and describes it from Dialog.Description', async () => {
		const screen = render(DialogTest, { defaultOpen: true });
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

		const dialog = document.querySelector('[role="dialog"]')!;
		const labelId = dialog.getAttribute('aria-labelledby');
		expect(labelId).toBeTruthy();
		expect(document.getElementById(labelId!)?.textContent).toBe('Dialog Title');

		const describedId = dialog.getAttribute('aria-describedby');
		expect(describedId).toBeTruthy();
		expect(document.getElementById(describedId!)?.textContent).toBe('Dialog content goes here.');

		// The name has to resolve through the accessibility tree, not just the attribute.
		await expect.element(screen.getByRole('dialog', { name: 'Dialog Title' })).toBeInTheDocument();
	});

	it('renders the title as a heading', async () => {
		render(DialogTest, { defaultOpen: true });
		await expect.poll(() => document.querySelector('[data-dialog-title]')).toBeTruthy();
		expect(document.querySelector('[data-dialog-title]')?.tagName).toBe('H2');
	});

	it('closes from Dialog.Close', async () => {
		render(DialogTest, { defaultOpen: true });
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

		document.querySelector<HTMLButtonElement>('[data-dialog-close]')!.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
	});
});
