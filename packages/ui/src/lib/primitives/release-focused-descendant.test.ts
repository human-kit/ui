import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { releaseFocusedDescendant } from './release-focused-descendant';

describe('releaseFocusedDescendant', () => {
	let container: HTMLElement;
	let trigger: HTMLButtonElement;
	let inside: HTMLInputElement;
	let outside: HTMLButtonElement;

	beforeEach(() => {
		document.body.innerHTML = '';

		trigger = document.createElement('button');
		container = document.createElement('div');
		inside = document.createElement('input');
		outside = document.createElement('button');

		container.appendChild(inside);
		document.body.append(trigger, container, outside);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('blurs a focused descendant of the container', () => {
		inside.focus();
		expect(document.activeElement).toBe(inside);

		releaseFocusedDescendant(container, trigger);

		expect(document.activeElement).toBe(document.body);
	});

	it('leaves focus on the trigger untouched', () => {
		trigger.focus();
		expect(document.activeElement).toBe(trigger);

		releaseFocusedDescendant(container, trigger);

		expect(document.activeElement).toBe(trigger);
	});

	it('leaves focus already outside the container untouched', () => {
		outside.focus();
		expect(document.activeElement).toBe(outside);

		releaseFocusedDescendant(container, trigger);

		expect(document.activeElement).toBe(outside);
	});

	it('blurs a focused descendant even when no trigger is provided', () => {
		inside.focus();

		releaseFocusedDescendant(container, null);

		expect(document.activeElement).toBe(document.body);
	});

	it('is a no-op when the container is missing', () => {
		inside.focus();

		releaseFocusedDescendant(null, trigger);

		expect(document.activeElement).toBe(inside);
	});

	it('blurs the container itself when it holds focus', () => {
		container.tabIndex = -1;
		container.focus();
		expect(document.activeElement).toBe(container);

		releaseFocusedDescendant(container, trigger);

		expect(document.activeElement).toBe(document.body);
	});
});
