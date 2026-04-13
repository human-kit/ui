import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import {
	expectFocusVisibleImpliesFocused,
	expectNoFalseFocusAttributes
} from '../test-utils/focus-contract';
import InputTest from './input-test.svelte';

describe('Input', () => {
	it('renders a native text input', () => {
		const screen = render(InputTest);
		const input = screen.getByRole('textbox', { name: 'Email' });

		expect(input.element()?.tagName).toBe('INPUT');
		expect(input.element()?.getAttribute('type')).toBe('text');
		expect(input.element()?.getAttribute('data-input-root')).toBe('true');
	});

	it('sets hovered state on mouse enter and clears it on leave', async () => {
		const screen = render(InputTest);
		const input = screen.getByRole('textbox', { name: 'Email' });

		await userEvent.hover(input.element() as HTMLElement);
		expect(input.element()?.getAttribute('data-hovered')).toBe('true');

		await userEvent.unhover(input.element() as HTMLElement);
		expect(input.element()?.getAttribute('data-hovered')).toBeNull();
		expectNoFalseFocusAttributes(document);
	});

	it('sets focused and focus-visible on keyboard focus', async () => {
		const screen = render(InputTest);
		const input = screen.getByRole('textbox', { name: 'Email' });

		await userEvent.tab();
		await userEvent.tab();

		await expect.poll(() => input.element()?.getAttribute('data-focused')).toBe('true');
		await expect.poll(() => input.element()?.getAttribute('data-focus-visible')).toBe('true');
		expectFocusVisibleImpliesFocused(input.element() as HTMLInputElement | null);
	});

	it('clears focus-visible on pointer click takeover while keeping focus', async () => {
		const screen = render(InputTest);
		const input = screen.getByRole('textbox', { name: 'Email' });

		await userEvent.tab();
		await userEvent.tab();
		await expect.poll(() => input.element()?.getAttribute('data-focus-visible')).toBe('true');

		await input.click();

		expect(input.element()?.getAttribute('data-focused')).toBe('true');
		await expect.poll(() => input.element()?.getAttribute('data-focus-visible')).toBeNull();
		expectNoFalseFocusAttributes(document);
	});

	it('disables the native input when isDisabled is true', () => {
		const screen = render(InputTest, { isDisabled: true });
		const input = screen.getByRole('textbox', { name: 'Email' });

		expect(input.element()?.hasAttribute('disabled')).toBe(true);
		expect(input.element()?.getAttribute('data-disabled')).toBe('true');
	});

	it('supports read only inputs without losing focusability', async () => {
		const screen = render(InputTest, { isReadOnly: true });
		const input = screen.getByRole('textbox', { name: 'Email' });

		expect(input.element()?.hasAttribute('readonly')).toBe(true);
		expect(input.element()?.getAttribute('data-readonly')).toBe('true');

		await input.click();
		await userEvent.type(input.element() as HTMLInputElement, 'abc');

		expect(input.element()).toHaveValue('');
		expect(document.activeElement).toBe(input.element());
	});

	it('maps invalid and required state to data and aria attributes', () => {
		const screen = render(InputTest, { isInvalid: true, isRequired: true });
		const input = screen.getByRole('textbox', { name: 'Email' });

		expect(input.element()?.getAttribute('aria-invalid')).toBe('true');
		expect(input.element()?.getAttribute('data-invalid')).toBe('true');
		expect(input.element()?.hasAttribute('required')).toBe(true);
		expect(input.element()?.getAttribute('data-required')).toBe('true');
	});

	it('preserves external hover and focus handlers', async () => {
		let hoverEvents = 0;
		let focusEvents = 0;

		const screen = render(InputTest, {
			onMouseEnter: () => {
				hoverEvents += 1;
			},
			onFocus: () => {
				focusEvents += 1;
			}
		});
		const input = screen.getByRole('textbox', { name: 'Email' });

		await input.click();
		await userEvent.hover(input.element() as HTMLElement);

		expect(focusEvents).toBe(1);
		expect(hoverEvents).toBe(1);
	});
});
