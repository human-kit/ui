import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import MenuOverlayTest from './menu-overlay-test.svelte';

describe('Menu.Overlay', () => {
	// Clean up any portaled content after each test
	afterEach(() => {
		document.querySelectorAll('[role="menu"]').forEach((m) => m.remove());
		document.querySelectorAll('[data-menu-overlay]').forEach((o) => o.remove());
	});

	it('is not rendered while the menu is closed', () => {
		render(MenuOverlayTest);
		expect(document.querySelector('[data-menu-overlay]')).toBeNull();
	});

	it('renders a fixed backdrop beneath the menu panel when open', async () => {
		const screen = render(MenuOverlayTest, { overlayClass: 'backdrop-dim' });
		const trigger = screen.getByRole('button', { name: 'Open Menu' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[data-menu-overlay]')).toBeTruthy();

		const overlay = document.querySelector('[data-menu-overlay]') as HTMLElement;
		expect(overlay.classList.contains('backdrop-dim')).toBe(true);
		expect(overlay.getAttribute('aria-hidden')).toBe('true');
		expect(window.getComputedStyle(overlay).position).toBe('fixed');

		// The backdrop must sit below the menu panel so the panel stays interactive.
		const menu = document.querySelector('[role="menu"]') as HTMLElement;
		expect(parseInt(overlay.style.zIndex)).toBeLessThan(parseInt(menu.style.zIndex));
	});

	it('exposes presence data attributes while entering', async () => {
		const screen = render(MenuOverlayTest, { overlayClass: 'presence-overlay' });
		const trigger = screen.getByRole('button', { name: 'Open Menu' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[data-menu-overlay]')).toBeTruthy();

		const overlay = document.querySelector('[data-menu-overlay]') as HTMLElement;
		expect(overlay.getAttribute('data-state')).toBe('open');
		expect(overlay.getAttribute('data-entering')).toBe('true');

		overlay.dispatchEvent(new AnimationEvent('animationend', { bubbles: true }));
		await expect.poll(() => overlay.getAttribute('data-entering')).toBeNull();
	});

	it('stays mounted while exiting and unmounts after its motion ends', async () => {
		const screen = render(MenuOverlayTest, { overlayClass: 'presence-overlay' });
		const trigger = screen.getByRole('button', { name: 'Open Menu' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[data-menu-overlay]')).toBeTruthy();

		const overlay = document.querySelector('[data-menu-overlay]') as HTMLElement;
		overlay.dispatchEvent(new AnimationEvent('animationend', { bubbles: true }));

		await userEvent.keyboard('{Escape}');

		await expect.poll(() => overlay.getAttribute('data-exiting')).toBe('true');
		expect(overlay.getAttribute('data-state')).toBe('closed');

		overlay.dispatchEvent(new TransitionEvent('transitionend', { bubbles: true }));
		await expect.poll(() => document.querySelector('[data-menu-overlay]')).toBeNull();
	});

	it('closes the menu when the backdrop is pressed', async () => {
		const screen = render(MenuOverlayTest);
		const trigger = screen.getByRole('button', { name: 'Open Menu' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[data-menu-overlay]')).toBeTruthy();

		const overlay = document.querySelector('[data-menu-overlay]') as HTMLElement;
		overlay.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));

		await expect.poll(() => document.querySelector('[role="menu"]')).toBeNull();
	});
});
