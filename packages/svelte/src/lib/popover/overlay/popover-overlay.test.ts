import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import PopoverOverlayTest from './popover-overlay-test.svelte';

describe('Popover.Overlay', () => {
	// Clean up any portaled content after each test
	afterEach(() => {
		document.querySelectorAll('[role="dialog"]').forEach((d) => d.remove());
		document.querySelectorAll('[data-popover-overlay]').forEach((o) => o.remove());
	});

	it('is not rendered while the popover is closed', () => {
		render(PopoverOverlayTest);
		expect(document.querySelector('[data-popover-overlay]')).toBeNull();
	});

	it('renders a fixed backdrop beneath the popover panel when open', async () => {
		const screen = render(PopoverOverlayTest, { overlayClass: 'backdrop-dim' });
		const trigger = screen.getByRole('button', { name: 'Open Popover' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[data-popover-overlay]')).toBeTruthy();

		const overlay = document.querySelector('[data-popover-overlay]') as HTMLElement;
		expect(overlay.classList.contains('backdrop-dim')).toBe(true);
		expect(overlay.getAttribute('aria-hidden')).toBe('true');
		expect(window.getComputedStyle(overlay).position).toBe('fixed');

		// The backdrop must sit below the popover panel so the panel stays interactive.
		const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
		expect(parseInt(overlay.style.zIndex)).toBeLessThan(parseInt(dialog.style.zIndex));
	});

	it('exposes presence data attributes while entering', async () => {
		const screen = render(PopoverOverlayTest, { overlayClass: 'presence-overlay' });
		const trigger = screen.getByRole('button', { name: 'Open Popover' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[data-popover-overlay]')).toBeTruthy();

		const overlay = document.querySelector('[data-popover-overlay]') as HTMLElement;
		expect(overlay.getAttribute('data-state')).toBe('open');
		expect(overlay.getAttribute('data-entering')).toBe('true');

		overlay.dispatchEvent(new AnimationEvent('animationend', { bubbles: true }));
		await expect.poll(() => overlay.getAttribute('data-entering')).toBeNull();
	});

	it('stays mounted while exiting and unmounts after its motion ends', async () => {
		const screen = render(PopoverOverlayTest, { overlayClass: 'presence-overlay' });
		const trigger = screen.getByRole('button', { name: 'Open Popover' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[data-popover-overlay]')).toBeTruthy();

		const overlay = document.querySelector('[data-popover-overlay]') as HTMLElement;
		overlay.dispatchEvent(new AnimationEvent('animationend', { bubbles: true }));

		await userEvent.keyboard('{Escape}');

		await expect.poll(() => overlay.getAttribute('data-exiting')).toBe('true');
		expect(overlay.getAttribute('data-state')).toBe('closed');

		overlay.dispatchEvent(new TransitionEvent('transitionend', { bubbles: true }));
		await expect.poll(() => document.querySelector('[data-popover-overlay]')).toBeNull();
	});

	it('closes the popover when the backdrop is pressed', async () => {
		const screen = render(PopoverOverlayTest);
		const trigger = screen.getByRole('button', { name: 'Open Popover' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[data-popover-overlay]')).toBeTruthy();

		const overlay = document.querySelector('[data-popover-overlay]') as HTMLElement;
		overlay.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));

		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
	});
});
