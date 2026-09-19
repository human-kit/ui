import type { ComponentProps } from 'svelte';
import type BreadcrumbsEllipsisComponent from './ellipsis/breadcrumbs-ellipsis.svelte';
import type BreadcrumbsItemComponent from './item/breadcrumbs-item.svelte';
import type BreadcrumbsLinkComponent from './link/breadcrumbs-link.svelte';
import type BreadcrumbsListComponent from './list/breadcrumbs-list.svelte';
import type BreadcrumbsRootComponent from './root/breadcrumbs-root.svelte';
import type BreadcrumbsSeparatorComponent from './separator/breadcrumbs-separator.svelte';

export * as Breadcrumbs from './index.parts.js';

export { default as BreadcrumbsRoot } from './root/breadcrumbs-root.svelte';
export { default as BreadcrumbsList } from './list/breadcrumbs-list.svelte';
export { default as BreadcrumbsItem } from './item/breadcrumbs-item.svelte';
export { default as BreadcrumbsLink } from './link/breadcrumbs-link.svelte';
export { default as BreadcrumbsEllipsis } from './ellipsis/breadcrumbs-ellipsis.svelte';
export { default as BreadcrumbsSeparator } from './separator/breadcrumbs-separator.svelte';
export type BreadcrumbsRootProps = ComponentProps<typeof BreadcrumbsRootComponent>;
export type BreadcrumbsListProps = ComponentProps<typeof BreadcrumbsListComponent>;
export type BreadcrumbsItemProps = ComponentProps<typeof BreadcrumbsItemComponent>;
export type BreadcrumbsLinkProps = ComponentProps<typeof BreadcrumbsLinkComponent>;
export type BreadcrumbsEllipsisProps = ComponentProps<typeof BreadcrumbsEllipsisComponent>;
export {
	getBreadcrumbsContext,
	setBreadcrumbsContext,
	useBreadcrumbsContext,
	type BreadcrumbsContext
} from './root/context.js';
export type BreadcrumbsSeparatorProps = ComponentProps<typeof BreadcrumbsSeparatorComponent>;

import * as BreadcrumbsParts from './index.parts.js';
export default BreadcrumbsParts;
