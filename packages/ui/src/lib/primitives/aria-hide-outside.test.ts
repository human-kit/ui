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
});
