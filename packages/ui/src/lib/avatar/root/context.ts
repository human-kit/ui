import { getContext, setContext } from 'svelte';

const KEY = Symbol('avatar');

/** `loading` until the image answers, then `loaded` or `error`. `error` without a `src` too. */
export type AvatarStatus = 'loading' | 'loaded' | 'error';

export type AvatarContext = {
	status: AvatarStatus;
	setStatus: (status: AvatarStatus) => void;
	/** The `alt` of the image, thus the fallback can take its name. `undefined` without an image. */
	alt: string | undefined;
	setAlt: (alt: string | undefined) => void;
};

export function setAvatarContext(context: AvatarContext) {
	setContext(KEY, context);
}

export function getAvatarContext(): AvatarContext | undefined {
	return getContext<AvatarContext | undefined>(KEY);
}

export function useAvatarContext(part = 'Avatar'): AvatarContext {
	const context = getAvatarContext();
	if (!context) {
		throw new Error(`${part} must be used within Avatar.Root.`);
	}
	return context;
}
