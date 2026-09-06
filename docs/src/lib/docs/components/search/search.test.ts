import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import Search from './search.svelte';
import { createIndex } from '../../search/search-engine.js';
import type { SearchRecord } from '../../search/types.js';
import { navigations, resetNavigations } from '../../test-stubs/app-navigation.js';

const records: SearchRecord[] = [
	{
		id: 'button',
		slug: 'button',
		group: 'Form',
		page: 'Button',
		heading: 'Button',
		hash: '',
		kind: 'component',
		text: 'A headless native button with pending semantics.'
	},
	{
		id: 'button#anatomy',
		slug: 'button',
		group: 'Form',
		page: 'Button',
		heading: 'Anatomy',
		hash: 'anatomy',
		kind: 'section',
		text: 'The component has one part. The part makes a native button element.'
	},
	{
		id: 'drawer',
		slug: 'drawer',
		group: 'Overlays',
		page: 'Drawer',
		heading: 'Drawer',
		hash: '',
		kind: 'component',
		text: 'A panel that slides in from the edge of the screen.'
	}
];

const load = () => Promise.resolve(createIndex(records));

function searchBox() {
	return document.querySelector<HTMLElement>('[role="searchbox"]');
}

describe('Search', () => {
	beforeEach(() => {
		resetNavigations();
		document.body.focus();
	});

	it('opens on the platform shortcut', async () => {
		render(Search, { props: { load } });

		await userEvent.keyboard('{Control>}k{/Control}');

		await expect.poll(searchBox).not.toBeNull();
	});

	it('opens on a bare slash', async () => {
		render(Search, { props: { load } });

		await userEvent.keyboard('/');

		await expect.poll(searchBox).not.toBeNull();
	});

	it('leaves the slash alone while the reader is writing somewhere else', async () => {
		render(Search, { props: { load } });
		const field = document.createElement('input');
		document.body.append(field);
		field.focus();

		await userEvent.keyboard('/');

		expect(searchBox()).toBeNull();
		expect(field.value).toBe('/');
		field.remove();
	});

	it('files the results under a heading, and reads each one as a path', async () => {
		const screen = render(Search, { props: { load } });

		await userEvent.keyboard('{Control>}k{/Control}');
		await expect.poll(searchBox).not.toBeNull();
		await screen.getByRole('searchbox').fill('anatomy');

		await expect.poll(() => screen.getByText('Anatomy').query()).not.toBeNull();
		// The row is "Button > Anatomy" under the "Sections" heading.
		// The Autocomplete root is a group of its own, so this looks inside the list.
		const group = document.querySelector('[role="listbox"] [role="group"]');
		const labelId = group?.getAttribute('aria-labelledby');
		expect(document.getElementById(labelId ?? '')?.textContent?.trim()).toBe('Sections');
		await expect.poll(() => screen.getByText('Sections').query()).not.toBeNull();
		await expect.poll(() => screen.getByText('Button').query()).not.toBeNull();
		expect(screen.getByText('Drawer').query()).toBeNull();
	});

	it('sends the reader to the heading of the result they pick', async () => {
		const screen = render(Search, { props: { load } });

		await userEvent.keyboard('{Control>}k{/Control}');
		await expect.poll(searchBox).not.toBeNull();
		await screen.getByRole('searchbox').fill('anatomy');
		await expect.poll(() => screen.getByText('Anatomy').query()).not.toBeNull();

		await userEvent.keyboard('{Enter}');

		await expect.poll(() => navigations).toEqual(['/docs/button#anatomy']);
	});

	it('says so when nothing matches', async () => {
		const screen = render(Search, { props: { load } });

		await userEvent.keyboard('{Control>}k{/Control}');
		await expect.poll(searchBox).not.toBeNull();
		await screen.getByRole('searchbox').fill('zzzz');

		await expect.poll(() => screen.getByText(/No results for/).query()).not.toBeNull();
	});
});
