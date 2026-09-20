import type { ComponentProps } from 'svelte';
import type AvatarCountComponent from './count/avatar-count.svelte';
import type AvatarFallbackComponent from './fallback/avatar-fallback.svelte';
import type AvatarGroupComponent from './group/avatar-group.svelte';
import type AvatarImageComponent from './image/avatar-image.svelte';
import type AvatarRootComponent from './root/avatar-root.svelte';

export * as Avatar from './index.parts.js';

export { default as AvatarRoot } from './root/avatar-root.svelte';
export { default as AvatarImage } from './image/avatar-image.svelte';
export { default as AvatarFallback } from './fallback/avatar-fallback.svelte';
export { default as AvatarGroup } from './group/avatar-group.svelte';
export { default as AvatarCount } from './count/avatar-count.svelte';
export type AvatarRootProps = ComponentProps<typeof AvatarRootComponent>;
export type AvatarImageProps = ComponentProps<typeof AvatarImageComponent>;
export type AvatarFallbackProps = ComponentProps<typeof AvatarFallbackComponent>;
export type AvatarGroupProps = ComponentProps<typeof AvatarGroupComponent>;
export type AvatarCountProps = ComponentProps<typeof AvatarCountComponent>;
export type { AvatarCountState } from './types.js';
export {
	getAvatarGroupContext,
	setAvatarGroupContext,
	useAvatarGroupContext,
	type AvatarGroupContext
} from './group/context.js';
export {
	getAvatarContext,
	setAvatarContext,
	useAvatarContext,
	type AvatarContext,
	type AvatarStatus
} from './root/context.js';

import * as AvatarParts from './index.parts.js';
export default AvatarParts;
