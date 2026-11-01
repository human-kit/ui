import type { BrowserCommand } from 'vitest/node';

type ServerRender = { body: string };

/**
 * Renders a component the way a server would, for a browser test that hydrates it.
 *
 * A browser test only has the client build of a component, and hydration needs the markup the
 * server build writes (its comments are how hydration finds its place). The project's own Vite
 * server compiles the file for SSR, and `svelte/server` is loaded through it too so both are
 * the same Svelte. The test then sets the body into the page and calls `hydrate`.
 */
export const renderOnServer: BrowserCommand<
	[file: string, props?: Record<string, unknown>]
> = async (context, file, props = {}) => {
	const vite = context.project.vite;
	const component = await vite.ssrLoadModule(file);
	const server = await vite.ssrLoadModule('svelte/server');
	const result: ServerRender = server.render(component.default, { props });

	return result.body;
};
