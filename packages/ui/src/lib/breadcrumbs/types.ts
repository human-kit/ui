import type { Snippet } from 'svelte';
import type {
	HTMLAnchorAttributes,
	HTMLAttributes,
	HTMLButtonAttributes,
	HTMLOlAttributes
} from 'svelte/elements';

export type { BreadcrumbsContext } from './root/context.js';

export type BreadcrumbsRootProps = Omit<HTMLAttributes<HTMLElement>, 'children' | 'class'> & {
	/** `Breadcrumbs.List`. */
	children?: Snippet;
	/** The CSS class names of the element. */
	class?: string;
	/**
	 * The name of the landmark. Without it, the name is "Breadcrumb" in the locale of
	 * `LocaleProvider`. Give one when the page has two sets of breadcrumbs.
	 */
	'aria-label'?: string;
	/**
	 * The count of items past which the middle of the trail folds behind a `Breadcrumbs.Ellipsis`.
	 * The first item and the last `maxItems - 1` stay in view. Without it, every item is in view.
	 */
	maxItems?: number;
	/** True once the user unfolds the trail. Use `bind:expanded` to read it, or to fold it again. */
	expanded?: boolean;
	/** Called when the trail unfolds or folds. */
	onExpandedChange?: (expanded: boolean) => void;
	/** The `<nav>` element. Use `bind:element` to read it. */
	element?: HTMLElement | null;
};

export type BreadcrumbsListProps = Omit<HTMLOlAttributes, 'children' | 'class' | 'role'> & {
	/** The items. */
	children?: Snippet;
	/** The CSS class names of the element. */
	class?: string;
	/** The `<ol>` element. Use `bind:element` to read it. */
	element?: HTMLOListElement | null;
};

export type BreadcrumbsItemProps = Omit<HTMLAttributes<HTMLLIElement>, 'children' | 'class'> & {
	/** `Breadcrumbs.Link`, and a `Breadcrumbs.Separator` after it. */
	children?: Snippet;
	/** The CSS class names of the element. */
	class?: string;
	/** The `<li>` element. Use `bind:element` to read it. */
	element?: HTMLLIElement | null;
};

export type BreadcrumbsLinkProps = Omit<
	HTMLAnchorAttributes,
	'children' | 'class' | 'href' | 'aria-current' | 'aria-disabled'
> & {
	/** The text of the link. */
	children?: Snippet;
	/** The CSS class names of the element. */
	class?: string;
	/** The address of the page. Without it, the link is plain text. */
	href?: string;
	/**
	 * Marks the page the user is on. The link gets `aria-current="page"`. Set it on the last
	 * item: a screen reader user then knows where the trail ends.
	 */
	current?: boolean;
	/** Takes the link out of use: it keeps its text, and it loses its `href` and its tab stop. */
	disabled?: boolean;
	/** The `<a>` element, or the `<span>` without an `href`. Use `bind:element` to read it. */
	element?: HTMLAnchorElement | HTMLSpanElement | null;
};

export type BreadcrumbsEllipsisProps = Omit<
	HTMLButtonAttributes,
	'children' | 'class' | 'type' | 'aria-label'
> & {
	/** The content of the button. Three dots without children. */
	children?: Snippet;
	/** The CSS class names of the button. */
	class?: string;
	/** The CSS class names of the `<li>` around the button. */
	itemClass?: string;
	/** The sign after the button, such as a `Breadcrumbs.Separator`. */
	separator?: Snippet;
	/** The name of the button. Without it, "Show N more pages" in the locale of `LocaleProvider`. */
	'aria-label'?: string;
	/** The button element, while the trail is folded. Use `bind:element` to read it. */
	element?: HTMLButtonElement | null;
};

export type BreadcrumbsSeparatorProps = Omit<
	HTMLAttributes<HTMLSpanElement>,
	'children' | 'class' | 'aria-hidden'
> & {
	/** The sign between two items. A slash without children. */
	children?: Snippet;
	/** The CSS class names of the element. */
	class?: string;
	/** The `<span>` element. Use `bind:element` to read it. */
	element?: HTMLSpanElement | null;
};
