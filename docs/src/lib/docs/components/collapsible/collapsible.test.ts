import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import Harness from './collapsible-harness.svelte';

function panel(): HTMLElement {
	const el = [...document.querySelectorAll<HTMLElement>('*')].find(
		(e) => typeof e.className === 'string' && e.className.includes('--collapsible-panel-height')
	);
	if (!el) throw new Error('no panel element');
	return el;
}

describe('Collapsible (docs wrapper)', () => {
	it('bakes the shared animation into the panel and merges caller classes', () => {
		render(Harness);
		const cls = panel().className;
		// The shared open/close animation from the recipe…
		expect(cls).toContain('transition-[height,opacity]');
		expect(cls).toContain('data-starting-style:h-0');
		// …plus the caller's own class, merged.
		expect(cls).toContain('extra-class');
	});

	it('reveals the panel content only after the trigger is clicked', async () => {
		render(Harness);
		const visible = () => document.querySelector<HTMLElement>('[data-testid="content"]')?.checkVisibility() ?? false;
		expect(visible()).toBe(false);

		const trigger = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Toggle'))!;
		await userEvent.click(trigger);
		await expect.poll(visible).toBe(true);
	});
});
