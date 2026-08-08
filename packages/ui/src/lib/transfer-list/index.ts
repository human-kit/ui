import type { ComponentProps } from 'svelte';
import type TransferListRootComponent from './root/transfer-list-root.svelte';
import type TransferListSourceComponent from './list/transfer-list-source.svelte';
import type TransferListTargetComponent from './list/transfer-list-target.svelte';
import type TransferListItemComponent from './item/transfer-list-item.svelte';
import type TransferListMoveSelectedComponent from './move/transfer-list-move-selected.svelte';
import type TransferListMoveAllComponent from './move/transfer-list-move-all.svelte';
import type TransferListMoveUpComponent from './move/transfer-list-move-up.svelte';
import type TransferListMoveDownComponent from './move/transfer-list-move-down.svelte';
import type TransferListStatusComponent from './status/transfer-list-status.svelte';

// Namespace export for component composition: <TransferList.Root>, <TransferList.Source>, etc.
export * as TransferList from './index.parts.js';

// Direct named exports for individual imports
export { default as TransferListRoot } from './root/transfer-list-root.svelte';
export { default as TransferListSource } from './list/transfer-list-source.svelte';
export { default as TransferListTarget } from './list/transfer-list-target.svelte';
export { default as TransferListItem } from './item/transfer-list-item.svelte';
export { default as TransferListMoveSelected } from './move/transfer-list-move-selected.svelte';
export { default as TransferListMoveAll } from './move/transfer-list-move-all.svelte';
export { default as TransferListMoveUp } from './move/transfer-list-move-up.svelte';
export { default as TransferListMoveDown } from './move/transfer-list-move-down.svelte';
export { default as TransferListStatus } from './status/transfer-list-status.svelte';

export type TransferListRootProps = ComponentProps<typeof TransferListRootComponent>;
export type TransferListSourceProps = ComponentProps<typeof TransferListSourceComponent>;
export type TransferListTargetProps = ComponentProps<typeof TransferListTargetComponent>;
export type TransferListItemProps = ComponentProps<typeof TransferListItemComponent>;
export type TransferListMoveSelectedProps = ComponentProps<
	typeof TransferListMoveSelectedComponent
>;
export type TransferListMoveAllProps = ComponentProps<typeof TransferListMoveAllComponent>;
export type TransferListMoveUpProps = ComponentProps<typeof TransferListMoveUpComponent>;
export type TransferListMoveDownProps = ComponentProps<typeof TransferListMoveDownComponent>;
export type TransferListStatusProps = ComponentProps<typeof TransferListStatusComponent>;

// Context and types
export {
	setTransferListContext,
	useTransferListContext,
	useTransferListSide,
	type TransferListContext
} from './root/context.js';
export {
	oppositeSide,
	type TransferListKey,
	type TransferListMoveDetails,
	type TransferListSide
} from './root/types.js';

// Default export as namespace object
import * as TransferListParts from './index.parts.js';
export default TransferListParts;
