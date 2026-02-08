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

		it('uses virtual focus (no tabindex)', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple'] });

			const tag = screen.getByRole('listitem');
			await expect.element(tag).not.toHaveAttribute('tabindex');
		});
	});

	describe('Virtual Focus Navigation', () => {
		it('navigates to previous tag on ArrowLeft', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple', 'banana'] });
			const input = screen.getByRole('combobox');

			// Focus input and navigate to last tag
			await input.click();
			await userEvent.keyboard('{ArrowLeft}');

			// Last tag should have virtual focus
			const tags = screen.container.querySelectorAll('[data-tag-id]');
			expect(tags[1]).toHaveAttribute('data-focused', 'true');

			// Press ArrowLeft to navigate to first tag
			await userEvent.keyboard('{ArrowLeft}');

			expect(tags[0]).toHaveAttribute('data-focused', 'true');
			expect(tags[1]).not.toHaveAttribute('data-focused');
			// DOM focus stays on input
			expect(document.activeElement).toBe(input.element());
		});

		it('navigates to next tag on ArrowRight', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple', 'banana'] });
			const input = screen.getByRole('combobox');

			// Focus input and navigate to first tag (ArrowLeft twice)
			await input.click();
			await userEvent.keyboard('{ArrowLeft}');
			await userEvent.keyboard('{ArrowLeft}');

			const tags = screen.container.querySelectorAll('[data-tag-id]');
			expect(tags[0]).toHaveAttribute('data-focused', 'true');

			// Press ArrowRight to navigate to second tag
			await userEvent.keyboard('{ArrowRight}');

			expect(tags[1]).toHaveAttribute('data-focused', 'true');
			expect(tags[0]).not.toHaveAttribute('data-focused');
			// DOM focus stays on input
			expect(document.activeElement).toBe(input.element());
		});

		it('clears virtual focus on ArrowRight from last tag', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple'] });
			const input = screen.getByRole('combobox');

			// Navigate to the only tag
			await input.click();
			await userEvent.keyboard('{ArrowLeft}');

			const tag = screen.getByRole('listitem');
			expect(tag.element()).toHaveAttribute('data-focused', 'true');

			// Press ArrowRight - should clear virtual focus
			await userEvent.keyboard('{ArrowRight}');

			expect(tag.element()).not.toHaveAttribute('data-focused');
			expect(document.activeElement).toBe(input.element());
		});

		it('opens popover on ArrowDown from virtually focused tag', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple'] });
			const input = screen.getByRole('combobox');

			// Navigate to tag
			await input.click();
			await userEvent.keyboard('{ArrowLeft}');

			// Press ArrowDown
			await userEvent.keyboard('{ArrowDown}');

			// Tag virtual focus cleared, popover opened
			const tag = screen.getByRole('listitem');
			expect(tag.element()).not.toHaveAttribute('data-focused');
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');
			expect(document.activeElement).toBe(input.element());
		});

		it('opens popover on ArrowUp from virtually focused tag', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple'] });
			const input = screen.getByRole('combobox');

			// Navigate to tag
			await input.click();
			await userEvent.keyboard('{ArrowLeft}');

			// Press ArrowUp
			await userEvent.keyboard('{ArrowUp}');

			// Tag virtual focus cleared, popover opened
			const tag = screen.getByRole('listitem');
			expect(tag.element()).not.toHaveAttribute('data-focused');
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');
			expect(document.activeElement).toBe(input.element());
		});

		it('removes tag on Delete key', async () => {
			const onValueChange = vi.fn();
			const screen = render(ComboBoxMultiselectTest, {
				value: ['apple', 'banana'],
				onValueChange
			});
			const input = screen.getByRole('combobox');

			// Navigate to first tag (ArrowLeft twice)
			await input.click();
			await userEvent.keyboard('{ArrowLeft}');
			await userEvent.keyboard('{ArrowLeft}');

			// Press Delete
			await userEvent.keyboard('{Delete}');

			expect(onValueChange).toHaveBeenCalledWith(['banana']);
		});

		it('removes tag on Backspace key', async () => {
			const onValueChange = vi.fn();
			const screen = render(ComboBoxMultiselectTest, {
				value: ['apple', 'banana'],
				onValueChange
			});
			const input = screen.getByRole('combobox');

			// Navigate to first tag (ArrowLeft twice)
			await input.click();
			await userEvent.keyboard('{ArrowLeft}');
			await userEvent.keyboard('{ArrowLeft}');

			// Press Backspace
			await userEvent.keyboard('{Backspace}');

			expect(onValueChange).toHaveBeenCalledWith(['banana']);
		});

		it('virtually focuses next tag after deletion', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple', 'banana', 'cherry'] });
			const input = screen.getByRole('combobox');

			// Navigate to first tag (ArrowLeft 3 times)
			await input.click();
			await userEvent.keyboard('{ArrowLeft}');
			await userEvent.keyboard('{ArrowLeft}');
			await userEvent.keyboard('{ArrowLeft}');

			// Delete first tag
			await userEvent.keyboard('{Delete}');

			// Next tag (banana, now first) should have virtual focus
			await new Promise((r) => setTimeout(r, 50));
			const newFirstTag = screen.container.querySelector('[data-tag-id]') as HTMLElement;
			expect(newFirstTag).toHaveAttribute('data-focused', 'true');
			expect(document.activeElement).toBe(input.element());
		});

		it('clears virtual focus after deleting last remaining tag', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple'] });
			const input = screen.getByRole('combobox');

			// Navigate to the tag
			await input.click();
			await userEvent.keyboard('{ArrowLeft}');

			// Delete it
			await userEvent.keyboard('{Delete}');

			// Wait for re-render
			await new Promise((r) => setTimeout(r, 50));

			// No tags left, DOM focus stays on input
			const tags = screen.container.querySelectorAll('[data-tag-id]');
			expect(tags.length).toBe(0);
			expect(document.activeElement).toBe(input.element());
		});

		it('clears virtual focus and types in input on character key', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple', 'banana'] });
			const input = screen.getByRole('combobox');

			// Navigate to a tag
			await input.click();
			await userEvent.keyboard('{ArrowLeft}');

			const tags = screen.container.querySelectorAll('[data-tag-id]');
			expect(tags[1]).toHaveAttribute('data-focused', 'true');

			// Type a character - should clear virtual focus and type in input
			await userEvent.keyboard('x');

			expect(tags[1]).not.toHaveAttribute('data-focused');
			expect(document.activeElement).toBe(input.element());
		});
	});

	describe('Input to Tags Navigation', () => {
		it('virtually focuses last tag on ArrowLeft when cursor is at input start', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple', 'banana'] });
			const input = screen.getByRole('combobox');

			// Focus input (cursor at start)
			await input.click();

			// Press ArrowLeft
			await userEvent.keyboard('{ArrowLeft}');

			// Last tag should have virtual focus
			const tags = screen.container.querySelectorAll('[data-tag-id]');
			const lastTag = tags[tags.length - 1] as HTMLElement;
			expect(lastTag).toHaveAttribute('data-focused', 'true');
			// DOM focus stays on input
			expect(document.activeElement).toBe(input.element());
		});

		it('does not virtually focus tag on ArrowLeft when cursor is not at start', async () => {
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

			// Input should still be focused, no tag should have virtual focus
			expect(document.activeElement).toBe(inputEl);
			const tag = screen.getByRole('listitem');
			expect(tag.element()).not.toHaveAttribute('data-focused');
		});

		it('does not focus tag on click (virtual focus only via arrows)', async () => {
			const screen = render(ComboBoxMultiselectTest, { value: ['apple'] });
			const input = screen.getByRole('combobox');

			// First focus the input
			await input.click();
			expect(document.activeElement).toBe(input.element());

			// Click on the tag
			const tag = screen.getByRole('listitem');
			await tag.click();

			// Tag should NOT have virtual focus
			expect(tag.element()).not.toHaveAttribute('data-focused');
			// DOM focus should stay on input (not move to tag)
			expect(document.activeElement).toBe(input.element());
		});
	});
});
