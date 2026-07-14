import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ComboBoxTest from '../root/combobox-test.svelte';

describe('ComboBox.Trigger', () => {
	describe('Accessibility', () => {
		it('has correct aria-label when closed', async () => {
			const screen = render(ComboBoxTest);
			const trigger = screen.getByRole('button', { name: 'Show options' });

			await expect.element(trigger).toBeInTheDocument();
			await expect.element(trigger).toHaveAttribute('aria-label', 'Show options');
		});

		it('has correct aria-label when open', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			const trigger = screen.getByRole('button', { name: 'Hide options' });
			await expect.element(trigger).toHaveAttribute('aria-label', 'Hide options');
		});

		it('reflects pending state from the combobox root', async () => {
			const screen = render(ComboBoxTest, { pending: true });
			const trigger = screen.getByRole('button', { name: 'Show options' });

			await expect.element(trigger).toHaveAttribute('data-pending', 'true');
			await expect.element(trigger).toBeDisabled();
		});
	});

	describe('Interaction', () => {
		it('toggles popover on click', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			const openTrigger = screen.getByRole('button', { name: 'Show options' });
			await openTrigger.click();
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');

			const closeTrigger = screen.getByRole('button', { name: 'Hide options' });
			await closeTrigger.click();
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');
		});

		it('toggles the popover with Enter when focused (keyboard activation)', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');
			const trigger = screen.getByRole('button', { name: 'Show options' });

			(trigger.element() as HTMLElement).focus();
			await userEvent.keyboard('{Enter}');

			await expect.element(input).toHaveAttribute('aria-expanded', 'true');
		});

		it('toggles the popover with Space when focused (keyboard activation)', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');
			const trigger = screen.getByRole('button', { name: 'Show options' });

			(trigger.element() as HTMLElement).focus();
			await userEvent.keyboard(' ');

			await expect.element(input).toHaveAttribute('aria-expanded', 'true');
		});

		it('exposes aria-controls only while expanded', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');
			const trigger = screen.getByRole('button', { name: 'Show options' });

			// Closed: the listbox does not exist yet, so aria-controls must be absent.
			expect(trigger.element().hasAttribute('aria-controls')).toBe(false);

			await trigger.click();
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');

			const openTrigger = screen.getByRole('button', { name: 'Hide options' });
			await expect
				.poll(() => openTrigger.element().getAttribute('aria-controls'))
				.toMatch(/^combobox-listbox-/);
		});

		it('has tabindex -1 by default', async () => {
			const screen = render(ComboBoxTest);
			const trigger = screen.getByRole('button', { name: 'Show options' });

			await expect.element(trigger).toHaveAttribute('tabindex', '-1');
		});
	});

	describe('Visual State', () => {
		it('has data-pressed when open', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			const trigger = screen.getByRole('button', { name: 'Hide options' });
			await expect.element(trigger).toHaveAttribute('data-pressed', 'true');
		});
	});
});
