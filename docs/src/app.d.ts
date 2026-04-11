declare module '*.svelte' {
	import type { Component } from 'svelte';
	const component: Component;
	export default component;
}

declare global {
	namespace App {
		interface Error {}
		interface Locals {}
		interface PageData {}
		interface Platform {}
	}
}

export {};
