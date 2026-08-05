// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import TransferListTest from './transfer-list-test.svelte';

describe('TransferList SSR', () => {
	it('renders both lists on the server without touching the DOM', () => {
		const { body } = render(TransferListTest, { props: { defaultValue: ['cherry'] } });

		expect(body).toContain('aria-label="Available"');
		expect(body).toContain('aria-label="Selected"');
		expect(body).toContain('Apple');
		expect(body).toContain('Cherry');
	});

	it('names a button whose destination list already rendered', () => {
		const { body } = render(TransferListTest);

		// Labels register at init rather than from an effect, so a button that follows its
		// destination in the markup is already named on the server.
		expect(body).toContain('aria-label="Move all to Available"');
	});

	it('leaves a button unnamed rather than half-named when its destination has not rendered yet', () => {
		const { body } = render(TransferListTest);

		// The target list comes after these buttons, so its name is not known yet. Falling
		// back to the button's own text beats shipping "Move selected to " and correcting it
		// on hydration.
		expect(body).not.toContain('aria-label="Move selected to "');
		expect(body).not.toContain('aria-label="Move all to "');
	});
});
