import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { humandocs } from '@human-kit/humandocs/vite';
import path from 'path';

export default defineConfig(() => ({
	plugins: [humandocs(), tailwindcss(), sveltekit(), devtoolsJson()],
	resolve: {
		alias: {
			'@human-kit/ui': path.resolve(__dirname, '../packages/ui/src/lib')
		}
	}
}));
