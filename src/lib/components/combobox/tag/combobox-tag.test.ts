import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ComboBoxMultiselectTest from '../root/combobox-multiselect-test.svelte';

describe('ComboBox.Tag', () => {
	describe('Rendering', () => {
		it('renders with role="listitem"', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple'] });

			const tag = screen.getByRole('listitem');
			await expect.element(tag).toBeInTheDocument();
		});

		it('has data-tag-id attribute', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple'] });

			const tag = screen.getByRole('listitem');
			await expect.element(tag).toHaveAttribute('data-tag-id', 'apple');
		});

		it('is focusable with tabindex=0', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple'] });

			const tag = screen.getByRole('listitem');
			await expect.element(tag).toHaveAttribute('tabindex', '0');
		});
	});

	describe('Keyboard Navigation', () => {
		it('navigates to previous tag on ArrowLeft', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple', 'banana'] });

			// Focus the second tag
			const tags = screen.container.querySelectorAll('[data-tag-id]');
			const secondTag = tags[1] as HTMLElement;
			secondTag.focus();

			// Press ArrowLeft
			await userEvent.keyboard('{ArrowLeft}');

			// First tag should be focused
			const firstTag = tags[0] as HTMLElement;
			expect(document.activeElement).toBe(firstTag);
		});

		it('navigates to next tag on ArrowRight', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple', 'banana'] });

			// Focus the first tag
			const tags = screen.container.querySelectorAll('[data-tag-id]');
			const firstTag = tags[0] as HTMLElement;
			firstTag.focus();

			// Press ArrowRight
			await userEvent.keyboard('{ArrowRight}');

			// Second tag should be focused
			const secondTag = tags[1] as HTMLElement;
			expect(document.activeElement).toBe(secondTag);
		});

		it('focuses input on ArrowRight from last tag', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple'] });
			const input = screen.getByRole('combobox');

			// Focus the only tag
			const tag = screen.getByRole('listitem');
			(tag.element() as HTMLElement).focus();

			// Press ArrowRight
			await userEvent.keyboard('{ArrowRight}');

			// Input should be focused
			expect(document.activeElement).toBe(input.element());
		});

		it('focuses input and opens popover on ArrowDown', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple'] });
			const input = screen.getByRole('combobox');

			// Focus the tag
			const tag = screen.getByRole('listitem');
			(tag.element() as HTMLElement).focus();

			// Press ArrowDown
			await userEvent.keyboard('{ArrowDown}');

			// Input should be focused and popover open
			expect(document.activeElement).toBe(input.element());
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');
		});

		it('removes tag on Delete key', async () => {
			const onValueChange = vi.fn();
			const screen = render(ComboBoxMultiselectTest, {
				value: ['apple', 'banana'],
				onValueChange
			});

			// Focus the first tag
			const tags = screen.container.querySelectorAll('[data-tag-id]');
			const firstTag = tags[0] as HTMLElement;
			firstTag.focus();

			// Press Delete
			await userEvent.keyboard('{Delete}');

			// Should have removed apple
			expect(onValueChange).toHaveBeenCalledWith(['banana']);
		});

		it('removes tag on Backspace key', async () => {
			const onValueChange = vi.fn();
			const screen = render(ComboBoxMultiselectTest, {
				value: ['apple', 'banana'],
				onValueChange
			});

			// Focus the first tag
			const tags = screen.container.querySelectorAll('[data-tag-id]');
			const firstTag = tags[0] as HTMLElement;
			firstTag.focus();

			// Press Backspace
			await userEvent.keyboard('{Backspace}');

			// Should have removed apple
			expect(onValueChange).toHaveBeenCalledWith(['banana']);
		});

		it('focuses next tag after deletion', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple', 'banana', 'cherry'] });

			// Focus the first tag
			const tags = screen.container.querySelectorAll('[data-tag-id]');
			const firstTag = tags[0] as HTMLElement;
			firstTag.focus();

			// Press Delete
			await userEvent.keyboard('{Delete}');

			// Wait for re-render and check focus moved to next tag (now first)
			await new Promise((r) => setTimeout(r, 50));
			const newFirstTag = screen.container.querySelector('[data-tag-id]') as HTMLElement;
			expect(document.activeElement).toBe(newFirstTag);
		});

		it('focuses input after deleting last tag', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple'] });
			const input = screen.getByRole('combobox');

			// Focus the tag
			const tag = screen.getByRole('listitem');
			(tag.element() as HTMLElement).focus();

			// Press Delete
			await userEvent.keyboard('{Delete}');

			// Wait for re-render
			await new Promise((r) => setTimeout(r, 50));

			// Input should be focused
			expect(document.activeElement).toBe(input.element());
		});
	});

	describe('Input to Tags Navigation', () => {
		it('focuses last tag on ArrowLeft when cursor is at input start', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple', 'banana'] });
			const input = screen.getByRole('combobox');

			// Focus input (cursor at start)
			await input.click();

			// Press ArrowLeft
			await userEvent.keyboard('{ArrowLeft}');

			// Last tag should be focused
			const tags = screen.container.querySelectorAll('[data-tag-id]');
			const lastTag = tags[tags.length - 1] as HTMLElement;
			expect(document.activeElement).toBe(lastTag);
		});

		it('does not focus tag on ArrowLeft when cursor is not at start', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple'] });
			const input = screen.getByRole('combobox');

			// Type something and focus input
			await input.click();
			await userEvent.type(input.element() as Element, 'test');

			// Move cursor to end (it's already there, but explicitly)
			const inputEl = input.element() as HTMLInputElement;
			inputEl.setSelectionRange(4, 4);

			// Press ArrowLeft - should move cursor, not focus tag
			await userEvent.keyboard('{ArrowLeft}');

			// Input should still be focused
			expect(document.activeElement).toBe(inputEl);
		});
	});
});
