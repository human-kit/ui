import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLImgAttributes } from 'svelte/elements';
import type { AvatarStatus } from './root/context.js';

export type { AvatarContext, AvatarStatus } from './root/context.js';
export type { AvatarGroupContext } from './group/context.js';

export type AvatarGroupProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'class' | 'role'
> & {
	/** The avatars, and an `Avatar.Count` for the ones past `max`. */
	children?: Snippet;
	/** The CSS class names of the element. */
	class?: string;
	/**
	 * The count of avatars on the screen. The ones past it render nothing, and `Avatar.Count`
	 * says how many they are. Without it, every avatar is on the screen.
	 */
	max?: number;
	/**
	 * The name of the group, such as "Assignees". A group with no name is a group a screen
	 * reader cannot tell apart from the content around it.
	 */
	'aria-label'?: string;
	/** The group element. Use `bind:element` to read it. */
	element?: HTMLDivElement | null;
};

export type AvatarCountState = {
	/** The count of avatars past `max`. */
	overflow: number;
	/** The count of avatars in the group. */
	count: number;
	/** The limit of the group. */
	max: number;
};

export type AvatarCountProps = Omit<
	HTMLAttributes<HTMLSpanElement>,
	'children' | 'class' | 'aria-label'
> & {
	/** The content in place of `+N`. It gets the overflow, the count and the limit. */
	children?: Snippet<[AvatarCountState]>;
	/** The CSS class names of the element. */
	class?: string;
	/** The name for the screen reader. Without it, "N more" in the locale of `LocaleProvider`. */
	'aria-label'?: string;
	/** The count element, while it is on the screen. Use `bind:element` to read it. */
	element?: HTMLSpanElement | null;
};

export type AvatarRootProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'class'> & {
	/** `Avatar.Image` and `Avatar.Fallback`. */
	children?: Snippet;
	/** The CSS class names of the element. */
	class?: string;
	/** The root element. Use `bind:element` to read it. */
	element?: HTMLSpanElement | null;
	/** Called when the image starts to load, loads, or fails. */
	onStatusChange?: (status: AvatarStatus) => void;
};

export type AvatarImageProps = Omit<HTMLImgAttributes, 'class' | 'src' | 'alt' | 'loading'> & {
	/** The address of the image. Without it, the fallback shows. */
	src?: string | null;
	/**
	 * `lazy` starts the load when the avatar comes into view, and not on mount. Use it on a long
	 * list of avatars, thus the ones below the fold do not all load at once.
	 */
	loading?: 'eager' | 'lazy';
	/**
	 * The text in place of the image. Give the name of the person or the thing. Give an empty
	 * string when the name is beside the avatar already, thus a screen reader does not read it
	 * twice.
	 */
	alt: string;
	/** The CSS class names of the element. */
	class?: string;
	/** The image element, once the image is on the screen. Use `bind:element` to read it. */
	element?: HTMLImageElement | null;
};

export type AvatarFallbackProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'class'> & {
	/** The content in place of the image, such as initials or an icon. */
	children?: Snippet;
	/** The CSS class names of the element. */
	class?: string;
	/**
	 * The time in milliseconds before the fallback shows while the image loads. A fallback that
	 * flashes before a fast image is noise: 300 or 600 hides it on a good connection. It shows at
	 * once when the image fails, or when there is no image.
	 */
	delay?: number;
	/** The fallback element, while it is on the screen. Use `bind:element` to read it. */
	element?: HTMLSpanElement | null;
};
