import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import type { Config } from '@sveltejs/kit';

const config: Config = {
  preprocess: vitePreprocess(),
  compilerOptions: {
    runes: true
  },
  kit: {}
};

export default config;
