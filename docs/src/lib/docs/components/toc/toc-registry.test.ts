import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import Harness from './toc-registry-harness.svelte';

// Pages that share a heading id ("api-root") on purpose — the original bug was
// sensitive to id collisions and to the register/unregister ordering across a swap.
const PAGES = [
	{ id: 'button', headings: [{ id: 'api-root', text: 'Root', depth: 3 }] },
	{
		id: 'checkbox',
		headings: [
			{ id: 'api-root', text: 'Root', depth: 3 },
			{ id: 'api-indicator', text: 'Indicator', depth: 3 }
		]
	},
	{
		id: 'switch',
		headings: [
			{ id: 'api-root', text: 'Root', depth: 3 },
			{ id: 'api-thumb', text: 'Thumb', depth: 3 }
		]
	}
];

const EXPECTED: Record<string, string[]> = {
	button: ['Root'],
	checkbox: ['Root', 'Indicator'],
	switch: ['Root', 'Thumb']
};

function tocText(): string[] {
	return [...document.querySelectorAll('[data-testid="toc"] li')].map((li) => li.textContent ?? '');
}

describe('TOC registry', () => {
	it('shows the initial page headings', async () => {
		render(Harness, { pages: PAGES });
		await expect.poll(tocText).toEqual(['Root']);
	});

	it('reflects the current page after every client-side swap (no dropped headings)', async () => {
		render(Harness, { pages: PAGES });
		await expect.poll(tocText).toEqual(['Root']);

		// Alternating navigations were the failure mode: the old registry dropped the
		// incoming page's headings on every other swap. Each hop must match exactly.
		const route = ['checkbox', 'button', 'switch', 'checkbox', 'button', 'switch', 'checkbox'];
		for (const id of route) {
			await userEvent.click(await pickButton(id));
			await expect.poll(tocText, { timeout: 1000 }).toEqual(EXPECTED[id]);
		}
	});

	it("never leaves a previous page's unique heading behind", async () => {
		render(Harness, { pages: PAGES });
		await userEvent.click(await pickButton('checkbox'));
		await expect.poll(tocText).toEqual(['Root', 'Indicator']);
		// Switch has a Thumb, not an Indicator — the stale Indicator must be gone.
		await userEvent.click(await pickButton('switch'));
		await expect.poll(tocText).toEqual(['Root', 'Thumb']);
		expect(tocText()).not.toContain('Indicator');
	});
});

async function pickButton(id: string): Promise<HTMLElement> {
	const btn = [...document.querySelectorAll('button')].find((b) => b.textContent === `go-${id}`);
	if (!btn) throw new Error(`missing go-${id} button`);
	return btn;
}
