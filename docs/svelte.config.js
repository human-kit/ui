import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { humandocsMarkdown } from '@human-kit/markdown';
import { highlight } from '@human-kit/markdown/shiki';
import rehypeSlug from 'rehype-slug';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [
		vitePreprocess(),
		humandocsMarkdown({
			rehypePlugins: [rehypeSlug],
			highlight
		})
	],
	compilerOptions: {
		runes: true
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
