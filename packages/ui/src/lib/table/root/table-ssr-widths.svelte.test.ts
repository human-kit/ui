import { flushSync, hydrate, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { commands } from 'vitest/browser';

import TableWidths from './table-ssr-widths-test.svelte';

const FIXTURE = 'src/lib/table/root/table-ssr-widths-test.svelte';

let target: HTMLElement | null = null;
let app: ReturnType<typeof hydrate> | null = null;

afterEach(() => {
	if (app) unmount(app);
	target?.remove();
	app = null;
	target = null;
});

function columnWidths(page: HTMLElement) {
	const headers = page.querySelectorAll<HTMLElement>('th[data-column]');
	return Object.fromEntries(
		Array.from(headers, (header) => [
			header.dataset.column,
			Math.round(header.getBoundingClientRect().width)
		])
	);
}

function nextFrame() {
	return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

describe('Table.Root column widths across hydration', () => {
	it('draws on the server the widths the browser settles at', async () => {
		target = document.createElement('div');
		target.innerHTML = await commands.renderOnServer(FIXTURE);
		document.body.append(target);

		const served = columnWidths(target);
		// Wider than its box: the `%` and the flexible column sit at their minWidth.
		expect(served).toEqual({ name: 160, email: 180, role: 180, created: 200, actions: 32 });

		app = hydrate(TableWidths, { target });
		flushSync();
		await nextFrame();

		expect(columnWidths(target)).toEqual(served);
	});
});
