import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CodeText from './code-text.svelte';

describe('CodeText', () => {
	it('shows the parts between backticks as code, without the backticks', () => {
		render(CodeText, { text: 'It makes one `<path>` per series, and `data-mark`.' });
		expect(document.body.textContent?.trim()).toBe(
			'It makes one <path> per series, and data-mark.'
		);
		expect([...document.querySelectorAll('code')].map((c) => c.textContent)).toEqual([
			'<path>',
			'data-mark'
		]);
	});

	it('keeps a backtick without a pair as text', () => {
		render(CodeText, { text: 'A `b` and a ` alone.' });
		expect(document.body.textContent?.trim()).toBe('A b and a ` alone.');
		expect(document.querySelectorAll('code')).toHaveLength(1);
	});
});
