import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	getPointerReleaseVelocity,
	useWheelScroll,
	type WheelScrollSample
} from './use-wheel-scroll.svelte';

/**
 * Fake timers that also fake `performance.now`, so pointer-release velocity
 * measurements advance together with `vi.advanceTimersByTime`.
 */
function useFakeTimersWithPerformance() {
	vi.useFakeTimers({
		toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date', 'performance']
	});
}

function getExpectedCenteredIndex(container: HTMLElement): number {
	const items = Array.from(container.querySelectorAll<HTMLElement>('[data-wheel-item]'));
	const centerLine = container.scrollTop + container.clientHeight / 2;

	let closestIndex = -1;
	let closestDistance = Number.POSITIVE_INFINITY;

	for (let index = 0; index < items.length; index += 1) {
		const item = items[index];
		const itemCenter = item.offsetTop + item.offsetHeight / 2;
		const distance = Math.abs(itemCenter - centerLine);
		if (distance < closestDistance) {
			closestDistance = distance;
			closestIndex = index;
		}
	}

	return closestIndex;
}

function createWheelFixture() {
	const container = document.createElement('div');
	container.dataset.wheelDebug = 'false';
	document.body.appendChild(container);
	let currentScrollTop = 0;

	Object.defineProperty(container, 'clientHeight', {
		configurable: true,
		value: 100
	});

	Object.defineProperty(container, 'scrollTop', {
		configurable: true,
		get: () => currentScrollTop,
		set: (value: number) => {
			currentScrollTop = value;
		}
	});

	Object.defineProperty(container, 'scrollTo', {
		configurable: true,
		value: vi.fn(({ top }: { top: number }) => {
			container.scrollTop = top;
		})
	});

	for (let index = 0; index < 4; index += 1) {
		const item = document.createElement('div');
		item.setAttribute('data-wheel-item', 'true');
		Object.defineProperty(item, 'offsetTop', {
			configurable: true,
			value: index * 40
		});
		Object.defineProperty(item, 'offsetHeight', {
			configurable: true,
			value: 40
		});
		container.appendChild(item);
	}

	return { container };
}

function createWheelFixtureWithoutTaggedItems() {
	const container = document.createElement('div');
	container.dataset.wheelDebug = 'false';
	document.body.appendChild(container);
	let currentScrollTop = 0;

	Object.defineProperty(container, 'clientHeight', {
		configurable: true,
		value: 100
	});

	Object.defineProperty(container, 'scrollTop', {
		configurable: true,
		get: () => currentScrollTop,
		set: (value: number) => {
			currentScrollTop = value;
		}
	});

	Object.defineProperty(container, 'scrollTo', {
		configurable: true,
		value: vi.fn(({ top }: { top: number }) => {
			container.scrollTop = top;
		})
	});

	for (let index = 0; index < 4; index += 1) {
		const item = document.createElement('div');
		item.textContent = `option-${index}`;
		Object.defineProperty(item, 'offsetTop', {
			configurable: true,
			value: index * 40
		});
		Object.defineProperty(item, 'offsetHeight', {
			configurable: true,
			value: 40
		});
		container.appendChild(item);
	}

	const topSpacer = document.createElement('div');
	topSpacer.setAttribute('data-wheel-spacer', 'top');
	container.appendChild(topSpacer);

	const highlight = document.createElement('div');
	highlight.setAttribute('data-wheel-highlight', 'true');
	container.appendChild(highlight);

	return { container };
}

function dispatchPressStart(target: HTMLElement) {
	if (typeof PointerEvent !== 'undefined') {
		target.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				pointerType: 'touch'
			})
		);
		return;
	}
	target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
}

function dispatchPressEnd() {
	if (typeof PointerEvent !== 'undefined') {
		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				button: 0,
				pointerType: 'touch'
			})
		);
		return;
	}
	window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0 }));
}

describe('useWheelScroll', () => {
	afterEach(() => {
		vi.useRealTimers();
		document.body.innerHTML = '';
	});

	it('snaps to centered item after scroll inactivity timeout', () => {
		vi.useFakeTimers();
		const { container } = createWheelFixture();
		const onSnap = vi.fn();
		useWheelScroll(container, onSnap);

		container.scrollTop = 30;
		container.dispatchEvent(new Event('scroll'));

		vi.advanceTimersByTime(120);

		expect(onSnap).toHaveBeenCalledTimes(1);
		expect(onSnap).toHaveBeenCalledWith(1);
	});

	it('suppresses snap while smooth silent scroll window is active', () => {
		vi.useFakeTimers();
		const { container } = createWheelFixture();
		const onSnap = vi.fn();
		const api = useWheelScroll(container, onSnap);

		api.scrollToIndex(2, 'smooth', { silent: true });
		container.dispatchEvent(new Event('scroll'));
		vi.advanceTimersByTime(200);

		expect(onSnap).not.toHaveBeenCalled();
	});

	it('keeps the silent window when scrollend fires before the silent target is reached', () => {
		vi.useFakeTimers();
		const { container } = createWheelFixture();
		// Simulate an in-flight smooth scroll: scrollTo does not move scrollTop.
		(container.scrollTo as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {});
		const onSnap = vi.fn();
		const api = useWheelScroll(container, onSnap);

		api.scrollToIndex(2, 'smooth', { silent: true }); // silent target: scrollTop 50

		// A premature scrollend far from the target must not lift the window.
		container.dispatchEvent(new Event('scrollend'));
		container.scrollTop = 20;
		container.dispatchEvent(new Event('scroll'));
		vi.advanceTimersByTime(120);
		expect(onSnap).not.toHaveBeenCalled();

		// Once the target is reached, scrollend lifts the window and the wheel
		// reacts to user scrolling again.
		container.scrollTop = 50;
		container.dispatchEvent(new Event('scrollend'));
		container.scrollTop = 70;
		container.dispatchEvent(new Event('scroll'));
		vi.advanceTimersByTime(120);

		expect(onSnap).toHaveBeenCalledTimes(1);
		expect(onSnap).toHaveBeenCalledWith(getExpectedCenteredIndex(container));
	});

	it('allows snap again after silent scroll window expires', () => {
		vi.useFakeTimers();
		const { container } = createWheelFixture();
		const onSnap = vi.fn();
		const api = useWheelScroll(container, onSnap);

		api.scrollToIndex(2, 'smooth', { silent: true });
		vi.advanceTimersByTime(601);

		container.scrollTop = 70;
		container.dispatchEvent(new Event('scroll'));
		vi.advanceTimersByTime(120);

		expect(onSnap).toHaveBeenCalledTimes(1);
		expect(onSnap).toHaveBeenCalledWith(getExpectedCenteredIndex(container));
	});

	it('snaps to corrected index returned by onSnap', () => {
		vi.useFakeTimers();
		const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
			callback(performance.now() + 120);
			return 1;
		});

		const { container } = createWheelFixture();
		const onSnap = vi.fn((centeredIndex: number) => {
			return centeredIndex === 1 ? 2 : centeredIndex;
		});
		useWheelScroll(container, onSnap);

		container.scrollTop = 30;
		container.dispatchEvent(new Event('scroll'));
		vi.advanceTimersByTime(120);

		const items = container.querySelectorAll<HTMLElement>('[data-wheel-item]');
		const target = items[2];
		const expectedTop = Math.max(
			0,
			target.offsetTop - (container.clientHeight - target.offsetHeight) / 2
		);

		expect(onSnap).toHaveBeenCalledWith(1);
		expect(container.scrollTop).toBe(expectedTop);

		rafSpy.mockRestore();
	});

	it('defers snap while pointer is held and snaps on a still release', () => {
		useFakeTimersWithPerformance();
		const { container } = createWheelFixture();
		const onSnap = vi.fn();
		useWheelScroll(container, onSnap);

		dispatchPressStart(container);
		container.scrollTop = 30;
		container.dispatchEvent(new Event('scroll'));
		// The pointer stays still long enough that the release has no velocity.
		vi.advanceTimersByTime(200);

		expect(onSnap).not.toHaveBeenCalled();

		dispatchPressEnd();

		expect(onSnap).toHaveBeenCalledTimes(1);
		expect(onSnap).toHaveBeenCalledWith(1);
	});

	it('does not snap immediately on a flick release so native momentum survives', () => {
		useFakeTimersWithPerformance();
		const { container } = createWheelFixture();
		const onSnap = vi.fn();
		useWheelScroll(container, onSnap);

		dispatchPressStart(container);
		vi.advanceTimersByTime(16);
		container.scrollTop = 15;
		container.dispatchEvent(new Event('scroll'));
		vi.advanceTimersByTime(16);
		container.scrollTop = 30;
		container.dispatchEvent(new Event('scroll'));
		dispatchPressEnd();

		// Still moving on release: snapping now would cancel the momentum.
		expect(onSnap).not.toHaveBeenCalled();

		// Momentum scroll continues after the release, then settles.
		vi.advanceTimersByTime(30);
		container.scrollTop = 70;
		container.dispatchEvent(new Event('scroll'));
		vi.advanceTimersByTime(120);

		expect(onSnap).toHaveBeenCalledTimes(1);
		expect(onSnap).toHaveBeenCalledWith(getExpectedCenteredIndex(container));
	});

	it('falls back to the inactivity snap when the expected momentum never arrives', () => {
		useFakeTimersWithPerformance();
		const { container } = createWheelFixture();
		const onSnap = vi.fn();
		useWheelScroll(container, onSnap);

		dispatchPressStart(container);
		vi.advanceTimersByTime(16);
		container.scrollTop = 30;
		container.dispatchEvent(new Event('scroll'));
		dispatchPressEnd();

		expect(onSnap).not.toHaveBeenCalled();

		vi.advanceTimersByTime(120);

		expect(onSnap).toHaveBeenCalledTimes(1);
		expect(onSnap).toHaveBeenCalledWith(1);
	});

	it('scrolls instantly to centered target when behavior is instant', () => {
		const { container } = createWheelFixture();
		const onSnap = vi.fn();
		const api = useWheelScroll(container, onSnap);
		const items = container.querySelectorAll<HTMLElement>('[data-wheel-item]');
		const target = items[2];
		const expectedTop = Math.max(
			0,
			target.offsetTop - (container.clientHeight - target.offsetHeight) / 2
		);

		api.scrollToIndex(2, 'instant');

		expect(container.scrollTop).toBe(expectedTop);
		expect(onSnap).not.toHaveBeenCalled();
	});

	it('removes listeners on destroy', () => {
		vi.useFakeTimers();
		const { container } = createWheelFixture();
		const onSnap = vi.fn();
		const api = useWheelScroll(container, onSnap);

		api.destroy();
		container.scrollTop = 30;
		container.dispatchEvent(new Event('scroll'));
		vi.advanceTimersByTime(200);

		expect(onSnap).not.toHaveBeenCalled();
	});

	it('supports direct child items when data-wheel-item is not present', () => {
		vi.useFakeTimers();
		const { container } = createWheelFixtureWithoutTaggedItems();
		const onSnap = vi.fn();
		const api = useWheelScroll(container, onSnap);

		api.scrollToIndex(2, 'instant');

		expect(container.scrollTop).toBe(50);
	});
});

describe('getPointerReleaseVelocity', () => {
	it('returns 0 without samples', () => {
		expect(getPointerReleaseVelocity([], 100)).toBe(0);
	});

	it('returns 0 when the newest sample is older than the window (pause before release)', () => {
		const samples: WheelScrollSample[] = [
			{ time: 0, scrollTop: 0 },
			{ time: 50, scrollTop: 40 }
		];
		expect(getPointerReleaseVelocity(samples, 200, 100)).toBe(0);
	});

	it('computes displacement over elapsed time inside the window', () => {
		const samples: WheelScrollSample[] = [
			{ time: 0, scrollTop: 0 },
			{ time: 50, scrollTop: 10 },
			{ time: 100, scrollTop: 30 }
		];
		expect(getPointerReleaseVelocity(samples, 100, 100)).toBeCloseTo(0.3);
	});

	it('uses the sample just before the window as the baseline', () => {
		const samples: WheelScrollSample[] = [
			{ time: 0, scrollTop: 0 },
			{ time: 20, scrollTop: 10 },
			{ time: 150, scrollTop: 40 }
		];
		// Window covers only t=150; t=20 acts as the baseline.
		expect(getPointerReleaseVelocity(samples, 160, 100)).toBeCloseTo(30 / 130);
	});

	it('reports an infinite velocity when position moved with zero elapsed time', () => {
		const samples: WheelScrollSample[] = [
			{ time: 100, scrollTop: 0 },
			{ time: 100, scrollTop: 30 }
		];
		expect(getPointerReleaseVelocity(samples, 100, 100)).toBe(Number.POSITIVE_INFINITY);
	});

	it('reports negative velocity for upward scrolls', () => {
		const samples: WheelScrollSample[] = [
			{ time: 0, scrollTop: 60 },
			{ time: 80, scrollTop: 20 }
		];
		expect(getPointerReleaseVelocity(samples, 90, 100)).toBeCloseTo(-0.5);
	});

	it('returns 0 for a single recent sample with no movement baseline', () => {
		const samples: WheelScrollSample[] = [{ time: 100, scrollTop: 30 }];
		expect(getPointerReleaseVelocity(samples, 110, 100)).toBe(0);
	});
});
