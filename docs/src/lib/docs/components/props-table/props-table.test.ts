import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import PropsTable from './props-table.svelte';
import type { ApiProp } from '../../api-types.js';

const PROPS: ApiProp[] = [
	{ name: 'value', type: 'string | null', required: true, default: 'null', description: 'The current value.' },
	{ name: 'disabled', type: 'boolean', required: false, default: 'false', description: 'Whether it is disabled.' }
];

function rowTrigger(name: string): HTMLElement {
	const el = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim().startsWith(name));
	if (!el) throw new Error(`no row trigger for ${name}`);
	return el;
}

describe('PropsTable', () => {
	it('renders a row per prop with a required marker', () => {
		render(PropsTable, { props: { part: 'root', props: PROPS } });
		// The required prop shows the `*` marker; the optional one does not.
		expect(rowTrigger('value').textContent).toContain('value*');
		expect(rowTrigger('disabled').textContent).not.toContain('disabled*');
	});

	it('colors primitive type tokens', () => {
		render(PropsTable, { props: { part: 'root', props: PROPS } });
		// `boolean` is a TS primitive → the token span gets the primitive hue class.
		const colored = [...document.querySelectorAll('span')].some(
			(s) => s.textContent === 'boolean' && s.className.includes('text-blue')
		);
		expect(colored).toBe(true);
	});

	it('reveals the description only after expanding the row', async () => {
		render(PropsTable, { props: { part: 'root', props: PROPS } });
		// The panel content mounts on open, so the description isn't visible collapsed.
		const descVisible = () =>
			[...document.querySelectorAll('dd')].some(
				(d) => d.textContent?.includes('The current value.') && d.checkVisibility()
			);
		expect(descVisible()).toBe(false);

		await userEvent.click(rowTrigger('value'));
		await expect.poll(descVisible).toBe(true);
	});
});
