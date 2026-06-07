import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';

import CollapseTransitionTest from './collapse-transition-test.svelte';

function panel() {
	return document.querySelector('[data-testid="panel"]');
}

function toggle() {
	return document.querySelector<HTMLButtonElement>('[data-testid="toggle"]')!;
}

describe('createCollapseTransition', () => {
	it('starts unmounted when closed and not kept mounted', () => {
		render(CollapseTransitionTest, { initialOpen: false, forceMount: false });
		expect(panel()?.getAttribute('data-mounted')).toBe('false');
	});

	it('stays mounted when closed but kept mounted', () => {
		render(CollapseTransitionTest, { initialOpen: false, forceMount: true });
		expect(panel()?.getAttribute('data-mounted')).toBe('true');
	});

	it('mounts immediately on open, then unmounts only after the exit animation finishes', async () => {
		render(CollapseTransitionTest, { initialOpen: false, forceMount: false });
		expect(panel()?.getAttribute('data-mounted')).toBe('false');

		// Open: content mounts right away so the enter transition has something to animate.
		await userEvent.click(toggle());
		expect(panel()?.getAttribute('data-mounted')).toBe('true');
		await expect.poll(() => panel()?.getAttribute('data-status')).toBe('idle');

		// Close: stays mounted and marked `ending` while it animates out...
		await userEvent.click(toggle());
		await expect.poll(() => panel()?.getAttribute('data-status')).toBe('ending');
		expect(panel()?.getAttribute('data-mounted')).toBe('true');

		// ...then unmounts once the animation completes.
		await expect.poll(() => panel()?.getAttribute('data-mounted')).toBe('false');
		expect(panel()?.getAttribute('data-status')).toBe('idle');
	});
});
