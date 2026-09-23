<script lang="ts">
	import { untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import type { ToastProviderProps } from '../types.js';
	import { setToastProviderContext, type ToastProviderContext } from './context';
	import {
		createToastManager,
		DEFAULT_TOAST_LIMIT,
		DEFAULT_TOAST_TIMEOUT,
		type InternalToastManager
	} from './toast-manager.svelte';

	/**
	 * Toast.Provider — the list of toasts, and the manager that adds to it.
	 *
	 * Put one around the app, thus every toast lands in the same viewport. The manager is on
	 * `bind:manager` for the page, and on `useToastManager()` for a component under the provider.
	 * Give `manager` to share one list between two providers, such as an app and a dialog in it.
	 */
	let {
		timeout = DEFAULT_TOAST_TIMEOUT,
		limit = DEFAULT_TOAST_LIMIT,
		manager: managerProp = $bindable(),
		children
	}: ToastProviderProps = $props();

	const manager: InternalToastManager = untrack(
		() =>
			(managerProp as InternalToastManager | undefined) ??
			createToastManager({ timeout: () => timeout, limit: () => limit })
	);
	managerProp = manager;

	// A new limit takes effect on the toasts that are already there.
	$effect(() => {
		void limit;
		untrack(() => manager.syncLimit());
	});

	let hovering = $state(false);
	let focused = $state(false);
	let tapped = $state(false);
	let viewportElement = $state<HTMLElement | null>(null);
	const heights = new SvelteMap<string, number>();
	let focusAfterCloseHandler: ((id: string) => void) | null = null;

	const context: ToastProviderContext = {
		manager,
		get hovering() {
			return hovering;
		},
		get focused() {
			return focused;
		},
		get tapped() {
			return tapped;
		},
		get expanded() {
			return hovering || focused || tapped;
		},
		get viewportElement() {
			return viewportElement;
		},
		get heights() {
			return heights;
		},
		setHovering(value) {
			hovering = value;
		},
		setFocused(value) {
			focused = value;
		},
		setTapped(value) {
			tapped = value;
		},
		setViewportElement(element) {
			viewportElement = element;
		},
		// `untrack` because the root measures from an effect: reading the map here would make
		// that effect depend on what it writes.
		setHeight(id, height) {
			untrack(() => {
				if (height === null) heights.delete(id);
				else if (heights.get(id) !== height) heights.set(id, height);
			});
		},
		focusAfterClose(id) {
			focusAfterCloseHandler?.(id);
		},
		setFocusAfterClose(handler) {
			focusAfterCloseHandler = handler;
		}
	};

	setToastProviderContext(context);
</script>

{@render children?.()}
