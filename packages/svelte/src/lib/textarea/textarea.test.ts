import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import {
	expectFocusVisibleImpliesFocused,
	expectNoFalseFocusAttributes
} from '../test-utils/focus-contract';
import TextAreaTest from './textarea-test.svelte';

const originalScrollHeightDescriptor = Object.getOwnPropertyDescriptor(
	HTMLTextAreaElement.prototype,
	'scrollHeight'
);

function mockScrollHeight(getScrollHeight: () => number) {
	Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
		configurable: true,
		get: getScrollHeight
	});
}

function restoreScrollHeight() {
	if (originalScrollHeightDescriptor) {
		Object.defineProperty(
			HTMLTextAreaElement.prototype,
			'scrollHeight',
			originalScrollHeightDescriptor
		);
		return;
	}

	delete (HTMLTextAreaElement.prototype as { scrollHeight?: number }).scrollHeight;
}

function mockTextAreaMeasurements() {
	const originalGetComputedStyle = window.getComputedStyle.bind(window);

	vi.spyOn(window, 'getComputedStyle').mockImplementation(
		(element: Element, pseudoElt?: string | null) => {
			if (!(element instanceof HTMLTextAreaElement)) {
				return originalGetComputedStyle(element, pseudoElt);
			}

			return {
				...originalGetComputedStyle(element, pseudoElt),
				boxSizing: 'border-box',
				borderTopWidth: '1px',
				borderBottomWidth: '1px',
				paddingTop: '4px',
				paddingBottom: '4px',
				lineHeight: '20px',
				fontSize: '16px'
			} as CSSStyleDeclaration;
		}
	);
}

afterEach(() => {
	vi.restoreAllMocks();
	restoreScrollHeight();
});

describe('TextArea', () => {
	it('renders a native textarea', () => {
		const screen = render(TextAreaTest);
		const textArea = screen.getByRole('textbox', { name: 'Message' });

		expect(textArea.element()?.tagName).toBe('TEXTAREA');
		expect(textArea.element()?.getAttribute('data-textarea-root')).toBe('true');
	});

	it('sets hovered state on mouse enter and clears it on leave', async () => {
		const screen = render(TextAreaTest);
		const textArea = screen.getByRole('textbox', { name: 'Message' });

		await userEvent.hover(textArea.element() as HTMLElement);
		expect(textArea.element()?.getAttribute('data-hovered')).toBe('true');

		await userEvent.unhover(textArea.element() as HTMLElement);
		expect(textArea.element()?.getAttribute('data-hovered')).toBeNull();
		expectNoFalseFocusAttributes(document);
	});

	it('sets focused and focus-visible on keyboard focus', async () => {
		const screen = render(TextAreaTest);
		const textArea = screen.getByRole('textbox', { name: 'Message' });

		await userEvent.tab();
		await userEvent.tab();

		await expect.poll(() => textArea.element()?.getAttribute('data-focused')).toBe('true');
		await expect.poll(() => textArea.element()?.getAttribute('data-focus-visible')).toBe('true');
		expectFocusVisibleImpliesFocused(textArea.element() as HTMLTextAreaElement | null);
	});

	it('clears focus-visible on pointer click takeover while keeping focus', async () => {
		const screen = render(TextAreaTest);
		const textArea = screen.getByRole('textbox', { name: 'Message' });

		await userEvent.tab();
		await userEvent.tab();
		await expect.poll(() => textArea.element()?.getAttribute('data-focus-visible')).toBe('true');

		await textArea.click();

		expect(textArea.element()?.getAttribute('data-focused')).toBe('true');
		await expect.poll(() => textArea.element()?.getAttribute('data-focus-visible')).toBeNull();
		expectNoFalseFocusAttributes(document);
	});

	it('disables the native textarea when isDisabled is true', () => {
		const screen = render(TextAreaTest, { isDisabled: true });
		const textArea = screen.getByRole('textbox', { name: 'Message' });

		expect(textArea.element()?.hasAttribute('disabled')).toBe(true);
		expect(textArea.element()?.getAttribute('data-disabled')).toBe('true');
	});

	it('supports read only textareas without losing focusability', async () => {
		const screen = render(TextAreaTest, { isReadOnly: true });
		const textArea = screen.getByRole('textbox', { name: 'Message' });

		expect(textArea.element()?.hasAttribute('readonly')).toBe(true);
		expect(textArea.element()?.getAttribute('data-readonly')).toBe('true');

		await textArea.click();
		await userEvent.type(textArea.element() as HTMLTextAreaElement, 'abc');

		expect(textArea.element()).toHaveValue('');
		expect(document.activeElement).toBe(textArea.element());
	});

	it('maps invalid and required state to data and aria attributes', () => {
		const screen = render(TextAreaTest, { isInvalid: true, isRequired: true });
		const textArea = screen.getByRole('textbox', { name: 'Message' });

		expect(textArea.element()?.getAttribute('aria-invalid')).toBe('true');
		expect(textArea.element()?.getAttribute('data-invalid')).toBe('true');
		expect(textArea.element()?.hasAttribute('required')).toBe(true);
		expect(textArea.element()?.getAttribute('data-required')).toBe('true');
	});

	it('preserves external hover and focus handlers', async () => {
		let hoverEvents = 0;
		let focusEvents = 0;

		const screen = render(TextAreaTest, {
			onMouseEnter: () => {
				hoverEvents += 1;
			},
			onFocus: () => {
				focusEvents += 1;
			}
		});
		const textArea = screen.getByRole('textbox', { name: 'Message' });

		await textArea.click();
		await userEvent.hover(textArea.element() as HTMLElement);

		expect(focusEvents).toBe(1);
		expect(hoverEvents).toBe(1);
	});

	it('supports bind:value updates from user input', async () => {
		const screen = render(TextAreaTest, { value: '' });
		const textArea = screen.getByRole('textbox', { name: 'Message' });

		await textArea.click();
		await userEvent.type(textArea.element() as HTMLTextAreaElement, 'bind me');

		await expect
			.poll(() => document.querySelector('[data-textarea-value]')?.textContent)
			.toBe('bind me');
	});

	it('does not control height when autoResize is false', () => {
		mockTextAreaMeasurements();
		mockScrollHeight(() => 200);

		const screen = render(TextAreaTest, { autoResize: false, value: 'Fixed height' });
		const textArea = screen.getByRole('textbox', { name: 'Message' });

		expect((textArea.element() as HTMLTextAreaElement).style.height).toBe('');
		expect((textArea.element() as HTMLTextAreaElement).style.overflowY).toBe('');
	});

	it('auto-resizes when enabled', async () => {
		let scrollHeight = 28;
		mockTextAreaMeasurements();
		mockScrollHeight(() => scrollHeight);

		const screen = render(TextAreaTest, { autoResize: true, minRows: 2, value: 'Short' });
		const textArea = screen.getByRole('textbox', { name: 'Message' });

		await expect.poll(() => (textArea.element() as HTMLTextAreaElement).style.height).toBe('50px');
		expect((textArea.element() as HTMLTextAreaElement).style.overflowY).toBe('hidden');

		scrollHeight = 88;
		await userEvent.type(textArea.element() as HTMLTextAreaElement, ' and a longer message');

		await expect.poll(() => (textArea.element() as HTMLTextAreaElement).style.height).toBe('90px');
	});

	it('caps auto-resize height at maxRows and enables vertical overflow', async () => {
		mockTextAreaMeasurements();
		mockScrollHeight(() => 200);

		const screen = render(TextAreaTest, {
			autoResize: true,
			minRows: 2,
			maxRows: 3,
			value: 'Long'
		});
		const textArea = screen.getByRole('textbox', { name: 'Message' });

		await expect.poll(() => (textArea.element() as HTMLTextAreaElement).style.height).toBe('70px');
		expect((textArea.element() as HTMLTextAreaElement).style.overflowY).toBe('auto');
	});
});
