import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import CollapsibleTest from './collapsible-test.svelte';

describe('Collapsible', () => {
	it('links the trigger and panel with accessible ARIA attributes', async () => {
		const screen = render(CollapsibleTest, { defaultOpen: true });
		const trigger = screen.getByRole('button', { name: 'Details' });
		const panel = document.querySelector<HTMLElement>('[data-testid="panel"]');

		await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
		await expect.element(trigger).toHaveAttribute('aria-controls', panel!.id);
		expect(panel?.hidden).toBe(false);
		expect(document.body.textContent).toContain('Panel content');
	});

	it('toggles the panel open and closed', async () => {
		const screen = render(CollapsibleTest, { defaultOpen: false });
		const trigger = screen.getByRole('button', { name: 'Details' });
		const panel = document.querySelector<HTMLElement>('[data-testid="panel"]');

		expect(panel?.hidden).toBe(true);
		expect(panel?.hasAttribute('inert')).toBe(true);

		await userEvent.click(trigger);
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
		await expect.poll(() => panel?.hidden).toBe(false);

		await userEvent.click(trigger);
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
		await expect.poll(() => panel?.hidden).toBe(true);
	});

	it('does not toggle when disabled', async () => {
		const screen = render(CollapsibleTest, { isDisabled: true });
		const trigger = screen.getByRole('button', { name: 'Details' });

		await expect.element(trigger).toBeDisabled();
		await userEvent.click(trigger, { force: true });
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
	});

	it('supports controlled open, bind:open updates, and onOpenChange', async () => {
		const screen = render(CollapsibleTest, {
			controlled: true,
			open: false,
			showControls: true
		});
		const trigger = screen.getByRole('button', { name: 'Details' });

		await userEvent.click(trigger);
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
		expect(document.querySelector('[data-testid="open-state"]')?.textContent).toBe('true');
		expect(document.querySelector('[data-testid="change-log"]')?.textContent).toBe('[true]');

		await userEvent.click(screen.getByTestId('set-closed'));
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
	});

	it('keeps the panel mounted (hidden) at rest when forceMount is set', async () => {
		render(CollapsibleTest, { defaultOpen: false, forceMount: true });
		const panel = document.querySelector<HTMLElement>('[data-testid="panel"]');

		// forceMount: the content stays in the DOM even while closed...
		expect(panel?.textContent).toContain('Panel content');
		// ...hidden at rest (only un-hidden while it animates), and out of the a11y tree via inert.
		expect(panel?.hidden).toBe(true);
		expect(panel?.hasAttribute('inert')).toBe(true);
		expect(panel?.getAttribute('data-closed')).toBe('true');
	});

	it('toggles with keyboard activation', async () => {
		const screen = render(CollapsibleTest, { defaultOpen: false });
		const trigger = screen.getByRole('button', { name: 'Details' });

		trigger.element()?.focus();
		await userEvent.keyboard('{Enter}');
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');

		await userEvent.keyboard(' ');
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
	});
});
