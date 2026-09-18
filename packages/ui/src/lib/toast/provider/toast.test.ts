import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import type { ToastManager } from '../index';
import ToastModalTest from './toast-modal-test.svelte';
import ToastSharedTest from './toast-shared-test.svelte';
import ToastTest from './toast-test.svelte';

function byTestId<T extends HTMLElement = HTMLElement>(id: string): T {
	const element = document.querySelector<T>(`[data-testid="${id}"]`);
	if (!element) throw new Error(`No element with data-testid="${id}"`);
	return element;
}

function toasts(): HTMLElement[] {
	return Array.from(document.querySelectorAll<HTMLElement>('[data-toast-root]'));
}

function region(): HTMLElement | null {
	return document.querySelector<HTMLElement>('[data-toast-viewport]');
}

/** The last message of the polite announcer. */
function polite(): string {
	return document.querySelector('[role="status"] > div:last-child')?.textContent?.trim() ?? '';
}

/** The last message of the assertive announcer. */
function assertive(): string {
	return document.querySelector('[role="alert"] > div:last-child')?.textContent?.trim() ?? '';
}

async function press(id: string) {
	byTestId(id).click();
	await tick();
}

async function advance(ms: number) {
	await vi.advanceTimersByTimeAsync(ms);
	await tick();
}

function pointer(target: Element, type: string, pointerType: 'mouse' | 'touch' = 'mouse') {
	target.dispatchEvent(
		new PointerEvent(type, {
			pointerType,
			pointerId: 1,
			bubbles: type !== 'pointerenter' && type !== 'pointerleave'
		})
	);
}

let manager: ToastManager | undefined;

function setup(props: Record<string, unknown> = {}) {
	return render(ToastTest, {
		...props,
		onManager: (value: ToastManager) => {
			manager = value;
		}
	});
}

function getManager(): ToastManager {
	if (!manager) throw new Error('The manager is not bound yet.');
	return manager;
}

describe('Toast', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
		// The full run puts each file in a frame the browser can report as hidden, and a hidden
		// page stops the timers. These tests are about a page the user looks at.
		Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
	});

	afterEach(() => {
		vi.useRealTimers();
		manager = undefined;
		Reflect.deleteProperty(document, 'visibilityState');
	});

	describe('region and announcement', () => {
		it('renders nothing but the announcers while there is no toast', () => {
			setup();

			expect(region()).toBeNull();
			expect(document.querySelector('[role="status"][aria-live="polite"]')).not.toBeNull();
			expect(document.querySelector('[role="alert"][aria-live="assertive"]')).not.toBeNull();
		});

		it('adds a dialog with its name and its description, and announces it politely', async () => {
			setup();

			await press('add');

			const [toast] = toasts();
			expect(region()?.getAttribute('role')).toBe('region');
			expect(region()?.getAttribute('aria-label')).toBe('1 notification');
			expect(region()?.getAttribute('tabindex')).toBe('-1');
			expect(toast.getAttribute('role')).toBe('dialog');
			expect(toast.getAttribute('aria-modal')).toBe('false');
			expect(toast.getAttribute('tabindex')).toBe('0');
			expect(toast.getAttribute('data-priority')).toBe('low');
			await expect.poll(() => toast.getAttribute('aria-labelledby')).toBe(byTestId('title').id);
			await expect
				.poll(() => toast.getAttribute('aria-describedby'))
				.toBe(byTestId('description').id);
			expect(byTestId('title').textContent?.trim()).toBe('Saved');
			expect(byTestId('description').textContent?.trim()).toBe('The file is on the server.');
			expect(polite()).toBe('Saved. The file is on the server.');
			expect(assertive()).toBe('');
		});

		it('makes a high priority toast an alertdialog, and announces it assertively', async () => {
			setup();

			await press('add-high');

			expect(toasts()[0].getAttribute('role')).toBe('alertdialog');
			expect(assertive()).toBe('Lost. The connection is gone.');
			expect(polite()).toBe('');
		});

		it('counts the toasts in the name of the region', async () => {
			setup();

			await press('add');
			await press('add');

			expect(region()?.getAttribute('aria-label')).toBe('2 notifications');
			expect(toasts()[0].getAttribute('data-front')).toBe('true');
			expect(toasts()[1].hasAttribute('data-front')).toBe(false);
			expect(toasts()[0].style.getPropertyValue('--toast-index')).toBe('0');
			expect(toasts()[1].style.getPropertyValue('--toast-index')).toBe('1');
		});

		it('does not read the buttons as part of the message', async () => {
			setup({ withAction: true });

			await press('add');

			expect(polite()).toBe('Saved. The file is on the server.');
			expect(byTestId('content').contains(byTestId('close'))).toBe(false);
		});
	});

	describe('timers', () => {
		it('closes on its own after the timeout, and leaves the DOM', async () => {
			setup({ timeout: 1000 });

			await press('add');
			await advance(900);
			expect(toasts()).toHaveLength(1);

			await advance(100);
			expect(toasts()[0]?.getAttribute('data-ending') ?? 'gone').toMatch(/true|gone/);
			await expect.poll(() => toasts().length).toBe(0);
			expect(region()).toBeNull();
		});

		it('stops the timer while the pointer rests on the region', async () => {
			setup({ timeout: 1000 });

			await press('add');
			await advance(500);
			pointer(region()!, 'pointerenter');
			await advance(2000);
			expect(toasts()).toHaveLength(1);
			expect(region()?.getAttribute('data-expanded')).toBe('true');

			pointer(region()!, 'pointerleave');
			await advance(400);
			expect(toasts()).toHaveLength(1);
			await advance(100);
			await expect.poll(() => toasts().length).toBe(0);
		});

		it('stops the timer while the keyboard focus is in the region', async () => {
			setup({ timeout: 1000 });

			await press('add');
			byTestId('before').focus();
			await userEvent.keyboard('{F6}');
			await tick();
			expect(document.activeElement).toBe(toasts()[0]);

			await advance(3000);
			expect(toasts()).toHaveLength(1);
			expect(region()?.getAttribute('data-expanded')).toBe('true');

			await userEvent.keyboard('{F6}');
			await tick();
			expect(document.activeElement).toBe(byTestId('before'));
			await advance(1000);
			await expect.poll(() => toasts().length).toBe(0);
		});

		it('keeps a toast with timeout 0, and a loading toast', async () => {
			setup({ timeout: 1000 });
			await tick();

			getManager().add({ title: 'Forever', timeout: 0 });
			getManager().add({ title: 'Working', type: 'loading' });
			await advance(5000);

			expect(toasts()).toHaveLength(2);
		});

		it('gives a toast its full time again on an update', async () => {
			setup({ timeout: 1000 });
			await tick();

			const id = getManager().add({ title: 'One' });
			await advance(800);
			getManager().update(id, { title: 'Two' });
			await tick();
			expect(byTestId('title').textContent?.trim()).toBe('Two');
			expect(polite()).toBe('Two');

			await advance(800);
			expect(toasts()).toHaveLength(1);
			await advance(200);
			await expect.poll(() => toasts().length).toBe(0);
		});

		it('turns a promise into loading, then success', async () => {
			setup({ timeout: 1000 });
			await tick();

			let resolve!: (value: string) => void;
			const task = new Promise<string>((done) => (resolve = done));
			const result = getManager().promise(task, {
				loading: 'Uploading',
				success: (name) => `${name} is up`,
				error: 'Failed'
			});
			await tick();
			expect(toasts()[0].getAttribute('data-type')).toBe('loading');
			expect(byTestId('description').textContent?.trim()).toBe('Uploading');
			await advance(3000);
			expect(toasts()).toHaveLength(1);

			resolve('photo.png');
			await result;
			await tick();
			expect(toasts()[0].getAttribute('data-type')).toBe('success');
			expect(byTestId('description').textContent?.trim()).toBe('photo.png is up');
			await advance(1000);
			await expect.poll(() => toasts().length).toBe(0);
		});

		it('closes all toasts at once', async () => {
			setup();
			await tick();

			getManager().add({ title: 'A' });
			getManager().add({ title: 'B' });
			await tick();
			getManager().close();
			await expect.poll(() => toasts().length).toBe(0);
		});
	});

	describe('manager', () => {
		it('reaches a component under the provider, and a second provider shares it', async () => {
			render(ToastSharedTest);
			await tick();
			const buttons = document.querySelectorAll<HTMLButtonElement>(
				'[data-testid="add-from-child"]'
			);
			expect(buttons).toHaveLength(2);

			buttons[1].click();
			await tick();

			expect(toasts()).toHaveLength(1);
			const counts = Array.from(document.querySelectorAll('[data-testid="count"]')).map(
				(node) => node.textContent
			);
			expect(counts).toEqual(['1', '1']);
		});

		it('renders the viewport at the end of the body by default', async () => {
			setup({ portal: true });
			await press('add');

			expect(region()?.parentElement?.parentElement).toBe(document.body);
			expect(document.body.lastElementChild?.contains(region())).toBe(true);
		});

		it('stops the timers while the window is in the background', async () => {
			setup({ timeout: 1000 });
			await press('add');
			await advance(500);

			window.dispatchEvent(new Event('blur'));
			await advance(3000);
			expect(toasts()).toHaveLength(1);

			window.dispatchEvent(new Event('focus'));
			await advance(500);
			await expect.poll(() => toasts().length).toBe(0);
		});

		it('stops the timers while the tab is hidden', async () => {
			setup({ timeout: 1000 });
			await press('add');
			await advance(500);

			Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
			document.dispatchEvent(new Event('visibilitychange'));
			await advance(3000);
			expect(toasts()).toHaveLength(1);

			Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
			document.dispatchEvent(new Event('visibilitychange'));
			await advance(500);
			await expect.poll(() => toasts().length).toBe(0);
		});

		it('does not stop the timers for a touch on the region', async () => {
			setup({ timeout: 1000 });
			await press('add');

			pointer(region()!, 'pointerenter', 'touch');
			await advance(1000);
			await expect.poll(() => toasts().length).toBe(0);
		});
	});

	describe('behind a modal', () => {
		it('stays reachable while a modal dialog is open', async () => {
			render(ToastModalTest);
			await tick();
			await expect.poll(() => byTestId('dialog').getAttribute('aria-modal')).toBe('true');
			await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));

			byTestId('add').click();
			await tick();
			await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));

			const viewport = region();
			expect(viewport).not.toBeNull();
			expect(viewport?.closest('[aria-hidden="true"]')).toBeNull();
			expect(viewport?.closest('[inert]')).toBeNull();
			expect(byTestId('add').closest('[aria-hidden="true"]')).not.toBeNull();
		});

		it('F6 reaches the toast from the modal, and F6 goes back to it', async () => {
			render(ToastModalTest);
			await tick();
			await expect.poll(() => byTestId('dialog').getAttribute('aria-modal')).toBe('true');
			await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
			byTestId('add').click();
			await tick();
			const dismiss = byTestId('dialog').querySelector<HTMLButtonElement>('[data-dialog-close]');
			dismiss?.focus();
			expect(document.activeElement).toBe(dismiss);

			await userEvent.keyboard('{F6}');
			await tick();
			await new Promise((done) => requestAnimationFrame(done));
			expect(document.activeElement?.hasAttribute('data-toast-root')).toBe(true);

			await userEvent.keyboard('{Tab}');
			await tick();
			expect(document.activeElement).toBe(byTestId('close'));

			await userEvent.keyboard('{F6}');
			await tick();
			expect(document.activeElement).toBe(dismiss);
		});
	});

	describe('announcements', () => {
		it('reads two toasts of the same tick, and the same text twice', async () => {
			setup();
			await tick();

			getManager().add({ title: 'Same' });
			getManager().add({ title: 'Same' });
			await tick();

			const nodes = document.querySelectorAll('[role="status"] > div');
			expect(Array.from(nodes).map((node) => node.textContent)).toEqual(['Same', 'Same']);

			await advance(2100);
			expect(document.querySelectorAll('[role="status"] > div')).toHaveLength(0);
		});

		it('names a toast without a title by its description', async () => {
			setup();
			await tick();

			getManager().add({ description: 'Only a message' });
			await tick();
			const toast = toasts()[0];

			await expect
				.poll(() => toast.getAttribute('aria-labelledby'))
				.toBe(byTestId('description').id);
			expect(toast.hasAttribute('aria-describedby')).toBe(false);
		});

		it('does not count a toast on its way out in the name of the region', async () => {
			setup({ timeout: 0 });
			await tick();

			const id = getManager().add({ title: 'A' });
			getManager().add({ title: 'B' });
			await tick();
			expect(region()?.getAttribute('aria-label')).toBe('2 notifications');

			getManager().close(id);
			await tick();
			expect(region()?.getAttribute('aria-label')).toBe('1 notification');
		});

		it('moves the focus on when the page closes the focused toast', async () => {
			setup();
			await tick();

			const first = getManager().add({ title: 'A' });
			getManager().add({ title: 'B' });
			await tick();
			byTestId('before').focus();
			await userEvent.keyboard('{F6}');
			await tick();
			// The newest is first: F6 lands on B. Focus A, then close it from the page.
			const a = byTestId(`toast-${first}`);
			a.focus();
			expect(document.activeElement).toBe(a);

			getManager().close(first);
			await tick();
			expect(document.activeElement?.getAttribute('data-toast-id')).not.toBe(first);
			expect(document.activeElement?.hasAttribute('data-toast-root')).toBe(true);
		});
	});

	describe('keyboard', () => {
		it('F6 lands on the first toast, Escape closes it and the focus goes back', async () => {
			setup();

			await press('add');
			byTestId('before').focus();
			await userEvent.keyboard('{F6}');
			await tick();
			expect(document.activeElement).toBe(toasts()[0]);

			await userEvent.keyboard('{Escape}');
			await tick();
			expect(toasts()[0]?.getAttribute('data-ending') ?? 'gone').toMatch(/true|gone/);
			expect(document.activeElement).toBe(byTestId('before'));
		});

		it('moves the focus to the next toast when the focused one closes', async () => {
			setup();

			await press('add');
			await press('add');
			byTestId('before').focus();
			await userEvent.keyboard('{F6}');
			await tick();
			const [first, second] = toasts();
			expect(document.activeElement).toBe(first);

			await userEvent.keyboard('{Escape}');
			await tick();
			expect(document.activeElement).toBe(second);
		});

		it('Tab past the last button goes back to where the focus was', async () => {
			setup();

			await press('add');
			byTestId('before').focus();
			await userEvent.keyboard('{F6}');
			await userEvent.keyboard('{Tab}');
			await tick();
			expect(document.activeElement).toBe(byTestId('close'));

			await userEvent.keyboard('{Tab}');
			await tick();
			expect(document.activeElement).toBe(byTestId('before'));
		});
	});

	describe('buttons', () => {
		it('the close button closes the toast', async () => {
			setup();

			await press('add');
			await press('close');

			expect(toasts()[0]?.getAttribute('data-ending') ?? 'gone').toMatch(/true|gone/);
			await expect.poll(() => toasts().length).toBe(0);
		});

		it('the action closes the toast, unless keepOpen', async () => {
			setup({ withAction: true, keepOpen: true });

			await press('add');
			await press('action');
			expect(toasts()).toHaveLength(1);
			expect(toasts()[0].hasAttribute('data-ending')).toBe(false);
		});
	});

	describe('limit', () => {
		it('keeps the newest toasts on the screen, and the older ones inert behind', async () => {
			setup({ limit: 2, timeout: 1000 });

			await press('add');
			await press('add');
			await press('add');

			const all = toasts();
			expect(all).toHaveLength(3);
			expect(all[2].hasAttribute('inert')).toBe(true);
			expect(all[2].getAttribute('data-limited')).toBe('true');
			expect(region()?.getAttribute('aria-label')).toBe('2 notifications');

			// The limited toast keeps its full time: its timer starts when it comes forward.
			await advance(1000);
			await expect
				.poll(() => toasts().filter((t) => !t.hasAttribute('data-ending')).length)
				.toBe(1);
			const [left] = toasts().filter((t) => !t.hasAttribute('data-ending'));
			expect(left.hasAttribute('inert')).toBe(false);
			await advance(900);
			expect(left.hasAttribute('data-ending')).toBe(false);
			await advance(100);
			await expect.poll(() => toasts().length).toBe(0);
		});
	});

	describe('positioner', () => {
		it('puts an anchored toast against its anchor, and keeps it out of the stack', async () => {
			setup({ withPositioner: true });

			await press('add');
			await press('add-anchored');
			await tick();

			const anchored = toasts().find((toast) => toast.hasAttribute('data-anchored'));
			const stacked = toasts().find((toast) => !toast.hasAttribute('data-anchored'));
			expect(anchored).toBeDefined();
			expect(stacked?.getAttribute('data-front')).toBe('true');
			expect(stacked?.style.getPropertyValue('--toast-index')).toBe('0');
			expect(anchored?.style.getPropertyValue('--toast-index')).toBe('0');

			const positioner = anchored?.parentElement as HTMLElement;
			expect(positioner.getAttribute('data-toast-positioner')).toBe('true');
			expect(positioner.getAttribute('data-anchored')).toBe('true');
			expect(positioner.style.position).toBe('fixed');
			await expect.poll(() => positioner.getAttribute('data-placement')).toBe('bottom');
			const anchorRect = byTestId('add-anchored').getBoundingClientRect();
			await expect
				.poll(() => Math.round(positioner.getBoundingClientRect().top))
				.toBe(Math.round(anchorRect.bottom + 4));

			// The plain wrapper of a stacked toast stays out of the layout.
			const plain = stacked?.parentElement as HTMLElement;
			expect(plain.getAttribute('data-toast-positioner')).toBe('true');
			expect(plain.hasAttribute('data-anchored')).toBe(false);
			expect(plain.style.display).toBe('contents');
		});
	});

	describe('swipe', () => {
		it('follows the finger, and dismisses past the threshold', async () => {
			setup({ swipeDirection: ['right'] });

			await press('add');
			const toast = toasts()[0];
			const rect = toast.getBoundingClientRect();
			const at = (x: number, type: string) =>
				toast.dispatchEvent(
					new PointerEvent(type, {
						pointerType: 'touch',
						pointerId: 7,
						isPrimary: true,
						button: 0,
						clientX: rect.left + 20 + x,
						clientY: rect.top + 10,
						bubbles: true,
						cancelable: true
					})
				);

			at(0, 'pointerdown');
			window.dispatchEvent(
				new PointerEvent('pointermove', {
					pointerType: 'touch',
					pointerId: 7,
					clientX: rect.left + 40,
					clientY: rect.top + 10,
					bubbles: true,
					cancelable: true
				})
			);
			await tick();
			expect(toast.getAttribute('data-swiping')).toBe('true');
			expect(toast.getAttribute('data-swipe-direction')).toBe('right');
			expect(toast.style.getPropertyValue('--toast-swipe-movement-x')).toBe('20px');

			window.dispatchEvent(
				new PointerEvent('pointermove', {
					pointerType: 'touch',
					pointerId: 7,
					clientX: rect.left + 80,
					clientY: rect.top + 10,
					bubbles: true,
					cancelable: true
				})
			);
			window.dispatchEvent(
				new PointerEvent('pointerup', {
					pointerType: 'touch',
					pointerId: 7,
					clientX: rect.left + 80,
					clientY: rect.top + 10,
					bubbles: true
				})
			);
			await tick();
			expect(toast.getAttribute('data-swipe-dismissed')).toBe('true');
			await expect.poll(() => toasts().length).toBe(0);
		});

		it('comes back after a short swipe', async () => {
			setup({ swipeDirection: ['right'] });

			await press('add');
			const toast = toasts()[0];
			const rect = toast.getBoundingClientRect();
			const move = (x: number, type: string, target: EventTarget = window) =>
				target.dispatchEvent(
					new PointerEvent(type, {
						pointerType: 'touch',
						pointerId: 7,
						isPrimary: true,
						button: 0,
						clientX: rect.left + 20 + x,
						clientY: rect.top + 10,
						bubbles: true,
						cancelable: true
					})
				);

			move(0, 'pointerdown', toast);
			move(20, 'pointermove');
			await tick();
			expect(toast.style.getPropertyValue('--toast-swipe-movement-x')).toBe('20px');
			// A finger that stops before it lifts: the release has no speed. Frames, not timers,
			// because the timers are fake and the velocity reads the real clock.
			for (let frame = 0; frame < 12; frame += 1) {
				await new Promise((done) => requestAnimationFrame(done));
			}
			move(20, 'pointerup');
			await tick();
			expect(toast.style.getPropertyValue('--toast-swipe-movement-x')).toBe('0px');
			expect(toast.hasAttribute('data-swiping')).toBe(false);
			expect(toast.hasAttribute('data-ending')).toBe(false);
		});
	});
});
