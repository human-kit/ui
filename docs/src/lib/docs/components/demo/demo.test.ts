import { describe, expect, it } from 'vitest';
import { createRawSnippet } from 'svelte';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import Demo from './demo.svelte';

const source = { code: 'const answer = 42;', html: '<pre class="shiki">const answer = 42;</pre>' };
const children = createRawSnippet(() => ({
	render: () => `<span data-testid="preview">PREVIEW</span>`
}));

function codeTrigger(): HTMLElement {
	const el = [...document.querySelectorAll('button')].find((b) => /Show code|Hide code/.test(b.textContent ?? ''));
	if (!el) throw new Error('no code trigger');
	return el;
}

describe('Demo', () => {
	it('renders the preview slot and a copy button', () => {
		render(Demo, { props: { source, children } });
		expect(document.querySelector('[data-testid="preview"]')?.textContent).toBe('PREVIEW');
		expect(document.querySelector('button[aria-label="Copy source code"]')).toBeTruthy();
	});

	it('toggles the source panel label when the code trigger is clicked', async () => {
		render(Demo, { props: { source, children } });
		expect(codeTrigger().textContent).toContain('Show code');
		await userEvent.click(codeTrigger());
		await expect.poll(() => codeTrigger().textContent).toContain('Hide code');
	});
});
