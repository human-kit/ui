import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DialogTest from '../root/dialog-test.svelte';

const EXIT_STYLE_ID = 'dialog-presence-exit-style';

// Give the content a measurable exit animation so the Portal has a duration to wait on. Without it,
// getComputedStyle reports 0ms and the node unmounts on the next frame (the legacy behavior).
function addExitAnimation() {
	const style = document.createElement('style');
	style.id = EXIT_STYLE_ID;
	style.textContent =
		'[data-dialog-content][data-exiting]{animation:dialog-presence-out 120ms linear}' +
		'@keyframes dialog-presence-out{to{opacity:0}}';
	document.head.appendChild(style);
}

describe('Dialog presence (exit animation)', () => {
	afterEach(() => {
		document.getElementById(EXIT_STYLE_ID)?.remove();
		document.querySelectorAll('[role="dialog"]').forEach((d) => d.remove());
		document.querySelectorAll('[data-dialog-overlay]').forEach((o) => o.remove());
	});

	it('keeps the content mounted while it animates out, then unmounts it', async () => {
		addExitAnimation();
		const screen = render(DialogTest);
		await screen.getByRole('button', { name: 'Open Dialog' }).click();
		await expect.poll(() => document.querySelector('[data-dialog-content]')).toBeTruthy();

		const node = document.querySelector('[data-dialog-content]') as HTMLElement;
		expect(node.getAttribute('data-state')).toBe('open');

		(document.querySelector('.close-btn') as HTMLElement).click();

		// Presence: rather than vanishing instantly, the node stays in the DOM marked as exiting so
		// the out-animation has something to animate.
		await expect.poll(() => node.getAttribute('data-state')).toBe('closed');
		expect(node.isConnected).toBe(true);
		expect(node.hasAttribute('data-exiting')).toBe(true);

		// Once the measured animation completes, the Portal removes it.
		await expect.poll(() => node.isConnected).toBe(false);
	});

	it('marks the exiting content inert so focus leaves with the close', async () => {
		addExitAnimation();
		const screen = render(DialogTest);
		await screen.getByRole('button', { name: 'Open Dialog' }).click();
		await expect.poll(() => document.querySelector('[data-dialog-content]')).toBeTruthy();

		const node = document.querySelector('[data-dialog-content]') as HTMLElement;
		(document.querySelector('.close-btn') as HTMLElement).click();

		// While it lingers for the animation it is on its way out: it must not trap focus or stay in
		// the accessibility tree. `inert` covers both — it removes the node from the a11y tree AND
		// prevents focus — so it is used alone (adding `aria-hidden` on top would trip the browser's
		// "aria-hidden on a focused element" warning while a descendant still holds focus).
		await expect.poll(() => node.hasAttribute('inert')).toBe(true);
		expect(node.getAttribute('data-state')).toBe('closed');
	});
});
