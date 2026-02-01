/**
 * Mock for $app/stores used in vitest tests
 */
import { readable, writable } from 'svelte/store';

export const page = readable({
	url: new URL('http://localhost'),
	params: {},
	route: { id: null },
	status: 200,
	error: null,
	data: {},
	form: null
});

export const navigating = readable(null);
export const updated = {
	subscribe: readable(false).subscribe,
	check: () => Promise.resolve(false)
};
