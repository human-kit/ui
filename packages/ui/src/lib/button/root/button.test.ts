import { describe, expect, it } from 'vitest';

import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import {
	expectFocusVisibleImpliesFocused,
	expectNoFalseFocusAttributes
} from '../../test-utils/focus-contract';
import ButtonTest from './button-test.svelte';

describe('Button.Root', () => {
	it('renders a native button with default type button', () => {
		const screen = render(ButtonTest);
		const button = screen.getByRole('button', { name: 'Save' });

		expect(button.element()?.tagName).toBe('BUTTON');
		expect(button.element()?.getAttribute('type')).toBe('button');
		expect(button.element()?.getAttribute('data-button-root')).toBe('true');
		expect(button.element()?.getAttribute('data-disabled')).toBeNull();
		expect(button.element()?.getAttribute('data-pending')).toBeNull();
	});

	it('sets hovered state on mouse enter and clears it on leave', async () => {
		const screen = render(ButtonTest);
		const button = screen.getByRole('button', { name: 'Save' });

		await userEvent.hover(button.element() as HTMLElement);
		expect(button.element()?.getAttribute('data-hovered')).toBe('true');
		expect(document.querySelector('[data-render-state]')?.getAttribute('data-render-hovered')).toBe(
			'true'
		);

		await userEvent.unhover(button.element() as HTMLElement);
		expect(button.element()?.getAttribute('data-hovered')).toBeNull();
		expectNoFalseFocusAttributes(document);
	});

	it('sets data-pressed while the pointer is held', async () => {
		const screen = render(ButtonTest);
		const button = screen.getByRole('button', { name: 'Save' });

		button
			.element()
			?.dispatchEvent(
				new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0, buttons: 1 })
			);
		await expect.poll(() => button.element()?.getAttribute('data-pressed')).toBe('true');
		expect(document.querySelector('[data-render-state]')?.textContent).toBe('pressed');

		button
			.element()
			?.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, button: 0 }));
		await expect.poll(() => button.element()?.getAttribute('data-pressed')).toBeNull();
	});

	it('sets data-pressed and focus-visible while Space is held', async () => {
		const screen = render(ButtonTest);
		const button = screen.getByRole('button', { name: 'Save' });
		const buttonElement = button.element() as HTMLButtonElement | null;

		buttonElement?.focus();
		await userEvent.keyboard('{Space>}');

		expect(buttonElement?.getAttribute('data-pressed')).toBe('true');
		await expect.poll(() => buttonElement?.getAttribute('data-focus-visible')).toBe('true');
		expectFocusVisibleImpliesFocused(buttonElement);

		await userEvent.keyboard('{/Space}');
		expect(buttonElement?.getAttribute('data-pressed')).toBeNull();
		expect(document.querySelector('[data-click-count]')?.textContent).toBe('1');
	});

	it('clears focus-visible on pointer takeover while keeping data-focused', async () => {
		const screen = render(ButtonTest);
		const button = screen.getByRole('button', { name: 'Save' });

		button.element()?.focus();
		await userEvent.keyboard('{Enter>}');
		await expect.poll(() => button.element()?.getAttribute('data-focus-visible')).toBe('true');
		await userEvent.keyboard('{/Enter}');

		await userEvent.click(button);

		expect(button.element()?.getAttribute('data-focused')).toBe('true');
		expect(button.element()?.getAttribute('data-focus-visible')).toBeNull();
		expectNoFalseFocusAttributes(document);
	});

	it('treats the pressed prop as an override: pressed={false} suppresses data-pressed while the pointer is held', async () => {
		const screen = render(ButtonTest, { pressed: false });
		const button = screen.getByRole('button', { name: 'Save' });
		const buttonElement = button.element() as HTMLButtonElement;

		buttonElement.dispatchEvent(
			new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0, buttons: 1 })
		);

		// Let any (incorrect) state update settle before asserting.
		await new Promise((resolve) => setTimeout(resolve, 20));
		expect(buttonElement.getAttribute('data-pressed')).toBeNull();
		expect(
			document.querySelector('[data-render-state]')?.getAttribute('data-render-pressed')
		).toBeNull();

		buttonElement.dispatchEvent(
			new MouseEvent('mouseup', { bubbles: true, cancelable: true, button: 0 })
		);
	});

	it('forces data-pressed when the pressed prop is true without interaction', async () => {
		const screen = render(ButtonTest, { pressed: true });
		const button = screen.getByRole('button', { name: 'Save' });

		await expect.poll(() => button.element()?.getAttribute('data-pressed')).toBe('true');
	});

	it('disables the native button when disabled is true', async () => {
		const screen = render(ButtonTest, { disabled: true });
		const button = screen.getByRole('button', { name: 'Save' });
		const buttonElement = button.element() as HTMLButtonElement | null;

		expect(buttonElement?.hasAttribute('disabled')).toBe(true);
		expect(buttonElement?.getAttribute('data-disabled')).toBe('true');

		buttonElement?.click();
		expect(document.querySelector('[data-click-count]')?.textContent).toBe('0');
	});

	it('keeps the button focusable but blocks press, hover, and submit while pending', async () => {
		render(ButtonTest, { pending: true, type: 'submit' });
		const button = document.querySelector<HTMLButtonElement>('[data-button-root="true"]');

		expect(button?.hasAttribute('disabled')).toBe(false);
		expect(button?.getAttribute('aria-disabled')).toBe('true');
		expect(button?.getAttribute('aria-busy')).toBe('true');
		expect(button?.getAttribute('data-pending')).toBe('true');
		expect(button?.getAttribute('type')).toBe('button');

		button?.focus();
		expect(document.activeElement).toBe(button);

		await userEvent.hover(button as HTMLElement);
		expect(button?.getAttribute('data-hovered')).toBeNull();

		button?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
		expect(document.querySelector('[data-click-count]')?.textContent).toBe('0');
		expect(document.querySelector('[data-submit-count]')?.textContent).toBe('0');
		expect(document.querySelector('[role="status"][aria-live="polite"]')?.textContent).toContain(
			'pending'
		);
	});

	it('keeps the pending announcement out of the button accessible name', async () => {
		// ariaLabel: '' removes aria-label so the accessible name comes from the contents,
		// which is where the inline live region used to leak into the computed name.
		const screen = render(ButtonTest, { pending: true, ariaLabel: '' });

		// The name must be exactly the visible contents ("Saving pending" from the label +
		// render-state spans), without the live region announcement appended.
		const button = screen.getByRole('button', { name: 'Saving pending', exact: true });
		await expect.element(button).toBeInTheDocument();

		const buttonElement = button.element() as HTMLButtonElement;
		const status = document.querySelector('[role="status"][aria-live="polite"]');

		// The status element still exists, carries the announcement, and lives outside the button.
		expect(status).not.toBeNull();
		expect(status?.textContent).toBe('Saving pending, pending');
		expect(buttonElement.contains(status)).toBe(false);
		expect(buttonElement.textContent).not.toContain(', pending');
	});

	it('updates to pending dynamically and suppresses later activation', async () => {
		render(ButtonTest, { type: 'submit' });
		const button = document.querySelector<HTMLButtonElement>('[data-button-root="true"]');
		const setPendingButton = document.querySelector<HTMLButtonElement>('[data-set-pending]');

		await userEvent.click(button as HTMLButtonElement);
		expect(document.querySelector('[data-click-count]')?.textContent).toBe('1');
		expect(document.querySelector('[data-submit-count]')?.textContent).toBe('1');

		await userEvent.click(setPendingButton as HTMLButtonElement);
		expect(document.querySelector('[data-pending-state]')?.textContent).toBe('true');
		expect(button?.getAttribute('type')).toBe('button');

		button?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
		expect(document.querySelector('[data-click-count]')?.textContent).toBe('1');
		expect(document.querySelector('[data-submit-count]')?.textContent).toBe('1');
	});

	it('preserves external hover and focus handlers while pending without setting internal hover state', async () => {
		let hoverEvents = 0;
		let focusEvents = 0;

		render(ButtonTest, {
			pending: true,
			onMouseEnter: () => {
				hoverEvents += 1;
			},
			onFocus: () => {
				focusEvents += 1;
			}
		});

		const button = document.querySelector<HTMLButtonElement>('[data-button-root="true"]');

		button?.focus();
		expect(focusEvents).toBe(1);

		await userEvent.hover(button as HTMLElement);

		expect(hoverEvents).toBe(1);
		expect(button?.getAttribute('data-hovered')).toBeNull();
		expect(button?.getAttribute('data-focused')).toBe('true');
	});
});
