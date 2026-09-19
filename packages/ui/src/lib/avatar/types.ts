import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLImgAttributes } from 'svelte/elements';
import type { AvatarStatus } from './root/context.js';

export type { AvatarContext, AvatarStatus } from './root/context.js';

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

export type AvatarImageProps = Omit<HTMLImgAttributes, 'class' | 'src' | 'alt'> & {
	/** The address of the image. Without it, the fallback shows. */
	src?: string | null;
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
