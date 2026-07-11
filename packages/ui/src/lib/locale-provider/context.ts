import { getContext, setContext } from 'svelte';
import type { Readable } from 'svelte/store';

const KEY = Symbol('locale-provider');

export type LocaleContext = {
	locale: Readable<string | undefined>;
};

export function setLocaleContext(context: LocaleContext) {
	setContext(KEY, context);
}

export function getLocaleContext(): LocaleContext | undefined {
	return getContext<LocaleContext | undefined>(KEY);
}

export function useLocaleContext(): LocaleContext {
	const context = getLocaleContext();
	if (!context) {
		throw new Error('LocaleProvider must wrap component tree when using useLocaleContext.');
	}
	return context;
}

/**
 * @deprecated Use {@link getLocaleContext} instead — it is the primary API and
 * behaves identically (returns the context or `undefined` when no
 * `LocaleProvider` is present). This alias is kept only for backwards
 * compatibility and will be removed in a future major version.
 */
export function useLocaleContextOptional(): LocaleContext | undefined {
	return getLocaleContext();
}
