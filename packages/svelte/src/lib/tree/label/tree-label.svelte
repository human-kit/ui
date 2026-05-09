<script lang="ts">
	import { onMount } from 'svelte';
	import { useTreeItemContext } from '../item/context';
	import { getTreeRenderMode } from '../root/render-mode';
	import type { TreeLabelProps } from '../types';

	let {
		children,
		class: className = '',
		id,
		...restProps
	}: TreeLabelProps = $props();

	const renderMode = getTreeRenderMode();
	const item = renderMode === 'display' ? useTreeItemContext() : undefined;
	const resolvedId = $derived(id ?? item?.getLabelId());

	let elementRef = $state<HTMLSpanElement | null>(null);

	onMount(() => {
		if (!item || !elementRef) return;

		elementRef.id = resolvedId ?? item.getLabelId();
		item.setLabelElement(elementRef);
		item.syncLabelText();

		const observer = new MutationObserver(() => {
			item.syncLabelText();
		});

		observer.observe(elementRef, {
			childList: true,
			characterData: true,
			subtree: true
		});

		return () => {
			observer.disconnect();
			if (item.getLabelElement() === elementRef) {
				item.setLabelElement(undefined);
			}
		};
	});
</script>

{#if renderMode === 'display'}
	<span bind:this={elementRef} id={resolvedId} data-tree-label="true" class={className} {...restProps}>
		{@render children?.()}
	</span>
{/if}
