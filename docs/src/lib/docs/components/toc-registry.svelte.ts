import { getContext, setContext } from 'svelte';

export interface RegisteredHeading {
	id: string;
	text: string;
	depth: number;
}

interface Registration {
	key: number;
	headings: RegisteredHeading[];
}

const KEY = Symbol('docs-toc-registry');

let nextKey = 0;

/**
 * Shared, reactive list that lets components which render their own headings
 * (e.g. `ApiReference`) surface them to the table of contents.
 *
 * During SSR it works because the docs shell renders the main content before
 * the TOC aside: by the time `Toc` reads the registry, the content components
 * have already pushed into it. On the client the registry lives as long as the
 * shell (it is provided by a layout, which client-side navigation does not
 * remount), so registrations must be undone when the registering component is
 * destroyed — otherwise every visited page leaves its headings behind.
 */
export function provideTocRegistry(): void {
	const registrations = $state<Registration[]>([]);
	setContext(KEY, registrations);
}

/**
 * Add headings to the registry. Returns an unregister function — call it when
 * the registering component is destroyed (e.g. from an `$effect` teardown) so
 * client-side navigation does not accumulate stale entries.
 */
export function registerHeadings(headings: RegisteredHeading[]): () => void {
	const registrations = getContext<Registration[] | undefined>(KEY);
	if (!registrations || headings.length === 0) return () => {};
	const key = nextKey++;
	registrations.push({ key, headings });
	return () => {
		const index = registrations.findIndex((r) => r.key === key);
		if (index !== -1) registrations.splice(index, 1);
	};
}

/**
 * The registered headings, deduplicated by id. Must be called during component
 * init (it reads context); the returned function reads reactive state, so call
 * it inside `$derived`/`$effect` to track updates.
 */
export function getRegisteredHeadings(): () => RegisteredHeading[] {
	const registrations = getContext<Registration[] | undefined>(KEY);
	return () => {
		if (!registrations) return [];
		const seen = new Set<string>();
		const headings: RegisteredHeading[] = [];
		for (const registration of registrations) {
			for (const heading of registration.headings) {
				if (seen.has(heading.id)) continue;
				seen.add(heading.id);
				headings.push(heading);
			}
		}
		return headings;
	};
}
