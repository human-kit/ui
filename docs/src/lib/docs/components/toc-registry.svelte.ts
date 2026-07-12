import { getContext, setContext } from 'svelte';

export interface RegisteredHeading {
	id: string;
	text: string;
	depth: number;
}

const KEY = Symbol('docs-toc-registry');

let nextKey = 0;

/**
 * Registry backing the "on this page" list for headings that components render at
 * runtime (e.g. `ApiReference`), which the markdown preprocessor cannot see.
 *
 * Why a plain `Map` + a reactive `version` counter (and NOT a reactive array):
 * across a client-side page swap the incoming page registers (from component
 * init) while the outgoing page unregisters (from an `$effect` teardown). Doing a
 * read-modify-write of a shared reactive collection there is unsafe — the
 * teardown runs in the destroyed component's scope and reads a STALE snapshot of
 * the collection, so a `filter`/`splice` drops the freshly-added entry and the
 * new page's headings vanish on alternating navigations. Here mutations are
 * key-addressed on a non-reactive `Map` (`set`/`delete`, never read-then-write),
 * and the only reactive value is an integer `version` bumped on every change.
 * Order of add vs. remove no longer matters, and there is no stale collection to
 * misread — the TOC just re-reads the fresh map whenever `version` changes.
 */
class TocRegistry {
	#map = new Map<number, RegisteredHeading[]>();
	// The single reactive signal: bumped on every change so readers recompute.
	version = $state(0);

	add(headings: RegisteredHeading[]): number {
		const key = nextKey++;
		this.#map.set(key, headings);
		this.version++;
		return key;
	}

	remove(key: number): void {
		if (this.#map.delete(key)) this.version++;
	}

	/** Deduplicated headings, read fresh from the map (call inside `$derived`). */
	read(): RegisteredHeading[] {
		// Touch the reactive signal so the caller re-runs when the map changes.
		void this.version;
		const seen = new Set<string>();
		const headings: RegisteredHeading[] = [];
		for (const group of this.#map.values()) {
			for (const heading of group) {
				if (seen.has(heading.id)) continue;
				seen.add(heading.id);
				headings.push(heading);
			}
		}
		return headings;
	}
}

/**
 * Provide the registry on the docs shell (a layout, so it survives client-side
 * navigation). During SSR the shell renders the content before the TOC aside, so
 * by the time the TOC reads the registry the content has already registered.
 */
export function provideTocRegistry(): void {
	setContext(KEY, new TocRegistry());
}

/**
 * Add headings to the registry. Returns an unregister function — call it when the
 * registering component is destroyed (e.g. from an `$effect` teardown) so
 * client-side navigation does not accumulate stale entries.
 */
export function registerHeadings(headings: RegisteredHeading[]): () => void {
	const registry = getContext<TocRegistry | undefined>(KEY);
	if (!registry || headings.length === 0) return () => {};
	const key = registry.add(headings);
	return () => registry.remove(key);
}

/**
 * The registered headings, deduplicated by id. Must be called during component
 * init (it reads context); the returned function reads reactive state, so call it
 * inside `$derived`/`$effect` to track updates.
 */
export function getRegisteredHeadings(): () => RegisteredHeading[] {
	const registry = getContext<TocRegistry | undefined>(KEY);
	return () => registry?.read() ?? [];
}
