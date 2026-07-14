// Test stub for `$app/state`. Exposes a reactive `page` (as SvelteKit does) plus a
// `setPage` helper so a test can position the component on a given route before
// rendering. Reactive so components' `$derived(page.…)` recompute if a test
// mutates it mid-run.
interface PageStub {
	url: URL;
	params: Record<string, string>;
	data: Record<string, unknown>;
}

export const page: PageStub = $state({
	url: new URL('http://localhost/'),
	params: {},
	data: {}
});

export function setPage(next: {
	pathname?: string;
	params?: Record<string, string>;
	data?: Record<string, unknown>;
}) {
	if (next.pathname !== undefined) page.url = new URL(`http://localhost${next.pathname}`);
	if (next.params !== undefined) page.params = next.params;
	if (next.data !== undefined) page.data = next.data;
}
