import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import rehypeSlug from 'rehype-slug';
import { highlight } from './src/lib/docs/highlighter.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.md'],
			highlight: { highlighter: highlight },
			rehypePlugins: [rehypeSlug]
			// No `layout` option: mdsvex layouts rely on `$$props`, which breaks
			// under `compilerOptions.runes: true`. The docs route provides the shell.
		})
	],
	compilerOptions: {
		runes: true
	},
	onwarn: (warning, handler) => {
		// mdsvex-generated output triggers warnings the content author cannot fix:
		// its module script still uses `context="module"`, and shiki emits
		// `tabindex="0"` on <pre> (correct a11y for scrollable regions).
		if (
			warning.filename?.endsWith('.md') &&
			(warning.code === 'script_context_deprecated' ||
				warning.code === 'a11y_no_noninteractive_tabindex')
		) {
			return;
		}
		handler(warning);
	},
	kit: {
		adapter: adapter({ runtime: 'nodejs22.x' }),
		alias: {
			'@human-kit/ui/*': '../packages/ui/src/lib/*',
			'@human-kit/ui': '../packages/ui/src/lib'
		}
	}
};

export default config;
