import { afterEach, describe, expect, it } from 'vitest';
import { getMotionTime, trackMotionEnd } from './motion';

const KEYFRAMES = `
@keyframes hk-motion-test-fade { from { opacity: 1; } to { opacity: 0; } }
`;

let cleanups: Array<() => void> = [];

afterEach(() => {
	for (const cleanup of cleanups) cleanup();
	cleanups = [];
});

function mount(style: Partial<CSSStyleDeclaration> = {}) {
	const sheet = document.createElement('style');
	sheet.textContent = KEYFRAMES;
	document.head.appendChild(sheet);

	const element = document.createElement('div');
	element.textContent = 'panel';
	Object.assign(element.style, style);
	document.body.appendChild(element);

	cleanups.push(() => {
		element.remove();
		sheet.remove();
	});
	return element;
}

function wait(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Resolves with the `performance.now()` of the first `type` event the element fires. */
function nextEvent(element: HTMLElement, type: 'animationend' | 'transitionend') {
	return new Promise<number>((resolve) => {
		element.addEventListener(type, () => resolve(performance.now()), { once: true });
	});
}

describe('getMotionTime', () => {
	it('takes the longest transition or animation, delay included', () => {
		const element = mount({
			transition: 'opacity 100ms, transform 200ms 50ms',
			animation: 'hk-motion-test-fade 120ms'
		});

		expect(getMotionTime(element)).toBe(250);
	});

	it('is zero when nothing moves', () => {
		expect(getMotionTime(mount())).toBe(0);
	});
});

describe('trackMotionEnd', () => {
	it('completes on the next frame when there is no motion', async () => {
		const element = mount();
		let completed = false;
		trackMotionEnd(element, () => {
			completed = true;
		});

		await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve)));

		expect(completed).toBe(true);
	});

	// The exit animation of an overlay has `fill-mode: none` (tw-animate-css's `animate-out`): once
	// it ends, the panel paints at its full opacity and size again until it unmounts. The tracker
	// starts its clock a frame after the animation started, and only that frame's delay late, the
	// end event was read as "too early" and ignored: the panel then sat on the screen, whole, until
	// the fallback timer 50ms later — an overlay that closed, came back, and closed again.
	it('completes on the end event of an animation that started before the tracker', async () => {
		const element = mount({ animation: 'hk-motion-test-fade 100ms linear' });
		const ended = nextEvent(element, 'animationend');
		// Once the animation runs, a delay well past one frame: the clock of the tracker starts late.
		await element.getAnimations()[0].ready;
		await wait(30);

		const completed = new Promise<number>((resolve) => {
			trackMotionEnd(element, () => resolve(performance.now()));
		});

		const [endedAt, completedAt] = await Promise.all([ended, completed]);

		expect(completedAt - endedAt).toBeLessThan(20);
	});

	it('waits for the longest property of a transition, not the first end event', async () => {
		const element = mount({ opacity: '1', transform: 'scale(1)' });
		// Commit the start values, so that the change below transitions.
		void element.getBoundingClientRect();
		element.style.transition = 'opacity 50ms linear, transform 200ms linear';
		element.style.opacity = '0';
		element.style.transform = 'scale(0.5)';

		const startedAt = performance.now();
		const completed = new Promise<number>((resolve) => {
			trackMotionEnd(element, () => resolve(performance.now()));
		});

		expect((await completed) - startedAt).toBeGreaterThanOrEqual(190);
	});

	it('does not call back once canceled', async () => {
		const element = mount({ animation: 'hk-motion-test-fade 50ms linear' });
		let completed = false;
		const tracker = trackMotionEnd(element, () => {
			completed = true;
		});
		tracker.cancel();

		await wait(150);

		expect(completed).toBe(false);
	});
});
