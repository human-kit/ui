<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setContext } from 'svelte';
	import { TAG_CONTEXT_KEY, type TagContext } from './combobox-tag.svelte';

	/**
	 * Internal component that provides tag context for each iteration.
	 */
	type TagContextProviderProps = {
		id: string | number;
		label: string;
		remove: () => void;
		disabled: boolean;
		children: Snippet;
	};

	let { id, label, remove, disabled, children }: TagContextProviderProps = $props();

	// Set context for Tag and TagRemove children
	setContext<TagContext>(TAG_CONTEXT_KEY, {
		get id() {
			return id;
		},
		get label() {
			return label;
		},
		get remove() {
			return remove;
		},
		get disabled() {
			return disabled;
		}
	});
</script>

{@render children()}
