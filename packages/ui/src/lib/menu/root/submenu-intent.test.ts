import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MenuContext } from './context';
import { createSubmenuIntent, SUBMENU_INTENT_STOP_MS } from './submenu-intent';

// An open submenu whose near (left) edge is at x = 200, from y = 0 to y = 200.
function openSubmenu(): MenuContext {
	const contentRef = {
		getBoundingClientRect: () => new DOMRect(200, 0, 150, 200)
	} as HTMLElement;
	return { contentRef } as MenuContext;
}

// A pointer at (100, 100) that moves right is on its way to the submenu.
const start = { x: 100, y: 100 };
const aimed = { x: 110, y: 100 };

function setup() {
	const intent = createSubmenuIntent(openSubmenu);
	const commit = vi.fn();
	intent.track(start.x, start.y);
	intent.request(aimed, commit, 'mouse');
	return { intent, commit };
}

describe('createSubmenuIntent', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('defers the highlight while the pointer aims at the submenu', () => {
		const { commit } = setup();
		expect(commit).not.toHaveBeenCalled();
	});

	it('commits as soon as the pointer stops, not after a long timeout', () => {
		const { commit } = setup();
		vi.advanceTimersByTime(SUBMENU_INTENT_STOP_MS - 1);
		expect(commit).not.toHaveBeenCalled();
		vi.advanceTimersByTime(1);
		expect(commit).toHaveBeenCalledTimes(1);
	});

	it('keeps deferring for as long as the pointer keeps moving toward the submenu', () => {
		const { intent, commit } = setup();
		// Two seconds of slow travel, one move per frame.
		for (let x = aimed.x + 1; x < aimed.x + 120; x += 1) {
			vi.advanceTimersByTime(16);
			intent.track(x, 100);
		}
		expect(commit).not.toHaveBeenCalled();
	});

	it('forgives one move outside the triangle', () => {
		const { intent, commit } = setup();
		intent.track(aimed.x - 1, 100); // a tremor back
		intent.track(aimed.x + 5, 100); // and on toward the submenu
		expect(commit).not.toHaveBeenCalled();
	});

	it('commits on the second move outside the triangle in a row', () => {
		const { intent, commit } = setup();
		intent.track(aimed.x - 5, 100);
		expect(commit).not.toHaveBeenCalled();
		intent.track(aimed.x - 10, 100);
		expect(commit).toHaveBeenCalledTimes(1);
	});

	it('does not let a forgiven miss extend the deferral', () => {
		const { intent, commit } = setup();
		vi.advanceTimersByTime(SUBMENU_INTENT_STOP_MS - 10);
		intent.track(aimed.x - 5, 100);
		vi.advanceTimersByTime(10);
		expect(commit).toHaveBeenCalledTimes(1);
	});

	it('does not commit after the pointer reaches the submenu', () => {
		const { intent, commit } = setup();
		intent.cancel();
		vi.advanceTimersByTime(1000);
		expect(commit).not.toHaveBeenCalled();
	});

	it.each(['touch', 'pen'])('highlights at once for %s input', (pointerType) => {
		const intent = createSubmenuIntent(openSubmenu);
		const commit = vi.fn();
		intent.track(start.x, start.y);
		intent.request(aimed, commit, pointerType);
		expect(commit).toHaveBeenCalledTimes(1);
	});

	it('highlights at once when the pointer moves away from the submenu', () => {
		const intent = createSubmenuIntent(openSubmenu);
		const commit = vi.fn();
		intent.track(start.x, start.y);
		intent.request({ x: 90, y: 100 }, commit, 'mouse');
		expect(commit).toHaveBeenCalledTimes(1);
	});
});
