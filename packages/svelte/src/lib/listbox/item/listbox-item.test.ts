import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ListBoxTest from '../root/listbox-test.svelte';

describe('ListBox.Item', () => {
	describe('Accessibility', () => {
		it('has role="option"', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			expect(options.length).toBe(5);
		});

		it('has unique id for each item', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			const ids = Array.from(options).map((el) => el.id);
			const uniqueIds = new Set(ids);
			expect(ids.length).toBe(uniqueIds.size);
		});

		it('has data-item-id attribute', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			expect(options[0].getAttribute('data-item-id')).toBe('apple');
			expect(options[1].getAttribute('data-item-id')).toBe('banana');
		});
	});

	describe('Selection State', () => {
		it('has aria-selected="false" by default', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			expect(options[0].getAttribute('aria-selected')).toBe('false');
		});

		it('has aria-selected="true" when selected', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			// Click to select first item
			const options = listbox.element().querySelectorAll('[role="option"]');
			await (options[0] as HTMLElement).click();

			expect(options[0].getAttribute('aria-selected')).toBe('true');
		});

		it('has data-selected attribute when selected', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			await (options[0] as HTMLElement).click();

			const selectedOption = listbox.element().querySelector('[data-selected]');
			expect(selectedOption).toBeTruthy();
		});
	});

	describe('Focus State', () => {
		it('has data-focused when virtually focused', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			await listbox.click();
			await userEvent.keyboard('{Home}');

			const focusedOption = listbox.element().querySelector('[data-focused]');
			expect(focusedOption).toBeTruthy();
			expect(focusedOption?.textContent).toContain('Apple');
		});

		it('moves focus when navigating', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			await listbox.click();
			await userEvent.keyboard('{Home}');

			let focusedOption = listbox.element().querySelector('[data-focused]');
			expect(focusedOption?.textContent).toContain('Apple');

			await userEvent.keyboard('{ArrowDown}');

			focusedOption = listbox.element().querySelector('[data-focused]');
			expect(focusedOption?.textContent).toContain('Banana');
		});

		it('has tabindex based on focus state', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			await listbox.click();
			await userEvent.keyboard('{Home}');

			const options = listbox.element().querySelectorAll('[role="option"]');
			// Focused item should have tabindex=0
			expect(options[0].getAttribute('tabindex')).toBe('0');
			// Others should have tabindex=-1
			expect(options[1].getAttribute('tabindex')).toBe('-1');
		});
	});

	describe('Hover State', () => {
		it('has data-hovered on mouse enter', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			await userEvent.hover(options[0] as HTMLElement);

			expect(options[0].hasAttribute('data-hovered')).toBe(true);
		});

		it('removes data-hovered on mouse leave', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			await userEvent.hover(options[0] as HTMLElement);
			await userEvent.unhover(options[0] as HTMLElement);

			expect(options[0].hasAttribute('data-hovered')).toBe(false);
		});
	});

	describe('Pressed State', () => {
		it('has data-pressed while the pointer is held', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			(options[0] as HTMLElement).dispatchEvent(
				new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0, buttons: 1 })
			);

			await expect.poll(() => options[0].getAttribute('data-pressed')).toBe('true');

			(options[0] as HTMLElement).dispatchEvent(
				new MouseEvent('mouseup', { bubbles: true, cancelable: true, button: 0 })
			);

			await expect.poll(() => options[0].getAttribute('data-pressed')).toBeNull();
		});

		it('has data-pressed while Enter is held on the focused item', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			await listbox.click();
			await userEvent.keyboard('{Home}');

			const options = listbox.element().querySelectorAll('[role="option"]');
			await userEvent.keyboard('{Enter>}');

			await expect.poll(() => options[0].getAttribute('data-pressed')).toBe('true');

			await userEvent.keyboard('{/Enter}');
			await expect.poll(() => options[0].getAttribute('data-pressed')).toBeNull();
		});

		it('supports controlled pressed override and clears it when disabled', async () => {
			const screen = render(ListBoxTest, {
				pressedIds: ['banana', 'cherry'],
				disabledIds: ['cherry']
			});
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			expect(options[1].getAttribute('data-pressed')).toBe('true');
			expect(options[2].getAttribute('data-pressed')).toBeNull();
		});
	});

	describe('Disabled State', () => {
		it('has aria-disabled when disabled', async () => {
			const screen = render(ListBoxTest, { disabledIds: ['cherry'] });
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			expect(options[2].getAttribute('aria-disabled')).toBe('true');
		});

		it('has data-disabled attribute when disabled', async () => {
			const screen = render(ListBoxTest, { disabledIds: ['cherry'] });
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			expect(options[2].hasAttribute('data-disabled')).toBe(true);
		});

		it('does not get hovered when disabled', async () => {
			const screen = render(ListBoxTest, { disabledIds: ['cherry'] });
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			await userEvent.hover(options[2] as HTMLElement);

			expect(options[2].hasAttribute('data-hovered')).toBe(false);
		});
	});

	describe('Click Interaction', () => {
		it('selects on click', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			await (options[1] as HTMLElement).click();

			expect(options[1].getAttribute('aria-selected')).toBe('true');
			expect(options[1].hasAttribute('data-selected')).toBe(true);
		});

		it('sets focus on click', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			await (options[3] as HTMLElement).click();

			expect(options[3].hasAttribute('data-focused')).toBe(true);
		});
	});
});
