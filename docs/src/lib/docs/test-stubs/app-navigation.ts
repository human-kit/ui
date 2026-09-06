// Test stub for `$app/navigation`. SvelteKit's router is not running under
// vitest, so `goto` only records where the component tried to send the reader.
export const navigations: string[] = [];

export function goto(url: string): Promise<void> {
	navigations.push(url);
	return Promise.resolve();
}

export function resetNavigations(): void {
	navigations.length = 0;
}
