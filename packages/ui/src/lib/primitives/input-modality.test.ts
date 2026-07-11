import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	focusWithModality,
	getInteractionModality,
	initInputModality,
	shouldShowFocusVisible,
	trackInteractionModality
} from './input-modality';

describe('input-modality primitive', () => {
	beforeEach(() => {
		const cleanupTarget = document.createElement('button');
		document.body.appendChild(cleanupTarget);
		focusWithModality(cleanupTarget, 'virtual');
		cleanupTarget.remove();
	});

	it('ignores modifier-only keys for keyboard modality', () => {
		const button = document.createElement('button');
		document.body.appendChild(button);

		trackInteractionModality(new MouseEvent('mousedown', { bubbles: true }), button);
		expect(getInteractionModality()).toBe('pointer');

		trackInteractionModality(new KeyboardEvent('keydown', { key: 'Shift', bubbles: true }), button);
		expect(getInteractionModality()).toBe('pointer');

		trackInteractionModality(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }), button);
		expect(getInteractionModality()).toBe('keyboard');

		button.remove();
	});

	it('applies atomic modality with focusWithModality for programmatic focus', () => {
		const button = document.createElement('button');
		document.body.appendChild(button);

		focusWithModality(button, 'pointer');
		expect(document.activeElement).toBe(button);
		expect(shouldShowFocusVisible(button)).toBe(false);

		focusWithModality(button, 'keyboard');
		expect(document.activeElement).toBe(button);
		expect(getInteractionModality()).toBe('keyboard');

		button.remove();
	});

	it('does not throw when target is null (SSR-safe call pattern)', () => {
		expect(() => shouldShowFocusVisible(null)).not.toThrow();
	});

	it('tracks modality transitions pointer -> keyboard -> pointer', () => {
		const button = document.createElement('button');
		document.body.appendChild(button);

		trackInteractionModality(new MouseEvent('mousedown', { bubbles: true }), button);
		expect(getInteractionModality()).toBe('pointer');

		trackInteractionModality(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }), button);
		expect(getInteractionModality()).toBe('keyboard');

		trackInteractionModality(new MouseEvent('mousedown', { bubbles: true }), button);
		expect(getInteractionModality()).toBe('pointer');

		button.remove();
	});

	it('keeps modality unchanged for ctrl/meta keyboard shortcuts', () => {
		const button = document.createElement('button');
		document.body.appendChild(button);

		trackInteractionModality(new MouseEvent('mousedown', { bubbles: true }), button);
		expect(getInteractionModality()).toBe('pointer');

		trackInteractionModality(
			new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, bubbles: true }),
			button
		);
		expect(getInteractionModality()).toBe('pointer');

		trackInteractionModality(
			new KeyboardEvent('keydown', { key: 'v', metaKey: true, bubbles: true }),
			button
		);
		expect(getInteractionModality()).toBe('pointer');

		button.remove();
	});

	it('treats synthetic click detail=0 as keyboard modality', () => {
		const button = document.createElement('button');
		document.body.appendChild(button);

		trackInteractionModality(new MouseEvent('mousedown', { bubbles: true }), button);
		expect(getInteractionModality()).toBe('pointer');

		trackInteractionModality(new MouseEvent('click', { bubbles: true, detail: 0 }), button);
		expect(getInteractionModality()).toBe('keyboard');

		button.remove();
	});

	it('supports virtual programmatic focus modality', () => {
		const button = document.createElement('button');
		document.body.appendChild(button);

		focusWithModality(button, 'virtual');
		expect(document.activeElement).toBe(button);
		expect(getInteractionModality()).toBe('virtual');

		button.remove();
	});

	it("classifies a focus move with no recent input as 'virtual' (screen-reader focus)", () => {
		vi.useFakeTimers();
		try {
			const button = document.createElement('button');
			document.body.appendChild(button);
			initInputModality(button);

			// Real keydown on the window: keyboard modality + fresh input timestamp.
			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
			expect(getInteractionModality()).toBe('keyboard');

			// A screen reader moving its virtual cursor produces a focus event with no
			// preceding keydown/pointerdown — simulate by letting the input go stale.
			vi.advanceTimersByTime(100);
			button.focus();

			expect(getInteractionModality()).toBe('virtual');

			button.remove();
		} finally {
			vi.useRealTimers();
		}
	});

	it('keeps the established modality when focus follows recent input', () => {
		const button = document.createElement('button');
		document.body.appendChild(button);
		initInputModality(button);

		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
		button.focus();

		expect(getInteractionModality()).toBe('keyboard');

		button.remove();
	});

	it('does not reclassify a programmatic focus that carries an explicit modality', () => {
		vi.useFakeTimers();
		try {
			const button = document.createElement('button');
			document.body.appendChild(button);
			initInputModality(button);

			// No recent input, but focusWithModality forces the modality for its target —
			// the synchronous focusin must not override it with 'virtual'.
			vi.advanceTimersByTime(100);
			focusWithModality(button, 'pointer');

			expect(getInteractionModality()).toBe('pointer');

			button.remove();
		} finally {
			vi.useRealTimers();
		}
	});

	it('passes focusVisible=false to native focus for pointer modality', () => {
		const button = document.createElement('button');
		document.body.appendChild(button);

		const focusSpy = vi.fn();
		Object.defineProperty(button, 'focus', {
			value: focusSpy,
			configurable: true
		});

		focusWithModality(button, 'pointer');

		expect(focusSpy).toHaveBeenCalledWith(expect.objectContaining({ focusVisible: false }));

		button.remove();
	});
});
