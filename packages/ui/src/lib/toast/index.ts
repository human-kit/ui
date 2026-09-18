import type { ComponentProps } from 'svelte';
import type ToastActionComponent from './action/toast-action.svelte';
import type ToastCloseComponent from './close/toast-close.svelte';
import type ToastContentComponent from './content/toast-content.svelte';
import type ToastDescriptionComponent from './description/toast-description.svelte';
import type ToastProviderComponent from './provider/toast-provider.svelte';
import type ToastRootComponent from './root/toast-root.svelte';
import type ToastTitleComponent from './title/toast-title.svelte';
import type ToastViewportComponent from './viewport/toast-viewport.svelte';

export * as Toast from './index.parts.js';

export { default as ToastProvider } from './provider/toast-provider.svelte';
export { default as ToastViewport } from './viewport/toast-viewport.svelte';
export { default as ToastRoot } from './root/toast-root.svelte';
export { default as ToastContent } from './content/toast-content.svelte';
export { default as ToastTitle } from './title/toast-title.svelte';
export { default as ToastDescription } from './description/toast-description.svelte';
export { default as ToastClose } from './close/toast-close.svelte';
export { default as ToastAction } from './action/toast-action.svelte';
export type ToastProviderProps = ComponentProps<typeof ToastProviderComponent>;
export type ToastViewportProps = ComponentProps<typeof ToastViewportComponent>;
export type ToastRootProps = ComponentProps<typeof ToastRootComponent>;
export type ToastContentProps = ComponentProps<typeof ToastContentComponent>;
export type ToastTitleProps = ComponentProps<typeof ToastTitleComponent>;
export type ToastDescriptionProps = ComponentProps<typeof ToastDescriptionComponent>;
export type ToastCloseProps = ComponentProps<typeof ToastCloseComponent>;
export type ToastActionProps = ComponentProps<typeof ToastActionComponent>;
export {
	getToastProviderContext,
	setToastProviderContext,
	useToastManager,
	useToastProviderContext,
	type ToastProviderContext
} from './provider/context.js';
export {
	getToastContext,
	setToastContext,
	useToastContext,
	type ToastContext
} from './root/context.js';
export {
	createToastManager,
	DEFAULT_TOAST_LIMIT,
	DEFAULT_TOAST_TIMEOUT,
	type ToastItem,
	type ToastManager,
	type ToastOptions,
	type ToastPriority,
	type ToastPromiseOptions,
	type ToastStatus,
	type ToastUpdate
} from './provider/toast-manager.svelte.js';

import * as ToastParts from './index.parts.js';
export default ToastParts;
