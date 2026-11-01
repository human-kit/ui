import { flushSync, hydrate, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { commands } from 'vitest/browser';

import Fields from './typed-before-hydration-test.svelte';

const FIXTURE = 'src/lib/primitives/typed-before-hydration-test.svelte';

let target: HTMLElement | null = null;
let app: ReturnType<typeof hydrate> | null = null;

afterEach(() => {
	if (app) unmount(app);
	target?.remove();
	app = null;
	target = null;
});

/** The server's page, on screen before the script that owns it has run. */
async function serverPage() {
	target = document.createElement('div');
	target.innerHTML = await commands.renderOnServer(FIXTURE);
	document.body.append(target);
	return target;
}

function field(page: HTMLElement, label: string) {
	const element = page.querySelector(`[aria-label="${label}"]:is(input, textarea)`);
	if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
		throw new Error(`No field labelled ${label}`);
	}
	return element;
}

/** What a keystroke leaves before any script listens: only the element's own value. */
function typeBeforeHydration(element: HTMLInputElement | HTMLTextAreaElement, text: string) {
	element.value = text;
}

function readState(page: HTMLElement) {
	return JSON.parse(page.querySelector('[data-testid="state"]')?.textContent ?? '{}');
}

describe('typing before hydration', () => {
	it('keeps the typed text in every field and hands it to whoever owns the value', async () => {
		const page = await serverPage();

		typeBeforeHydration(field(page, 'Heard'), 'heard@example.com');
		typeBeforeHydration(field(page, 'Bound'), 'bound');
		typeBeforeHydration(field(page, 'Notes'), 'two\nlines');
		typeBeforeHydration(field(page, 'Query'), 'query');
		typeBeforeHydration(field(page, 'Amount'), '42');
		typeBeforeHydration(field(page, 'Fruit'), 'app');

		app = hydrate(Fields, { target: page });
		flushSync();

		await expect
			.poll(() => readState(page))
			.toMatchObject({
				heard: 'heard@example.com',
				bound: 'bound',
				notes: 'two\nlines',
				query: 'query',
				search: 'app'
			});
		expect(field(page, 'Heard').value).toBe('heard@example.com');
		expect(field(page, 'Bound').value).toBe('bound');
		expect(field(page, 'Notes').value).toBe('two\nlines');
		expect(field(page, 'Query').value).toBe('query');
		expect(field(page, 'Amount').value).toBe('42');
		expect(field(page, 'Fruit').value).toBe('app');
	});

	it('reaches a listener above the field, as a keystroke would', async () => {
		const page = await serverPage();

		typeBeforeHydration(field(page, 'Heard'), 'typed');

		app = hydrate(Fields, { target: page });
		flushSync();

		await expect.poll(() => readState(page).formHeard).toBe('heard');
	});

	it('changes nothing in a field nobody typed into', async () => {
		const page = await serverPage();

		app = hydrate(Fields, { target: page });
		flushSync();

		expect(readState(page)).toMatchObject({ heard: '', bound: '', notes: '', formHeard: '' });
		expect(field(page, 'Heard').value).toBe('');
	});

	it('still lets the owner write the value once hydrated', async () => {
		const page = await serverPage();

		typeBeforeHydration(field(page, 'Bound'), 'typed');
		app = hydrate(Fields, { target: page });
		flushSync();

		const bound = field(page, 'Bound');
		bound.value = 'typed after';
		bound.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();

		await expect.poll(() => readState(page).bound).toBe('typed after');
	});
});
