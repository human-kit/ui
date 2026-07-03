import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import {
	expectFocusVisibleImpliesFocused,
	expectNoFalseFocusAttributes
} from '../../test-utils/focus-contract';
import ToggleTest from './toggle-test.svelte';
import ToggleUncontrolledTest from './toggle-uncontrolled-test.svelte';

describe('Toggle.Root', () => {
	it('renders a native toggle button with unselected state by default', () => {
		const screen = render(ToggleTest);
		const toggle = screen.getByRole('button', { name: 'Favorite' });
		const element = toggle.element() as HTMLButtonElement | null;

		expect(element?.tagName).toBe('BUTTON');
		expect(element?.getAttribute('type')).toBe('button');
		expect(element?.getAttribute('aria-pressed')).toBe('false');
		expect(element?.getAttribute('value')).toBe('favorite');
		expect(element?.getAttribute('data-toggle-root')).toBe('true');
		expect(element?.getAttribute('data-unselected')).toBe('true');
		expect(element?.getAttribute('data-selected')).toBeNull();
		expect(element?.getAttribute('data-pressed')).toBeNull();
	});

	it('supports defaultSelected in uncontrolled mode', () => {
		const screen = render(ToggleUncontrolledTest, { defaultSelected: true });
		const toggle = screen.getByRole('button', { name: 'Favorite' });

		expect(toggle.element()?.getAttribute('aria-pressed')).toBe('true');
		expect(toggle.element()?.getAttribute('data-selected')).toBe('true');
		expect(toggle.element()?.getAttribute('data-pressed')).toBeNull();
		expect(document.querySelector('[data-render-state]')?.textContent).toBe('selected');
	});

	it('treats controlled selected undefined as false', async () => {
		const screen = render(ToggleTest, { selected: undefined });
		const toggle = screen.getByRole('button', { name: 'Favorite' });

		expect(toggle.element()?.getAttribute('aria-pressed')).toBe('false');
		expect(toggle.element()?.getAttribute('data-unselected')).toBe('true');

		await userEvent.click(toggle);

		expect(toggle.element()?.getAttribute('aria-pressed')).toBe('true');
		expect(document.querySelector('[data-selected-state]')?.textContent).toBe('true');
	});

	it('syncs external selected updates after starting from undefined', async () => {
		const screen = render(ToggleTest, { selected: undefined });
		const toggle = screen.getByRole('button', { name: 'Favorite' });
		const setSelected = document.querySelector<HTMLButtonElement>('[data-set-selected]');
		const unsetSelected = document.querySelector<HTMLButtonElement>('[data-unset-selected]');

		expect(toggle.element()?.getAttribute('aria-pressed')).toBe('false');

		await userEvent.click(setSelected as HTMLButtonElement);
		expect(toggle.element()?.getAttribute('aria-pressed')).toBe('true');

		await userEvent.click(unsetSelected as HTMLButtonElement);
		expect(toggle.element()?.getAttribute('aria-pressed')).toBe('false');
		expect(toggle.element()?.getAttribute('data-unselected')).toBe('true');
	});

	it('toggles and calls onChange when clicked', async () => {
		const changes: boolean[] = [];
		const screen = render(ToggleTest, {
			onChange: (selected: boolean) => changes.push(selected)
		});
		const toggle = screen.getByRole('button', { name: 'Favorite' });

		await userEvent.click(toggle);
		expect(toggle.element()?.getAttribute('aria-pressed')).toBe('true');

		await userEvent.click(toggle);
		expect(toggle.element()?.getAttribute('aria-pressed')).toBe('false');
		expect(changes).toEqual([true, false]);
	});

	it('supports bindable selected and external updates', async () => {
		const screen = render(ToggleTest, { selected: false });
		const toggle = screen.getByRole('button', { name: 'Favorite' });
		const setSelected = document.querySelector<HTMLButtonElement>('[data-set-selected]');
		const clearSelected = document.querySelector<HTMLButtonElement>('[data-clear-selected]');

		await userEvent.click(setSelected as HTMLButtonElement);
		expect(toggle.element()?.getAttribute('aria-pressed')).toBe('true');
		expect(document.querySelector('[data-selected-state]')?.textContent).toBe('true');

		await userEvent.click(clearSelected as HTMLButtonElement);
		expect(toggle.element()?.getAttribute('aria-pressed')).toBe('false');
		expect(document.querySelector('[data-selected-state]')?.textContent).toBe('false');
	});

	it('syncs an external selected update back to undefined as false', async () => {
		const screen = render(ToggleTest, { selected: true });
		const toggle = screen.getByRole('button', { name: 'Favorite' });
		const unsetSelected = document.querySelector<HTMLButtonElement>('[data-unset-selected]');

		expect(toggle.element()?.getAttribute('aria-pressed')).toBe('true');

		await userEvent.click(unsetSelected as HTMLButtonElement);

		expect(toggle.element()?.getAttribute('aria-pressed')).toBe('false');
		expect(toggle.element()?.getAttribute('data-unselected')).toBe('true');
		expect(document.querySelector('[data-selected-state]')?.textContent).toBe('false');
	});

	it('sets data-pressed while the pointer is held without changing selected state', async () => {
		const screen = render(ToggleTest);
		const toggle = screen.getByRole('button', { name: 'Favorite' });
		const element = toggle.element();

		element?.dispatchEvent(
			new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0, buttons: 1 })
		);

		await expect.poll(() => element?.getAttribute('data-pressed')).toBe('true');
		expect(element?.getAttribute('data-selected')).toBeNull();
		expect(element?.getAttribute('aria-pressed')).toBe('false');
		expect(document.querySelector('[data-render-state]')?.getAttribute('data-render-pressed')).toBe(
			'true'
		);

		element?.dispatchEvent(
			new MouseEvent('mouseup', { bubbles: true, cancelable: true, button: 0 })
		);
		await expect.poll(() => element?.getAttribute('data-pressed')).toBeNull();
	});

	it('toggles with Space and exposes focus-visible during keyboard interaction', async () => {
		const screen = render(ToggleTest);
		const toggle = screen.getByRole('button', { name: 'Favorite' });
		const element = toggle.element() as HTMLButtonElement | null;

		element?.focus();
		await userEvent.keyboard('{Space>}');

		expect(element?.getAttribute('data-pressed')).toBe('true');
		await expect.poll(() => element?.getAttribute('data-focus-visible')).toBe('true');
		expectFocusVisibleImpliesFocused(element);

		await userEvent.keyboard('{/Space}');
		expect(element?.getAttribute('aria-pressed')).toBe('true');
		expect(element?.getAttribute('data-selected')).toBe('true');
		expect(element?.getAttribute('data-pressed')).toBeNull();
	});

	it('lets external keydown handlers cancel pressed state and keyboard toggle', async () => {
		const changes: boolean[] = [];
		const screen = render(ToggleTest, {
			cancelKeyDown: true,
			onChange: (selected: boolean) => changes.push(selected)
		});
		const toggle = screen.getByRole('button', { name: 'Favorite' });
		const element = toggle.element() as HTMLButtonElement | null;

		element?.focus();
		await userEvent.keyboard('{Space}');

		expect(element?.getAttribute('data-pressed')).toBeNull();
		expect(element?.getAttribute('aria-pressed')).toBe('false');
		expect(changes).toEqual([]);
	});

	it('toggles with Enter', async () => {
		const screen = render(ToggleTest);
		const toggle = screen.getByRole('button', { name: 'Favorite' });

		toggle.element()?.focus();
		await userEvent.keyboard('{Enter}');

		expect(toggle.element()?.getAttribute('aria-pressed')).toBe('true');
	});

	it('sets hovered state on mouse enter and clears it on leave', async () => {
		const screen = render(ToggleTest);
		const toggle = screen.getByRole('button', { name: 'Favorite' });

		await userEvent.hover(toggle.element() as HTMLElement);
		expect(toggle.element()?.getAttribute('data-hovered')).toBe('true');
		expect(document.querySelector('[data-render-state]')?.getAttribute('data-render-hovered')).toBe(
			'true'
		);

		await userEvent.unhover(toggle.element() as HTMLElement);
		expect(toggle.element()?.getAttribute('data-hovered')).toBeNull();
		expectNoFalseFocusAttributes(document);
	});

	it('does not toggle when disabled', async () => {
		const changes: boolean[] = [];
		const screen = render(ToggleTest, {
			disabled: true,
			onChange: (selected: boolean) => changes.push(selected)
		});
		const toggle = screen.getByRole('button', { name: 'Favorite' });
		const element = toggle.element() as HTMLButtonElement | null;

		expect(element?.hasAttribute('disabled')).toBe(true);
		expect(element?.getAttribute('data-disabled')).toBe('true');

		element?.click();
		expect(element?.getAttribute('aria-pressed')).toBe('false');
		expect(changes).toEqual([]);
	});

	it('clears pressed, hovered, and focus-visible state when disabled dynamically', async () => {
		const screen = render(ToggleTest);
		const toggle = screen.getByRole('button', { name: 'Favorite' });
		const element = toggle.element() as HTMLButtonElement | null;
		const disable = document.querySelector<HTMLButtonElement>('[data-disable]');

		await userEvent.hover(element as HTMLButtonElement);
		element?.focus();
		await userEvent.keyboard('{Space>}');

		expect(element?.getAttribute('data-hovered')).toBe('true');
		expect(element?.getAttribute('data-focused')).toBe('true');
		expect(element?.getAttribute('data-focus-visible')).toBe('true');
		expect(element?.getAttribute('data-pressed')).toBe('true');

		await userEvent.click(disable as HTMLButtonElement);

		expect(element?.hasAttribute('disabled')).toBe(true);
		expect(element?.getAttribute('data-disabled')).toBe('true');
		expect(element?.getAttribute('data-hovered')).toBeNull();
		expect(element?.getAttribute('data-focused')).toBeNull();
		expect(element?.getAttribute('data-focus-visible')).toBeNull();
		expect(element?.getAttribute('data-pressed')).toBeNull();
	});

	it('lets external click handlers cancel the toggle', async () => {
		const changes: boolean[] = [];
		const screen = render(ToggleTest, {
			cancelClick: true,
			onChange: (selected: boolean) => changes.push(selected)
		});
		const toggle = screen.getByRole('button', { name: 'Favorite' });

		await userEvent.click(toggle);

		expect(toggle.element()?.getAttribute('aria-pressed')).toBe('false');
		expect(changes).toEqual([]);
	});
});
