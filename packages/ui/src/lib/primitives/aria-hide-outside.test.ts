import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { hideOutside } from './aria-hide-outside';

describe('hideOutside', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('hides elements outside the target and restores them', () => {
		const target = document.createElement('div');
		const outside = document.createElement('div');
		document.body.appendChild(target);
		document.body.appendChild(outside);

		const { restore } = hideOutside([target]);

		expect(outside.getAttribute('aria-hidden')).toBe('true');
		expect(outside.hasAttribute('inert')).toBe(true);
		expect(target.hasAttribute('inert')).toBe(false);

		restore();

		expect(outside.hasAttribute('inert')).toBe(false);
		expect(outside.hasAttribute('aria-hidden')).toBe(false);
	});

	it('preserves pre-existing inert/aria-hidden values after restore', () => {
		const target = document.createElement('div');
		const outside = document.createElement('div');
		outside.setAttribute('inert', '');
		outside.setAttribute('aria-hidden', 'true');
		document.body.appendChild(target);
		document.body.appendChild(outside);

		const { restore } = hideOutside([target]);
		restore();

		expect(outside.hasAttribute('inert')).toBe(true);
		expect(outside.getAttribute('aria-hidden')).toBe('true');
	});

	it('supports overlapping hides and out-of-order restore', () => {
		const targetA = document.createElement('div');
		const outside = document.createElement('div');
		document.body.appendChild(targetA);
		document.body.appendChild(outside);

		const a = hideOutside([targetA]);

		// Simulate nested overlay mounted after the first one is already open.
		const targetB = document.createElement('div');
		document.body.appendChild(targetB);
		const b = hideOutside([targetB]);

		expect(targetA.getAttribute('aria-hidden')).toBe('true');
		expect(outside.getAttribute('aria-hidden')).toBe('true');

		// Restore first overlay while nested one is still active.
		a.restore();
		expect(targetA.getAttribute('aria-hidden')).toBe('true');
		expect(outside.getAttribute('aria-hidden')).toBe('true');

		// Final restore should bring everything back.
		b.restore();
		expect(targetA.hasAttribute('aria-hidden')).toBe(false);
		expect(targetA.hasAttribute('inert')).toBe(false);
		expect(outside.hasAttribute('aria-hidden')).toBe(false);
		expect(outside.hasAttribute('inert')).toBe(false);
	});

	it('restore is idempotent', () => {
		const target = document.createElement('div');
		const outside = document.createElement('div');
		document.body.appendChild(target);
		document.body.appendChild(outside);

		const { restore } = hideOutside([target]);

		restore();
		restore();

		expect(outside.hasAttribute('inert')).toBe(false);
		expect(outside.hasAttribute('aria-hidden')).toBe(false);
	});

	describe('live regions', () => {
		it('never hides live regions (aria-live / role=status / role=alert)', () => {
			const target = document.createElement('div');
			const liveRegion = document.createElement('div');
			liveRegion.setAttribute('aria-live', 'polite');
			const status = document.createElement('div');
			status.setAttribute('role', 'status');
			const alert = document.createElement('div');
			alert.setAttribute('role', 'alert');
			document.body.append(target, liveRegion, status, alert);

			const { restore } = hideOutside([target]);

			for (const region of [liveRegion, status, alert]) {
				expect(region.hasAttribute('aria-hidden')).toBe(false);
				expect(region.hasAttribute('inert')).toBe(false);
			}

			restore();
		});

		it('hides the siblings of a nested live region but not the region itself', () => {
			const target = document.createElement('div');
			const wrapper = document.createElement('div');
			const sibling = document.createElement('div');
			const liveRegion = document.createElement('div');
			liveRegion.setAttribute('aria-live', 'assertive');
			wrapper.append(sibling, liveRegion);
			document.body.append(target, wrapper);

			const { restore } = hideOutside([target]);

			// The wrapper is walked into (hiding it wholesale would silence the live region).
			expect(wrapper.hasAttribute('aria-hidden')).toBe(false);
			expect(sibling.getAttribute('aria-hidden')).toBe('true');
			expect(liveRegion.hasAttribute('aria-hidden')).toBe(false);

			restore();
			expect(sibling.hasAttribute('aria-hidden')).toBe(false);
		});
	});

	describe('content added while active (MutationObserver)', () => {
		async function flushMutations() {
			// MutationObserver callbacks run as microtasks; one macrotask hop is plenty.
			await new Promise((resolve) => setTimeout(resolve, 0));
		}

		it('hides elements appended to the body while active', async () => {
			const target = document.createElement('div');
			document.body.appendChild(target);
			const { restore } = hideOutside([target]);

			const lateSibling = document.createElement('div');
			document.body.appendChild(lateSibling);
			await flushMutations();

			expect(lateSibling.getAttribute('aria-hidden')).toBe('true');
			expect(lateSibling.hasAttribute('inert')).toBe(true);

			restore();
			expect(lateSibling.hasAttribute('aria-hidden')).toBe(false);
			expect(lateSibling.hasAttribute('inert')).toBe(false);
		});

		it('does not hide top-layer surfaces portalled while active', async () => {
			const target = document.createElement('div');
			document.body.appendChild(target);
			const { restore } = hideOutside([target]);

			const menu = document.createElement('div');
			menu.setAttribute('data-menu-content', 'true');
			const dialog = document.createElement('div');
			dialog.setAttribute('role', 'dialog');
			const optIn = document.createElement('div');
			optIn.setAttribute('data-top-layer', '');
			document.body.append(menu, dialog, optIn);
			await flushMutations();

			for (const surface of [menu, dialog, optIn]) {
				expect(surface.hasAttribute('aria-hidden')).toBe(false);
				expect(surface.hasAttribute('inert')).toBe(false);
			}

			restore();
		});

		it('recurses into an added wrapper so only its non-exempt children are hidden', async () => {
			const target = document.createElement('div');
			document.body.appendChild(target);
			const { restore } = hideOutside([target]);

			const wrapper = document.createElement('div');
			const plain = document.createElement('div');
			const popover = document.createElement('div');
			popover.setAttribute('role', 'dialog');
			wrapper.append(plain, popover);
			document.body.appendChild(wrapper);
			await flushMutations();

			expect(wrapper.hasAttribute('aria-hidden')).toBe(false);
			expect(plain.getAttribute('aria-hidden')).toBe('true');
			expect(popover.hasAttribute('aria-hidden')).toBe(false);

			restore();
			expect(plain.hasAttribute('aria-hidden')).toBe(false);
		});

		it('does not hide live regions added while active', async () => {
			const target = document.createElement('div');
			document.body.appendChild(target);
			const { restore } = hideOutside([target]);

			const toast = document.createElement('div');
			toast.setAttribute('role', 'alert');
			document.body.appendChild(toast);
			await flushMutations();

			expect(toast.hasAttribute('aria-hidden')).toBe(false);
			expect(toast.hasAttribute('inert')).toBe(false);

			restore();
		});

		it('leaves content added inside the target alone', async () => {
			const target = document.createElement('div');
			document.body.appendChild(target);
			const { restore } = hideOutside([target]);

			const inner = document.createElement('div');
			target.appendChild(inner);
			await flushMutations();

			expect(inner.hasAttribute('aria-hidden')).toBe(false);
			expect(inner.hasAttribute('inert')).toBe(false);

			restore();
		});

		it('stops observing after restore', async () => {
			const target = document.createElement('div');
			document.body.appendChild(target);
			const { restore } = hideOutside([target]);
			restore();

			const late = document.createElement('div');
			document.body.appendChild(late);
			await flushMutations();

			expect(late.hasAttribute('aria-hidden')).toBe(false);
			expect(late.hasAttribute('inert')).toBe(false);
		});
	});
});
