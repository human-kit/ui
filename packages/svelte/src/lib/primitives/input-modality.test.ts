import { beforeEach, describe, expect, it } from 'vitest';
import {
	focusWithModality,
	getInteractionModality,
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
});
