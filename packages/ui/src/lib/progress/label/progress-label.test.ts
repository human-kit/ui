import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProgressLabelOrphanTest from './progress-label-orphan-test.svelte';

describe('Progress.Label', () => {
	it('rejects a label with no progress bar', () => {
		expect(() => render(ProgressLabelOrphanTest)).toThrowError(
			/Progress.Label must be used within Progress.Root/
		);
	});
});
