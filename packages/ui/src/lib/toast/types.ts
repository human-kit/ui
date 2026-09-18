import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { ToastItem, ToastManager } from './provider/toast-manager.svelte.js';
import type { SwipeSide } from '../primitives/swipe-gesture.js';

export type {
	ToastItem,
	ToastManager,
	ToastOptions,
	ToastPriority,
	ToastPromiseOptions,
	ToastStatus,
	ToastUpdate
} from './provider/toast-manager.svelte.js';

export type ToastProviderProps = {
	/** The default time a toast stays, in milliseconds. `0` keeps each toast until a close. */
	timeout?: number;
	/**
	 * The count of toasts on the screen. The older ones past it wait behind, hidden and inert,
	 * with their timers stopped, and they come forward as the newer ones close.
	 */
	limit?: number;
	/**
	 * The manager: `add`, `update`, `close` and `promise`. Use `bind:manager` to read it in the
	 * page, or give one to share a list of toasts between two providers.
	 */
	manager?: ToastManager;
	/** The app, with a `Toast.Viewport` somewhere in it. */
	children?: Snippet;
};

export type ToastViewportProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'class' | 'role' | 'tabindex'
> & {
	/** The toast to render for each item. It gets the item; render a `Toast.Root` with it. */
	children: Snippet<[ToastItem]>;
	/** The CSS class names of the element. */
	class?: string;
	/**
	 * Renders the viewport at the end of `<body>`, thus it draws above the page. Set it to
	 * `false` to render it in place.
	 */
	portal?: boolean;
	/** The bindable viewport element. */
	element?: HTMLDivElement | null;
};

export type ToastRootProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'class' | 'role' | 'tabindex' | 'id'
> & {
	/** The item from `Toast.Viewport`. */
	toast: ToastItem;
	/** The parts of the toast. */
	children?: Snippet;
	/** The CSS class names of the element. */
	class?: string;
	/**
	 * The sides a swipe can push the toast out through: `bottom` and `right` by default. One side
	 * per axis counts. An empty array turns the swipe off. A swipe on `Toast.Close` or
	 * `Toast.Action` never starts.
	 */
	swipeDirection?: SwipeSide[];
	/** The bindable toast element. */
	element?: HTMLDivElement | null;
};

export type ToastPositionerProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
	/** The item from `Toast.Viewport`. */
	toast: ToastItem;
	/** The `Toast.Root`. */
	children?: Snippet;
	/** The CSS class names of the element. */
	class?: string;
	/** The bindable positioner element. */
	element?: HTMLDivElement | null;
};

export type ToastContentProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
	/** The title and the description. */
	children?: Snippet;
	/** The CSS class names of the element. */
	class?: string;
};

export type ToastTitleProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'id'> & {
	/** The title. Without children, it shows the `title` of the item. */
	children?: Snippet;
	/** The CSS class names of the element. */
	class?: string;
	/** The id of the element. The component makes one when you give none. */
	id?: string;
};

export type ToastDescriptionProps = Omit<
	HTMLAttributes<HTMLParagraphElement>,
	'children' | 'class' | 'id'
> & {
	/** The description. Without children, it shows the `description` of the item. */
	children?: Snippet;
	/** The CSS class names of the element. */
	class?: string;
	/** The id of the element. The component makes one when you give none. */
	id?: string;
};

export type ToastCloseProps = Omit<HTMLButtonAttributes, 'type' | 'class' | 'children'> & {
	/** The name on the button. */
	children?: Snippet;
	/** The CSS class names of the element. */
	class?: string;
	/** The bindable button element. */
	element?: HTMLButtonElement | null;
};

export type ToastActionProps = Omit<HTMLButtonAttributes, 'type' | 'class' | 'children'> & {
	/** The name on the button. */
	children?: Snippet;
	/** The CSS class names of the element. */
	class?: string;
	/** Keeps the toast open after the press. By default, the press closes it. */
	keepOpen?: boolean;
	/** The bindable button element. */
	element?: HTMLButtonElement | null;
};
