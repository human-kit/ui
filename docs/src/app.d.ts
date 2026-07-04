declare module '*.svelte' {
	import type { Component } from 'svelte';
	const component: Component;
	export default component;
}

declare module '*.md' {
	import type { Component } from 'svelte';
	export const metadata: { title: string; description?: string; category?: string };
	const component: Component;
	export default component;
}

declare module '*.svelte?highlight' {
	const source: { code: string; html: string };
	export default source;
}

/* eslint-disable @typescript-eslint/no-empty-object-type */
declare global {
	namespace App {
		interface Error {}
		interface Locals {}
		interface PageData {}
		interface Platform {}
	}
}
/* eslint-enable @typescript-eslint/no-empty-object-type */

export {};
