import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Header from './header.svelte';

describe('Header', () => {
	it('renders the title and badge', () => {
		render(Header, { props: { title: 'svelte-components', badge: 'beta' } });
		const text = document.body.textContent ?? '';
		expect(text).toContain('svelte-components');
		expect(text).toContain('beta');
	});

	it('renders a GitHub link to the given url and a theme toggle', () => {
		render(Header, { props: { title: 'Docs', githubUrl: 'https://github.com/acme/repo' } });
		const gh = document.querySelector('a[aria-label="GitHub repository"]');
		expect(gh?.getAttribute('href')).toBe('https://github.com/acme/repo');
		expect(gh?.getAttribute('target')).toBe('_blank');
		expect(document.querySelector('button[aria-label="Toggle color theme"]')).toBeTruthy();
	});

	it('omits the GitHub link when no url is given', () => {
		render(Header, { props: { title: 'Docs' } });
		expect(document.querySelector('a[aria-label="GitHub repository"]')).toBeNull();
	});
});
