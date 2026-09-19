import { getContext, setContext } from 'svelte';

const KEY = Symbol('avatar-group');

export type AvatarGroupContext = {
	/** The count of avatars in the group, on the screen or not. */
	readonly count: number;
	/** The count of avatars on the screen. `Infinity` without a limit. */
	readonly max: number;
	/** The count of avatars past the limit. */
	readonly overflow: number;
	/** Registers an avatar, and answers its place in the group. The returned function unregisters it. */
	register: (id: string) => () => void;
	/** The place of an avatar in the group, or -1 when it is not registered. */
	indexOf: (id: string) => number;
};

export function setAvatarGroupContext(context: AvatarGroupContext) {
	setContext(KEY, context);
}

export function getAvatarGroupContext(): AvatarGroupContext | undefined {
	return getContext<AvatarGroupContext | undefined>(KEY);
}

export function useAvatarGroupContext(part = 'Avatar'): AvatarGroupContext {
	const context = getAvatarGroupContext();
	if (!context) {
		throw new Error(`${part} must be used within Avatar.Group.`);
	}
	return context;
}
