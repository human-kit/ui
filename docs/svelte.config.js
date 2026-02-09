import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: {
		runes: true
	},
	kit: {
		adapter: adapter({ runtime: 'nodejs22.x' }),
		alias: {
			'@human-kit/svelte-components/*': '../packages/svelte/src/lib/*',
			'@human-kit/svelte-components': '../packages/svelte/src/lib'
		}
	}
};

export default config;
