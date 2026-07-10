import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import AutocompleteTest from './autocomplete-test.svelte';
import { expectNoFalseFocusAttributes } from '../../test-utils/focus-contract';

function getActiveDescendantText(input: HTMLElement): string | null {
	const id = input.getAttribute('aria-activedescendant');
	if (!id) return null;
	return document.getElementById(id)?.textContent?.trim() ?? null;
}

describe('Autocomplete', () => {
	describe('ARIA', () => {
		it('renders the input as a searchbox controlling the listbox, without aria-expanded', async () => {
			const screen = render(AutocompleteTest, { id: 'fruits' });
			const input = screen.getByRole('searchbox');

			await expect.element(input).toHaveAttribute('aria-controls', 'autocomplete-listbox-fruits');
			await expect.element(input).toHaveAttribute('aria-autocomplete', 'list');
			expect(input.element().hasAttribute('aria-expanded')).toBe(false);
			expect(input.element().hasAttribute('aria-haspopup')).toBe(false);
		});

		it('exposes the list as an always-visible listbox', async () => {
			const screen = render(AutocompleteTest);
			const listbox = screen.getByRole('listbox');
			await expect.element(listbox).toBeInTheDocument();
		});

		it('exposes the labelled root as a group so the aria-label is valid', async () => {
			render(AutocompleteTest);

			// The test harness passes aria-label="Fruits" to the root.
			const root = document.querySelector('[aria-label="Fruits"]');
			expect(root).not.toBeNull();
			expect(root?.getAttribute('role')).toBe('group');
		});
	});

	describe('Filtering', () => {
		it('filters items as the user types', async () => {
			const screen = render(AutocompleteTest);
			const input = screen.getByRole('searchbox');

			await input.fill('an');

			// "Banana", "Mango", "Orange" contain "an"; "Apple" does not.
			await expect.poll(() => screen.getByText('Banana').query()).not.toBeNull();
			await expect.poll(() => screen.getByText('Mango').query()).not.toBeNull();
			await expect.poll(() => screen.getByText('Apple').query()).toBeNull();
		});

		it('shows the Empty part when nothing matches', async () => {
			const screen = render(AutocompleteTest);
			const input = screen.getByRole('searchbox');

			await input.fill('zzz');

			await expect.poll(() => screen.getByText('No fruits found').query()).not.toBeNull();
		});

		it('shows all items when filter is disabled (filter={null})', async () => {
			const screen = render(AutocompleteTest, { filter: null });
			const input = screen.getByRole('searchbox');

			await input.fill('zzz');

			// Local filtering disabled: every item stays visible.
			await expect.poll(() => screen.getByText('Apple').query()).not.toBeNull();
			await expect.poll(() => screen.getByText('Peach').query()).not.toBeNull();
		});
	});

	describe('Virtual focus', () => {
		it('moves aria-activedescendant with ArrowDown while keeping DOM focus on the input', async () => {
			const screen = render(AutocompleteTest, { autoHighlight: false });
			const input = screen.getByRole('searchbox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			const inputEl = input.element() as HTMLElement;
			expect(inputEl.getAttribute('aria-activedescendant')).toBeTruthy();
			// DOM focus must never leave the input.
			expect(document.activeElement).toBe(inputEl);
		});

		it('marks the highlighted item as focus-visible during keyboard navigation', async () => {
			const screen = render(AutocompleteTest, { autoHighlight: false });
			const input = screen.getByRole('searchbox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			await expect
				.poll(() => {
					const id = input.element().getAttribute('aria-activedescendant');
					if (!id) return null;
					return document.getElementById(id)?.getAttribute('data-focus-visible');
				})
				.toBe('true');
		});

		it('auto-highlights the first match when autoHighlight is enabled', async () => {
			const screen = render(AutocompleteTest);
			const input = screen.getByRole('searchbox');

			await input.fill('ap');

			// "Apple" and "Grape" match "ap"; first in DOM order is Apple.
			await expect
				.poll(() => getActiveDescendantText(input.element() as HTMLElement))
				.toBe('Apple');
		});
	});

	describe('Selection', () => {
		it('selects the highlighted item on Enter', async () => {
			const onValueChange = vi.fn();
			const screen = render(AutocompleteTest, { onValueChange, autoHighlight: false });
			const input = screen.getByRole('searchbox');

			await input.click();
			// First ArrowDown highlights the first item (no auto-highlight here).
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			await expect
				.poll(() => document.querySelector('[data-selected-value]')?.textContent)
				.toBe('apple');
			expect(onValueChange).toHaveBeenCalled();
		});

		it('selects an item on click without stealing focus from the input', async () => {
			const screen = render(AutocompleteTest);
			const input = screen.getByRole('searchbox');
			const inputEl = input.element() as HTMLElement;

			await input.click();
			await screen.getByText('Cherry').click();

			await expect
				.poll(() => document.querySelector('[data-selected-value]')?.textContent)
				.toBe('cherry');

			// Critical for virtual focus: DOM focus must remain on the input after a click.
			expect(document.activeElement).toBe(inputEl);
		});

		it('keeps arrow-key navigation working after clicking an item', async () => {
			const screen = render(AutocompleteTest);
			const input = screen.getByRole('searchbox');
			const inputEl = input.element() as HTMLElement;

			await input.click();
			await screen.getByText('Cherry').click();

			// Focus stays on the input, so arrows must still move the virtual focus.
			expect(document.activeElement).toBe(inputEl);

			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => inputEl.getAttribute('aria-activedescendant')).toBeTruthy();
			expect(document.activeElement).toBe(inputEl);
		});
	});

	describe('Focus presentation (single-source focus, RAC parity)', () => {
		function optionFor(screen: ReturnType<typeof render>, text: string): HTMLElement {
			return screen.getByText(text).element().closest('[role="option"]') as HTMLElement;
		}

		it('hovering a non-active option marks it data-hovered, never data-focused', async () => {
			const screen = render(AutocompleteTest, { autoHighlight: false });
			const input = screen.getByRole('searchbox');

			await input.click();
			await input.fill('a');
			await screen.getByText('Mango').hover();

			const mango = optionFor(screen, 'Mango');
			await expect.poll(() => mango.getAttribute('data-hovered')).toBe('true');
			expect(mango.hasAttribute('data-focused')).toBe(false);
		});

		it('clicking an option leaves the input without focus markers (the option is focused)', async () => {
			const screen = render(AutocompleteTest);
			const input = screen.getByRole('searchbox');
			const inputEl = input.element() as HTMLElement;

			await input.click();
			await input.fill('a');
			await screen.getByTestId('label-mango').click();

			// The clicked option owns the focused state...
			const mango = screen
				.getByTestId('label-mango')
				.element()
				.closest('[role="option"]') as HTMLElement;
			await expect.poll(() => mango.getAttribute('data-focused')).toBe('true');
			// ...but a pointer click must not produce a keyboard focus ring.
			expect(mango.hasAttribute('data-focus-visible')).toBe(false);
			// ...and the input must not present itself as focused.
			expect(inputEl.hasAttribute('data-focused')).toBe(false);
			expect(inputEl.hasAttribute('data-focus-visible')).toBe(false);
		});

		it('keyboard navigation focuses the option (with ring), not the input', async () => {
			const screen = render(AutocompleteTest);
			const input = screen.getByRole('searchbox');
			const inputEl = input.element() as HTMLElement;

			await input.click();
			await input.fill('a');
			await userEvent.keyboard('{ArrowDown}');

			// Active descendant carries both focused and focus-visible.
			await expect
				.poll(() => {
					const id = inputEl.getAttribute('aria-activedescendant');
					return id && document.getElementById(id)?.getAttribute('data-focused');
				})
				.toBe('true');
			const activeId = inputEl.getAttribute('aria-activedescendant')!;
			expect(document.getElementById(activeId)?.getAttribute('data-focus-visible')).toBe('true');

			// The input never shows focus markers while an option is active.
			expect(inputEl.hasAttribute('data-focused')).toBe(false);
			expect(inputEl.hasAttribute('data-focus-visible')).toBe(false);
		});

		it('shows input focus markers only when no option is active', async () => {
			const screen = render(AutocompleteTest, { autoHighlight: false });
			const input = screen.getByRole('searchbox');
			const inputEl = input.element() as HTMLElement;

			// Keyboard-focus the input via Tab so focus-visible applies, with no active option.
			await userEvent.keyboard('{Tab}');
			await expect.poll(() => inputEl.getAttribute('data-focused')).toBe('true');
			expect(inputEl.getAttribute('data-focus-visible')).toBe('true');
			expect(inputEl.getAttribute('aria-activedescendant')).toBeNull();
		});
	});

	describe('Focus management (virtual focus invariant)', () => {
		it('returns focus to the input when an option is clicked after focus was lost', async () => {
			const screen = render(AutocompleteTest);
			const input = screen.getByRole('searchbox');
			const inputEl = input.element() as HTMLElement;
			const outside = screen.getByTestId('outside-button');

			// Move focus completely away from the autocomplete.
			await outside.click();
			expect(document.activeElement).not.toBe(inputEl);

			// Clicking an option must bring focus back to the input.
			await screen.getByText('Cherry').click();

			expect(document.activeElement).toBe(inputEl);
			await expect
				.poll(() => document.querySelector('[data-selected-value]')?.textContent)
				.toBe('cherry');
		});

		it('keeps keyboard navigation working after a click recovered focus', async () => {
			const screen = render(AutocompleteTest);
			const input = screen.getByRole('searchbox');
			const inputEl = input.element() as HTMLElement;
			const outside = screen.getByTestId('outside-button');

			await outside.click();
			await screen.getByText('Banana').click();
			expect(document.activeElement).toBe(inputEl);

			// Arrows must move the virtual focus now that the input is focused again.
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => inputEl.getAttribute('aria-activedescendant')).toBeTruthy();
			expect(document.activeElement).toBe(inputEl);
		});

		it('keeps typing working after a click recovered focus', async () => {
			const screen = render(AutocompleteTest);
			const input = screen.getByRole('searchbox');
			const inputEl = input.element() as HTMLElement;
			const outside = screen.getByTestId('outside-button');

			await outside.click();
			await screen.getByText('Cherry').click();
			expect(document.activeElement).toBe(inputEl);

			// Typing must update the query and filter the list.
			await userEvent.keyboard('man');
			await expect.element(input).toHaveValue('man');
			await expect.poll(() => screen.getByText('Mango').query()).not.toBeNull();
			await expect.poll(() => screen.getByText('Apple').query()).toBeNull();
		});

		it('keeps focus on the input when a click lands on nested content inside an option', async () => {
			const screen = render(AutocompleteTest);
			const input = screen.getByRole('searchbox');
			const inputEl = input.element() as HTMLElement;

			await input.click();
			// Click the inner label span, not the option container.
			await screen.getByTestId('label-grape').click();

			expect(document.activeElement).toBe(inputEl);
			await expect
				.poll(() => document.querySelector('[data-selected-value]')?.textContent)
				.toBe('grape');
		});

		it('returns focus to the input when nested content is clicked after focus was lost', async () => {
			const screen = render(AutocompleteTest);
			const input = screen.getByRole('searchbox');
			const inputEl = input.element() as HTMLElement;
			const outside = screen.getByTestId('outside-button');

			await outside.click();
			await screen.getByTestId('label-mango').click();

			expect(document.activeElement).toBe(inputEl);
			await expect
				.poll(() => document.querySelector('[data-selected-value]')?.textContent)
				.toBe('mango');
		});
	});

	describe('Readonly', () => {
		it('does not change selection on Enter when readonly', async () => {
			const onValueChange = vi.fn();
			const screen = render(AutocompleteTest, {
				readonly: true,
				autoHighlight: false,
				onValueChange
			});
			const input = screen.getByRole('searchbox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			expect(onValueChange).not.toHaveBeenCalled();
			expect(document.querySelector('[data-selected-value]')?.textContent).toBe('');
		});

		it('does not change selection on click when readonly', async () => {
			const onValueChange = vi.fn();
			const screen = render(AutocompleteTest, { readonly: true, onValueChange });
			const input = screen.getByRole('searchbox');

			await input.click();
			await screen.getByText('Cherry').click();

			expect(onValueChange).not.toHaveBeenCalled();
			expect(document.querySelector('[data-selected-value]')?.textContent).toBe('');
		});
	});

	describe('Keyboard', () => {
		it('clears the query on Escape', async () => {
			const screen = render(AutocompleteTest);
			const input = screen.getByRole('searchbox');

			await input.fill('ban');
			await expect.element(input).toHaveValue('ban');

			await userEvent.keyboard('{Escape}');
			await expect.element(input).toHaveValue('');
		});

		it('stops Escape propagation when it clears the query, but not when there is nothing to clear', async () => {
			const screen = render(AutocompleteTest);
			const input = screen.getByRole('searchbox');
			const inputEl = input.element() as HTMLElement;

			let escapesReachedDocument = 0;
			const onDocumentKeydown = (event: KeyboardEvent) => {
				if (event.key === 'Escape') escapesReachedDocument += 1;
			};
			document.addEventListener('keydown', onDocumentKeydown);

			try {
				await input.fill('ban');
				await expect.element(input).toHaveValue('ban');

				// Consumed: clears the query and must not bubble to the document
				// (an enclosing Dialog would otherwise also close).
				inputEl.dispatchEvent(
					new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
				);
				await expect.element(input).toHaveValue('');
				expect(escapesReachedDocument).toBe(0);

				// Nothing to clear: Escape must propagate normally.
				inputEl.dispatchEvent(
					new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
				);
				expect(escapesReachedDocument).toBe(1);
			} finally {
				document.removeEventListener('keydown', onDocumentKeydown);
			}
		});

		it('ignores Enter while composing (IME) so no item is selected', async () => {
			const onValueChange = vi.fn();
			const screen = render(AutocompleteTest, { onValueChange });
			const input = screen.getByRole('searchbox');

			// autoHighlight focuses the first match, so a real Enter would select.
			await input.fill('ap');
			await expect
				.poll(() => getActiveDescendantText(input.element() as HTMLElement))
				.toBe('Apple');

			input.element().dispatchEvent(
				new KeyboardEvent('keydown', {
					key: 'Enter',
					isComposing: true,
					bubbles: true,
					cancelable: true
				})
			);

			// Let any (incorrect) state update settle before asserting
			await new Promise((resolve) => setTimeout(resolve, 20));
			expect(onValueChange).not.toHaveBeenCalled();
			expect(document.querySelector('[data-selected-value]')?.textContent).toBe('');
		});
	});

	describe('Status', () => {
		it('announces the number of available results', async () => {
			const screen = render(AutocompleteTest);
			const status = document.querySelector('[role="status"][aria-live="polite"]');
			expect(status).not.toBeNull();

			const input = screen.getByRole('searchbox');
			await input.fill('an');

			// Banana, Mango, Orange.
			await expect.poll(() => status?.textContent?.trim()).toBe('3 results available');
		});
	});

	describe('Focus contract', () => {
		it('does not emit false focus attributes before interaction', async () => {
			render(AutocompleteTest);
			expectNoFalseFocusAttributes();
		});
	});
});
