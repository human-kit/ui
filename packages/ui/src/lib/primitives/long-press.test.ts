import { describe, it, expect } from 'vitest';
import {
	hasMovedBeyond,
	isLongPressPointer,
	longPress,
	LONG_PRESS_MOVE_TOLERANCE_PX,
	type LongPressPoint
} from './long-press';

describe('hasMovedBeyond', () => {
	const origin: LongPressPoint = { x: 100, y: 100 };

	it('tolerates a finger that only trembles', () => {
		expect(hasMovedBeyond(origin, { x: 104, y: 103 }, LONG_PRESS_MOVE_TOLERANCE_PX)).toBe(false);
	});

	it('measures the diagonal, not each axis on its own', () => {
		// 8px on each axis is under the tolerance per axis but 11.3px away.
		expect(hasMovedBeyond(origin, { x: 108, y: 108 }, LONG_PRESS_MOVE_TOLERANCE_PX)).toBe(true);
	});

	it('is exclusive at the tolerance itself', () => {
		expect(hasMovedBeyond(origin, { x: 110, y: 100 }, LONG_PRESS_MOVE_TOLERANCE_PX)).toBe(false);
	});
});

describe('isLongPressPointer', () => {
	function event(init: PointerEventInit) {
		return new PointerEvent('pointerdown', { isPrimary: true, button: 0, ...init });
	}

	it('accepts a primary touch or pen', () => {
		expect(isLongPressPointer(event({ pointerType: 'touch' }))).toBe(true);
		expect(isLongPressPointer(event({ pointerType: 'pen' }))).toBe(true);
	});

	it('ignores a mouse, which already has contextmenu', () => {
		expect(isLongPressPointer(event({ pointerType: 'mouse' }))).toBe(false);
	});

	it('ignores secondary buttons and secondary contacts', () => {
		expect(isLongPressPointer(event({ pointerType: 'touch', button: 2 }))).toBe(false);
		expect(isLongPressPointer(event({ pointerType: 'touch', isPrimary: false }))).toBe(false);
	});
});

describe('longPress action', () => {
	const DELAY = 30;
	const base = { bubbles: true, pointerId: 3, pointerType: 'touch', isPrimary: true, button: 0 };

	function setup(options: { enabled?: boolean } = {}) {
		const node = document.createElement('div');
		document.body.append(node);

		const fired: LongPressPoint[] = [];
		const action = longPress(node, {
			delay: DELAY,
			onLongPress: (point) => fired.push(point),
			...options
		});

		return {
			node,
			fired,
			down: (x = 40, y = 60) =>
				node.dispatchEvent(new PointerEvent('pointerdown', { ...base, clientX: x, clientY: y })),
			move: (x: number, y: number) =>
				window.dispatchEvent(new PointerEvent('pointermove', { ...base, clientX: x, clientY: y })),
			up: () => window.dispatchEvent(new PointerEvent('pointerup', { ...base })),
			cleanup: () => {
				action.destroy();
				node.remove();
			}
		};
	}

	/** Waits past the action's delay without depending on timer mocking. */
	const held = () => new Promise((resolve) => setTimeout(resolve, DELAY * 2));

	it('fires at the point the finger went down', async () => {
		const t = setup();
		t.down(40, 60);
		await held();
		expect(t.fired).toEqual([{ x: 40, y: 60 }]);
		t.cleanup();
	});

	it('does not fire while the press is still short', async () => {
		const t = setup();
		t.down();
		await new Promise((resolve) => setTimeout(resolve, DELAY / 3));
		expect(t.fired).toHaveLength(0);
		t.cleanup();
	});

	it('abandons the press once the finger travels — that is a scroll', async () => {
		const t = setup();
		t.down(40, 60);
		t.move(40, 100);
		await held();
		expect(t.fired).toHaveLength(0);
		t.cleanup();
	});

	it('keeps waiting through a tremble inside the tolerance', async () => {
		const t = setup();
		t.down(40, 60);
		t.move(43, 62);
		await held();
		expect(t.fired).toHaveLength(1);
		t.cleanup();
	});

	it('abandons the press when the finger lifts early', async () => {
		const t = setup();
		t.down();
		t.up();
		await held();
		expect(t.fired).toHaveLength(0);
		t.cleanup();
	});

	it('abandons the press when anything scrolls', async () => {
		const t = setup();
		t.down();
		window.dispatchEvent(new Event('scroll'));
		await held();
		expect(t.fired).toHaveLength(0);
		t.cleanup();
	});

	it('swallows the click the platform emits for the same gesture', async () => {
		const t = setup();
		let clicks = 0;
		t.node.addEventListener('click', () => (clicks += 1));

		t.down();
		await held();
		t.node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		expect(t.fired).toHaveLength(1);
		expect(clicks).toBe(0);
		t.cleanup();
	});

	it('stops swallowing once the gesture is over', async () => {
		const t = setup();
		let clicks = 0;
		t.node.addEventListener('click', () => (clicks += 1));

		t.down();
		await held();
		// The first synthetic event consumes the suppression.
		t.node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
		t.node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		expect(clicks).toBe(1);
		t.cleanup();
	});

	it('does nothing while disabled', async () => {
		const t = setup({ enabled: false });
		t.down();
		await held();
		expect(t.fired).toHaveLength(0);
		t.cleanup();
	});

	it('ignores a held mouse button', async () => {
		const t = setup();
		t.node.dispatchEvent(
			new PointerEvent('pointerdown', { ...base, pointerType: 'mouse', clientX: 1, clientY: 1 })
		);
		await held();
		expect(t.fired).toHaveLength(0);
		t.cleanup();
	});
});
