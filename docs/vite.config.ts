import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { demoHighlight } from '@human-kit/markdown/vite';
import path from 'path';

export default defineConfig(() => ({
	plugins: [demoHighlight(), tailwindcss(), sveltekit(), devtoolsJson()],
	resolve: {
		alias: {
			'@human-kit/ui': path.resolve(__dirname, '../packages/ui/src/lib')
		}
	}
}));
