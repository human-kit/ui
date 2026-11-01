// The commands `vitest.commands.ts` adds to browser tests, as `commands` from `vitest/browser`
// reads them.
declare module 'vitest/browser' {
	interface BrowserCommands {
		/** The server's markup of a component, by its path from the project root. */
		renderOnServer: (file: string, props?: Record<string, unknown>) => Promise<string>;
	}
}

export {};
