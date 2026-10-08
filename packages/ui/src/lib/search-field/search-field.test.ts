import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import {
	expectFocusVisibleImpliesFocused,
	expectFocusVisibleImpliesFocusWithin,
	expectNoFalseFocusAttributes
} from '../test-utils/focus-contract';
import SearchFieldOrphanTest from './search-field-orphan-test.svelte';
import SearchFieldTest from './search-field-test.svelte';

function getRoot() {
	return document.querySelector<HTMLElement>('[data-testid="root"]')!;
}

function getInput() {
	return document.querySelector<HTMLInputElement>('[data-search-field-input]')!;
}

function getClear() {
	return document.querySelector<HTMLButtonElement>('[data-search-field-clear]')!;
}

function getValueOutput(): string | null {
	return document.querySelector('[data-search-field-value]')?.textContent ?? null;
}

describe('SearchField', () => {
	it('makes a searchbox that the label names', () => {
		const screen = render(SearchFieldTest);
		const input = screen.getByRole('searchbox', { name: 'Search' }).element() as HTMLInputElement;

		expect(input).toBe(getInput());
		expect(input.type).toBe('search');
		expect(input.getAttribute('enterkeyhint')).toBe('search');
		expect(getRoot().getAttribute('data-search-field-root')).toBe('true');
	});

	it('gives the clear button a name, keeps it out of the tab order, and points it at the input', () => {
		render(SearchFieldTest, { defaultValue: 'cats' });
		const clear = getClear();

		expect(clear.getAttribute('aria-label')).toBe('Clear search');
		expect(clear.tabIndex).toBe(-1);
		expect(clear.getAttribute('aria-controls')).toBe(getInput().id);
	});

	it('translates the name of the clear button with the locale', () => {
		render(SearchFieldTest, { defaultValue: 'gatos', locale: 'es-AR' });
		expect(getClear().getAttribute('aria-label')).toBe('Borrar búsqueda');
	});

	it('lets an aria-label replace the name of the clear button', () => {
		render(SearchFieldTest, { defaultValue: 'cats', clearLabel: 'Reset filter' });
		expect(getClear().getAttribute('aria-label')).toBe('Reset filter');
	});

	it('writes the typed text to bind:value and calls onChange', async () => {
		const onChange = vi.fn();
		render(SearchFieldTest, { onChange });
		expect(getRoot().getAttribute('data-empty')).toBe('true');

		await userEvent.type(getInput(), 'cat');

		await expect.poll(getValueOutput).toBe('"cat"');
		expect(onChange).toHaveBeenLastCalledWith('cat');
		expect(getRoot().getAttribute('data-empty')).toBeNull();
		expect(getInput().getAttribute('data-empty')).toBeNull();
	});

	it('shows a value that the parent sets', async () => {
		const screen = render(SearchFieldTest, { defaultValue: 'cats' });
		expect(getInput().value).toBe('cats');

		await screen.getByRole('button', { name: 'Set value' }).click();

		await expect.poll(() => getInput().value).toBe('set by parent');
	});

	it('empties the field on Escape, calls onClear, and keeps the key in the field', async () => {
		const onClear = vi.fn();
		const onChange = vi.fn();
		const onOuterKeyDown = vi.fn();
		render(SearchFieldTest, { defaultValue: 'cats', onClear, onChange, onOuterKeyDown });

		getInput().focus();
		await userEvent.keyboard('{Escape}');

		await expect.poll(() => getInput().value).toBe('');
		expect(getValueOutput()).toBe('""');
		expect(onChange).toHaveBeenLastCalledWith('');
		expect(onClear).toHaveBeenCalledTimes(1);
		expect(onOuterKeyDown).not.toHaveBeenCalled();
		expect(document.activeElement).toBe(getInput());
	});

	// A dialog or a popover around the field closes on Escape. An empty field must let the key
	// go to it, or the user has to press the key two times for no visible result.
	it('lets Escape go on when the field is already empty', async () => {
		const onClear = vi.fn();
		const onOuterKeyDown = vi.fn();
		render(SearchFieldTest, { onClear, onOuterKeyDown });

		getInput().focus();
		await userEvent.keyboard('{Escape}');

		expect(onClear).not.toHaveBeenCalled();
		expect(onOuterKeyDown).toHaveBeenCalledTimes(1);
	});

	it('empties a value that a script wrote to the input', async () => {
		const onClear = vi.fn();
		render(SearchFieldTest, { onClear });
		const input = getInput();

		input.focus();
		input.value = 'typed by a script';
		await userEvent.keyboard('{Escape}');

		expect(input.value).toBe('');
		expect(onClear).toHaveBeenCalledTimes(1);
	});

	it('does not empty the field on an Escape that ends an IME composition', () => {
		const onClear = vi.fn();
		render(SearchFieldTest, { defaultValue: 'かな', onClear });
		const input = getInput();

		input.focus();
		const event = new KeyboardEvent('keydown', {
			key: 'Escape',
			bubbles: true,
			cancelable: true,
			isComposing: true
		});
		input.dispatchEvent(event);

		expect(input.value).toBe('かな');
		expect(event.defaultPrevented).toBe(false);
		expect(onClear).not.toHaveBeenCalled();
	});

	it('calls onSubmit with the text on Enter, and the form also submits', async () => {
		const onSubmit = vi.fn();
		render(SearchFieldTest, { defaultValue: 'cats', name: 'q', onSubmit });

		getInput().focus();
		await userEvent.keyboard('{Enter}');

		expect(onSubmit).toHaveBeenCalledWith('cats');
		await expect
			.poll(() => document.querySelector('[data-form-entries]')?.textContent)
			.toBe('{"q":"cats"}');
	});

	it('empties the field with the clear button and keeps the focus in the input', async () => {
		const onClear = vi.fn();
		render(SearchFieldTest, { defaultValue: 'cats', onClear });

		getInput().focus();
		await userEvent.click(getClear());

		await expect.poll(() => getInput().value).toBe('');
		expect(onClear).toHaveBeenCalledTimes(1);
		expect(document.activeElement).toBe(getInput());
		expect(getRoot().getAttribute('data-empty')).toBe('true');
	});

	it('puts the focus in the input after a press on the clear button from outside', async () => {
		const screen = render(SearchFieldTest, { defaultValue: 'cats' });

		await screen.getByRole('button', { name: 'Before' }).click();
		await userEvent.click(getClear());

		expect(document.activeElement).toBe(getInput());
	});

	it('disables the clear button while the field is empty', async () => {
		render(SearchFieldTest);
		expect(getClear().disabled).toBe(true);
		expect(getClear().getAttribute('data-empty')).toBe('true');

		await userEvent.type(getInput(), 'a');

		await expect.poll(() => getClear().disabled).toBe(false);
	});

	it('keeps the text in a read-only field', async () => {
		const onClear = vi.fn();
		const onSubmit = vi.fn();
		render(SearchFieldTest, { defaultValue: 'cats', readonly: true, onClear, onSubmit });
		const input = getInput();

		expect(input.readOnly).toBe(true);
		expect(input.getAttribute('aria-readonly')).toBe('true');
		expect(getClear().disabled).toBe(true);

		input.focus();
		await userEvent.keyboard('{Escape}');
		await userEvent.keyboard('{Enter}');

		expect(input.value).toBe('cats');
		expect(onClear).not.toHaveBeenCalled();
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('disables the input and the clear button', () => {
		render(SearchFieldTest, { defaultValue: 'cats', disabled: true });

		expect(getInput().disabled).toBe(true);
		expect(getClear().disabled).toBe(true);
		expect(getRoot().getAttribute('data-disabled')).toBe('true');
		expect(document.querySelector('[data-testid="label"]')!.getAttribute('data-disabled')).toBe(
			'true'
		);
	});

	it('sets required and invalid on the input', () => {
		render(SearchFieldTest, { required: true, invalid: true });
		const input = getInput();

		expect(input.required).toBe(true);
		expect(input.getAttribute('aria-required')).toBe('true');
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(getRoot().getAttribute('data-invalid')).toBe('true');
		expect(getRoot().getAttribute('data-required')).toBe('true');
	});

	it('puts the text back to defaultValue on a form reset', async () => {
		const screen = render(SearchFieldTest, { defaultValue: 'cats', name: 'q' });

		await userEvent.clear(getInput());
		await userEvent.type(getInput(), 'dogs');
		await expect.poll(getValueOutput).toBe('"dogs"');

		await screen.getByRole('button', { name: 'Reset' }).click();

		await expect.poll(getValueOutput).toBe('"cats"');
		expect(getInput().value).toBe('cats');
	});

	it('rejects a part with no root', () => {
		expect(() => render(SearchFieldOrphanTest)).toThrowError(
			/SearchField.Input must be used within SearchField.Root/
		);
	});

	describe('focus state', () => {
		it('shows the focus ring on the input and the root after a Tab', async () => {
			const screen = render(SearchFieldTest);

			await screen.getByRole('button', { name: 'Before' }).click();
			await userEvent.keyboard('{Tab}');

			const input = getInput();
			const root = getRoot();
			expect(document.activeElement).toBe(input);
			await expect.poll(() => input.getAttribute('data-focus-visible')).toBe('true');
			expect(input.getAttribute('data-focused')).toBe('true');
			expect(root.getAttribute('data-focus-within')).toBe('true');
			expect(root.getAttribute('data-focus-visible')).toBe('true');
			expectFocusVisibleImpliesFocused(input);
			expectFocusVisibleImpliesFocusWithin(root);
			expectNoFalseFocusAttributes();
		});

		it('shows no focus ring after a pointer press', async () => {
			render(SearchFieldTest);

			await userEvent.click(getInput());

			await expect.poll(() => getInput().getAttribute('data-focused')).toBe('true');
			expect(getInput().getAttribute('data-focus-visible')).toBeNull();
			expect(getRoot().getAttribute('data-focus-visible')).toBeNull();
			expect(getRoot().getAttribute('data-focus-within')).toBe('true');
		});

		it('shows the focus ring when a key press follows a pointer press', async () => {
			render(SearchFieldTest);

			await userEvent.click(getInput());
			await expect.poll(() => getInput().getAttribute('data-focused')).toBe('true');
			expect(getInput().getAttribute('data-focus-visible')).toBeNull();

			await userEvent.keyboard('{F9}');

			await expect.poll(() => getInput().getAttribute('data-focus-visible')).toBe('true');
		});

		it('keeps the root focus state while the clear button gets a press', async () => {
			render(SearchFieldTest, { defaultValue: 'cats' });

			await userEvent.click(getInput());
			await userEvent.click(getClear());

			expect(getRoot().getAttribute('data-focus-within')).toBe('true');
			expect(getClear().getAttribute('data-focused')).toBeNull();
		});

		it('removes the focus state when the focus leaves the field', async () => {
			const screen = render(SearchFieldTest);

			await userEvent.click(getInput());
			await screen.getByRole('button', { name: 'Submit' }).click();

			expect(getRoot().getAttribute('data-focus-within')).toBeNull();
			expect(getInput().getAttribute('data-focused')).toBeNull();
			expectNoFalseFocusAttributes();
		});
	});
});
