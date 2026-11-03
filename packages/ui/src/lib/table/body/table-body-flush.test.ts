import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { insideEffect } from './effect-tracking.svelte';
import TableBodyItemsTest from './table-body-items-test.svelte';

const flushedInsideEffect = vi.hoisted(() => ({ count: 0 }));

// Svelte forbids `flushSync` inside an effect (`flush_sync_in_effect`): outside async mode it
// doesn't throw, it flushes the batch the effect belongs to, and every effect after it in the
// same pass runs without one — the next that invalidates itself crashes reading `schedule` of
// null. The body measured its scroll container that way when it mounted.
vi.mock('svelte', async (importOriginal) => {
	const svelte = await importOriginal<typeof import('svelte')>();
	return {
		...svelte,
		flushSync: <T>(fn?: () => T) => {
			if (insideEffect()) flushedInsideEffect.count += 1;
			return svelte.flushSync(fn);
		}
	};
});

describe('Table.Body measuring its scroll container', () => {
	it('never flushes from inside an effect', async () => {
		render(TableBodyItemsTest);

		await expect
			.poll(() => Boolean(document.querySelector('tbody [data-item-id="row-001"]')))
			.toBe(true);
		const container = document.querySelector<HTMLElement>('[style*="max-height"]');
		container?.scrollTo({ top: 1200 });
		await expect
			.poll(() => Boolean(document.querySelector('tbody [data-item-id="row-040"]')))
			.toBe(true);
		expect(flushedInsideEffect.count).toBe(0);
	});
});
